
import { GameState, Tamer, MonsterInstance, BattleRewards, InventoryItem, Language, FactionType } from '../domain/types';
import { MONSTER_DATA } from '../data/monsters';
import { ITEM_DATA } from '../data/items';
import { QUEST_DATA } from '../data/quests';
import { gameEvents as bus } from './EventBus';
import { addExpToMonster, addExpToTamer, createMonsterInstance, addToInventory, rollLoot, calculateCaptureChance, checkEvolution, transformMonster, unlockNode, consumeItem } from '../domain/logic';
import { SaveManager, SaveResult } from '../save/SaveManager';
import { gameRNG } from '../domain/RNG';
import { getFactionDiscount } from '../localization/strings';

const INITIAL_STATE: GameState = {
  version: 1,
  tamer: {
    name: 'Tamer Zero',
    level: 1,
    exp: 0,
    party: [
      createMonsterInstance('pyrocat', 5)
    ],
    storage: [],
    gold: 150,
    inventory: [
      { itemId: 'capture_orb', quantity: 5 }
    ],
    unlockedPartySlots: 1,
    unlockedSupportSkills: ['cheer'],
    collection: ['pyrocat']
  },
  worldPosition: { x: 400, y: 300 },
  currentScene: 'BootScene',
  flags: {},
  gameTime: 1200,
  completedQuests: [],
  reputation: {
    [FactionType.EMBER_CLAN]: 0,
    [FactionType.TIDE_WATCHERS]: 0,
    [FactionType.STORM_HERDERS]: 0,
    [FactionType.GLOOM_STALKERS]: 0,
    [FactionType.GLADE_KEEPERS]: 0,
  },
  language: (navigator.language.startsWith('ko') ? 'ko' : 'en') as Language
};

class GameStateManager {
  private state: GameState;

  constructor() {
    const loadResult = SaveManager.load();
    this.state = loadResult.ok ? loadResult.state : { ...INITIAL_STATE };
    if (!loadResult.ok && 'reason' in loadResult && loadResult.reason !== 'no_save') {
      console.warn(`[GameStateManager] Failed to load save: ${loadResult.reason}`);
    }
    if (!this.state.language) {
      this.state.language = (navigator.language.startsWith('ko') ? 'ko' : 'en') as Language;
    }
    // Migration for reputation field
    if (!this.state.reputation) {
      this.state.reputation = { ...INITIAL_STATE.reputation };
    }
  }

  getState() {
    return this.state;
  }

  setLanguage(lang: Language) {
    this.updateState({ language: lang });
  }

  updateTime(delta: number) {
    this.state.gameTime = (this.state.gameTime + delta) % 2400;
  }

  updateState(patch: Partial<GameState>) {
    this.state = { ...this.state, ...patch };
    this.checkQuests();
    this.autoSave();
    bus.emitEvent({ type: 'STATE_UPDATED', state: this.state });
  }

  updateReputation(faction: FactionType, delta: number) {
    this.state.reputation[faction] = (this.state.reputation[faction] || 0) + delta;
    bus.emitEvent({
      type: 'REPUTATION_CHANGED',
      faction,
      delta,
      total: this.state.reputation[faction]
    });
    this.updateState({});
  }

  getEffectivePrice(itemId: string): number {
    const item = ITEM_DATA[itemId];
    let maxDiscount = 0;
    Object.values(this.state.reputation).forEach(val => {
      maxDiscount = Math.max(maxDiscount, getFactionDiscount(val));
    });

    return Math.floor(item.price * (1 - maxDiscount));
  }

  buyItem(itemId: string, quantity: number): boolean {
    const totalCost = this.getEffectivePrice(itemId) * quantity;
    if (this.state.tamer.gold < totalCost) return false;

    this.state.tamer.gold -= totalCost;
    this.state.tamer.inventory = addToInventory(this.state.tamer.inventory, itemId, quantity);
    this.updateState({});
    return true;
  }

  sellItem(itemId: string, quantity: number): boolean {
    const item = ITEM_DATA[itemId];
    const invItem = this.state.tamer.inventory.find(i => i.itemId === itemId);
    if (!invItem || invItem.quantity < quantity) return false;

    this.state.tamer.gold += Math.floor(item.price * 0.5) * quantity;
    this.state.tamer.inventory = consumeItem(this.state.tamer.inventory, itemId, quantity);
    this.updateState({});
    return true;
  }

  checkQuests() {
    QUEST_DATA.forEach(quest => {
      if (this.state.completedQuests.includes(quest.id)) return;

      let satisfied = true;
      if (quest.requiredLevel && this.state.tamer.level < quest.requiredLevel) satisfied = false;
      if (quest.requiredFlag && !this.state.flags[quest.requiredFlag]) satisfied = false;

      if (quest.id === 'first_capture' && this.state.tamer.collection.length < 2) satisfied = false;
      if (quest.id === 'collector_beginner' && this.state.tamer.collection.length < 3) satisfied = false;
      if (quest.id === 'gold_saver' && this.state.tamer.gold < 1000) satisfied = false;

      if (satisfied) {
        this.completeQuest(quest.id);
      }
    });
  }

  completeQuest(questId: string) {
    const quest = QUEST_DATA.find(q => q.id === questId);
    if (!quest || this.state.completedQuests.includes(questId)) return;

    this.state.completedQuests.push(questId);
    this.state.tamer.gold += quest.rewardGold;
    const { tamer } = addExpToTamer(this.state.tamer, quest.rewardExp);
    this.state.tamer = tamer;

    if (quest.rewardItems) {
      quest.rewardItems.forEach(ri => {
        this.state.tamer.inventory = addToInventory(this.state.tamer.inventory, ri.itemId, ri.quantity);
      });
    }

    bus.emitEvent({ type: 'QUEST_COMPLETED', questId });
    bus.emitEvent({ type: 'STATE_UPDATED', state: this.state });
  }

  unlockSkillNode(monsterUid: string, nodeId: string) {
    const partyIndex = this.state.tamer.party.findIndex(m => m.uid === monsterUid);
    if (partyIndex !== -1) {
      const monster = this.state.tamer.party[partyIndex];
      const updated = unlockNode(monster, nodeId);
      if (updated !== monster) {
        const newParty = [...this.state.tamer.party];
        newParty[partyIndex] = updated;
        this.state.tamer = { ...this.state.tamer, party: newParty };
        this.autoSave();
        bus.emitEvent({ type: 'STATE_UPDATED', state: this.state });
        bus.emitEvent({ type: 'SKILL_UNLOCKED', monsterUid, nodeId });
      }
    }
  }

  evolveMonster(monsterUid: string, targetSpeciesId: string) {
    const partyIndex = this.state.tamer.party.findIndex(m => m.uid === monsterUid);
    if (partyIndex !== -1) {
      const monster = this.state.tamer.party[partyIndex];
      const species = MONSTER_DATA[monster.speciesId];
      const evolution = species.evolutions?.find(ev => ev.targetSpeciesId === targetSpeciesId);

      if (evolution?.requiredItemId) {
        this.state.tamer.inventory = consumeItem(this.state.tamer.inventory, evolution.requiredItemId, 1);
      }

      const evolved = transformMonster(monster, targetSpeciesId);
      const newParty = [...this.state.tamer.party];
      newParty[partyIndex] = evolved;
      this.state.tamer = { ...this.state.tamer, party: newParty };

      if (!this.state.tamer.collection.includes(targetSpeciesId)) {
        this.state.tamer.collection.push(targetSpeciesId);
      }

      this.state.flags['evolved_once'] = true;
      this.autoSave();
      this.updateState({});
    }
  }

  attemptCapture(enemySpeciesId: string, enemyLevel: number, currentHp: number, maxHp: number): boolean {
    const inv = this.state.tamer.inventory;
    const orbIndex = inv.findIndex(i => i.itemId === 'capture_orb');
    if (orbIndex === -1 || inv[orbIndex].quantity <= 0) return false;

    const newInventory = [...inv];
    newInventory[orbIndex] = { ...newInventory[orbIndex], quantity: newInventory[orbIndex].quantity - 1 };
    this.state.tamer.inventory = newInventory.filter(i => i.quantity > 0);

    const chance = calculateCaptureChance(enemySpeciesId, currentHp, maxHp);
    const success = gameRNG.chance(chance);

    if (success) {
      const monster = createMonsterInstance(enemySpeciesId, enemyLevel);
      if (this.state.tamer.party.length < this.state.tamer.unlockedPartySlots) {
        this.state.tamer.party.push(monster);
      } else {
        this.state.tamer.storage.push(monster);
      }

      if (!this.state.tamer.collection.includes(enemySpeciesId)) {
        this.state.tamer.collection.push(enemySpeciesId);
      }

      const enemyData = MONSTER_DATA[enemySpeciesId];
      if (enemyData) {
        this.updateReputation(enemyData.faction, 5);
      }

      bus.emitEvent({ type: 'MONSTER_CAPTURED', monster });
    }

    this.autoSave();
    this.updateState({});
    return success;
  }

  grantRewards(enemySpeciesId: string, enemyLevel: number, isBoss: boolean = false) {
    const rewards = rollLoot(enemySpeciesId, gameRNG);
    const enemyData = MONSTER_DATA[enemySpeciesId];

    if (isBoss) {
      rewards.exp *= 5;
      rewards.gold *= 10;
      this.state.flags[`boss_${enemySpeciesId}_defeated`] = true;
      if (this.state.tamer.party[0]) {
        const leadFaction = MONSTER_DATA[this.state.tamer.party[0].speciesId]?.faction;
        if (leadFaction) this.updateReputation(leadFaction, 20);
      }
    } else {
      if (enemyData) {
        this.updateReputation(enemyData.faction, -1);
      }
      if (this.state.tamer.party[0]) {
        const leadFaction = MONSTER_DATA[this.state.tamer.party[0].speciesId]?.faction;
        if (leadFaction) this.updateReputation(leadFaction, 1);
      }
    }

    const levelMult = 1 + (enemyLevel - 1) * 0.1;
    rewards.exp = Math.floor(rewards.exp * levelMult);
    rewards.gold = Math.floor(rewards.gold * levelMult);

    if (this.state.tamer.party.length > 0) {
      this.grantExp(this.state.tamer.party[0].uid, rewards.exp);
    }

    const { tamer: newTamer, leveledUp } = addExpToTamer(this.state.tamer, rewards.exp);
    newTamer.gold += rewards.gold;

    let updatedInventory = [...newTamer.inventory];
    for (const item of rewards.items) {
      updatedInventory = addToInventory(updatedInventory, item.itemId, item.quantity);
    }
    newTamer.inventory = updatedInventory;

    if (enemySpeciesId === 'lunacat') {
      this.state.flags['lunacat_defeated'] = true;
    }

    this.state.tamer = newTamer;
    this.updateState({});

    bus.emitEvent({ type: 'REWARD_EARNED', rewards });
    if (leveledUp) {
      bus.emitEvent({ type: 'TAMER_LEVEL_UP', level: newTamer.level });
    }
  }

  grantExp(monsterUid: string, amount: number) {
    const partyIndex = this.state.tamer.party.findIndex(m => m.uid === monsterUid);
    if (partyIndex !== -1) {
      const { monster, leveledUp } = addExpToMonster(this.state.tamer.party[partyIndex], amount, this.state);
      const newParty = [...this.state.tamer.party];
      newParty[partyIndex] = monster;
      this.state.tamer = { ...this.state.tamer, party: newParty };
      if (leveledUp) {
        const evolutionOptions = checkEvolution(monster, this.state);
        if (evolutionOptions.length > 0) {
          bus.emitEvent({ type: 'EVOLUTION_READY', monsterUid, options: evolutionOptions });
        }
      }
      this.autoSave();
      bus.emitEvent({ type: 'STATE_UPDATED', state: this.state });
    }
  }

  addGold(amount: number) {
    this.state.tamer.gold += amount;
    this.updateState({});
  }

  addDebugMonster(speciesId: string) {
    const monster = createMonsterInstance(speciesId, 10);
    this.state.tamer.party.push(monster);
    if (!this.state.tamer.collection.includes(speciesId)) {
      this.state.tamer.collection.push(speciesId);
    }
    this.updateState({});
  }

  autoSave() {
    const result = SaveManager.save(this.state);
    if (!result.ok && 'reason' in result) {
      console.warn(`[GameStateManager] Auto-save failed: ${result.reason}`);
    }
  }

  manualSave(): SaveResult {
    return SaveManager.save(this.state);
  }

  manualLoad(): boolean {
    const loadResult = SaveManager.load();
    if (loadResult.ok) {
      this.state = loadResult.state;
      bus.emitEvent({ type: 'STATE_UPDATED', state: this.state });
      return true;
    }
    return false;
  }

  hasSave(): boolean {
    return localStorage.getItem('eontamers_save_v1') !== null;
  }

  useItem(itemId: string, targetMonsterUid?: string): { success: boolean; message: string; healed?: number } {
    const itemDef = ITEM_DATA[itemId];
    if (!itemDef) {
      return { success: false, message: 'Unknown item' };
    }

    // Check inventory
    const invItem = this.state.tamer.inventory.find(i => i.itemId === itemId);
    if (!invItem || invItem.quantity < 1) {
      return { success: false, message: 'No items remaining' };
    }

    // Handle Healing items
    if (itemDef.category === 'Healing') {
      // Find target monster (default to first party member)
      const targetUid = targetMonsterUid || (this.state.tamer.party[0]?.uid);
      const partyIndex = this.state.tamer.party.findIndex(m => m.uid === targetUid);

      if (partyIndex === -1) {
        return { success: false, message: 'No monster available' };
      }

      const monster = this.state.tamer.party[partyIndex];
      const maxHp = monster.currentStats.maxHp;

      // Check if HP is already full
      if (monster.currentHp >= maxHp) {
        return { success: false, message: 'HP is already full' };
      }

      // Calculate heal amount
      const healAmount = itemDef.power;
      const newHp = Math.min(maxHp, monster.currentHp + healAmount);
      const actualHealed = newHp - monster.currentHp;

      // Update monster HP
      const newParty = [...this.state.tamer.party];
      newParty[partyIndex] = { ...monster, currentHp: newHp };

      // Consume item
      this.state.tamer.inventory = consumeItem(this.state.tamer.inventory, itemId, 1);
      this.state.tamer = { ...this.state.tamer, party: newParty };

      // Trigger state update
      this.updateState({});

      // Debug logging
      console.log(`[useItem] Used ${itemDef.name} on monster, healed ${Math.round(actualHealed)} HP (${Math.round(monster.currentHp)} → ${Math.round(newHp)})`);

      return {
        success: true,
        message: `Restored ${Math.round(actualHealed)} HP!`,
        healed: actualHealed
      };
    }

    // Other item types can be added here
    return { success: false, message: 'Item cannot be used here' };
  }

  healParty() {
    this.state.tamer.party.forEach(m => { m.currentHp = m.currentStats.maxHp; });
    this.autoSave();
    bus.emitEvent({ type: 'STATE_UPDATED', state: this.state });
  }
}

export const gameStateManager = new GameStateManager();
