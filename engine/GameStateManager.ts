
import { GameState, Tamer, MonsterInstance, BattleRewards, InventoryItem, Language, FactionType, EvolutionOption } from '../domain/types';
import { MONSTER_DATA } from '../data/monsters';
import { ITEM_DATA } from '../data/items';
import { CHARACTER_DATA } from '../data/characters';
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
    party: [],
    storage: [],
    gold: 150,
    inventory: [
      { itemId: 'capture_orb', quantity: 5 }
    ],
    unlockedPartySlots: 6,
    unlockedSupportSkills: ['cheer'],
    collection: []
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
    if (!this.state.reputation) {
      this.state.reputation = { ...INITIAL_STATE.reputation };
    }

    if (!this.state.shopStock || !this.state.shopNextRefresh) {
      this.refreshShopStock();
    } else {
      this.checkShopRefresh();
    }
  }

  refreshShopStock() {
    const allItems = Object.keys(ITEM_DATA).filter(id => {
      const item = ITEM_DATA[id];
      return item.category !== 'Material';
    });

    const shuffled = [...allItems].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);

    const refreshInterval = 4 * 60 * 60 * 1000;
    this.state.shopStock = selected;
    this.state.shopNextRefresh = Date.now() + refreshInterval;
    this.updateState({});
  }

  checkShopRefresh() {
    if (this.state.shopNextRefresh && Date.now() > this.state.shopNextRefresh) {
      this.refreshShopStock();
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
    const item = ITEM_DATA[itemId];
    if (!item) return false;

    if (item.factionLock) {
      const rep = this.state.reputation[item.factionLock] || 0;
      if (rep < 100) return false;
    }

    if (item.requiredMaterials) {
      for (const mat of item.requiredMaterials) {
        const invMat = this.state.tamer.inventory.find(i => i.itemId === mat.itemId);
        if (!invMat || invMat.quantity < mat.quantity * quantity) return false;
      }
    }

    const totalCost = this.getEffectivePrice(itemId) * quantity;
    if (this.state.tamer.gold < totalCost) return false;

    this.state.tamer.gold -= totalCost;
    if (item.requiredMaterials) {
      item.requiredMaterials.forEach(mat => {
        this.state.tamer.inventory = consumeItem(this.state.tamer.inventory, mat.itemId, mat.quantity * quantity);
      });
    }

    this.state.tamer.inventory = addToInventory(this.state.tamer.inventory, itemId, quantity);
    this.updateState({});
    return true;
  }

  useItem(itemId: string): { success: boolean, message: string } {
    const item = ITEM_DATA[itemId];
    if (!item) return { success: false, message: 'Item not found' };

    const invItem = this.state.tamer.inventory.find(i => i.itemId === itemId);
    if (!invItem || invItem.quantity <= 0) return { success: false, message: 'No more items' };

    if (item.category === 'Healing') {
      const activeMonster = this.state.tamer.party[0];
      if (!activeMonster) return { success: false, message: 'No monster to heal' };
      if (activeMonster.currentHp >= activeMonster.currentStats.maxHp) return { success: false, message: 'HP is already full' };

      activeMonster.currentHp = Math.min(activeMonster.currentStats.maxHp, activeMonster.currentHp + (item.stats?.hp || 20));
      this.state.tamer.inventory = consumeItem(this.state.tamer.inventory, itemId, 1);
      this.updateState({});
      return { success: true, message: `${item.name} used!` };
    }

    return { success: false, message: 'Cannot use this item here' };
  }

  attemptCapture(enemySpeciesId: string, enemyLevel: number, currentHp: number, maxHp: number): boolean {
    const inv = this.state.tamer.inventory;
    const orbIndex = inv.findIndex(i => i.itemId === 'capture_orb');
    if (orbIndex === -1 || inv[orbIndex].quantity <= 0) return false;

    this.state.tamer.inventory = consumeItem(this.state.tamer.inventory, 'capture_orb', 1);

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
    }

    this.updateState({});
    return success;
  }

  startNewGame(characterId: string, starterSpeciesId: string): void {
    const char = CHARACTER_DATA[characterId];
    if (!char) return;

    this.state.tamer = {
      name: char.name,
      level: 1,
      exp: 0,
      gold: 200,
      characterId: characterId,
      party: [],
      storage: [],
      inventory: [
        { itemId: 'potion', quantity: 3 },
        { itemId: 'capture_orb', quantity: 5 }
      ],
      unlockedPartySlots: 6,
      unlockedSupportSkills: ['cheer'],
      collection: [starterSpeciesId]
    };

    const monster = createMonsterInstance(starterSpeciesId, 5);
    this.state.tamer.party.push(monster);

    this.state.flags['game_started'] = true;
    this.state.worldPosition = { x: 400, y: 300 };

    this.save();
    bus.emitEvent({ type: 'STATE_UPDATED', state: this.state });
  }

  checkQuests() {
    QUEST_DATA.forEach(quest => {
      if (this.state.completedQuests.includes(quest.id)) return;
      let satisfied = true;
      if (quest.requiredLevel && this.state.tamer.level < quest.requiredLevel) satisfied = false;
      if (quest.requiredFlag && !this.state.flags[quest.requiredFlag]) satisfied = false;
      if (satisfied) this.completeQuest(quest.id);
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
    this.updateState({});
  }

  grantRewards(enemySpeciesId: string, enemyLevel: number, isBoss: boolean = false) {
    const rewards = rollLoot(enemySpeciesId, gameRNG);
    const enemyData = MONSTER_DATA[enemySpeciesId];

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

    this.state.tamer = newTamer;
    this.updateState({});
    bus.emitEvent({ type: 'REWARD_EARNED', rewards });
  }

  grantExp(monsterUid: string, amount: number) {
    const partyIndex = this.state.tamer.party.findIndex(m => m.uid === monsterUid);
    if (partyIndex !== -1) {
      const { monster, leveledUp } = addExpToMonster(this.state.tamer.party[partyIndex], amount, this.state);
      this.state.tamer.party[partyIndex] = monster;
      if (leveledUp) {
        const options = checkEvolution(monster, this.state);
        if (options.length > 0) {
          bus.emitEvent({ type: 'EVOLUTION_READY', monsterUid, options });
        }
      }
      this.updateState({});
    }
  }

  evolveMonster(monsterUid: string, targetSpeciesId: string) {
    const partyIndex = this.state.tamer.party.findIndex(m => m.uid === monsterUid);
    if (partyIndex !== -1) {
      const monster = this.state.tamer.party[partyIndex];
      const evolved = transformMonster(monster, targetSpeciesId);
      this.state.tamer.party[partyIndex] = evolved;
      if (!this.state.tamer.collection.includes(targetSpeciesId)) {
        this.state.tamer.collection.push(targetSpeciesId);
      }
      this.updateState({});
    }
  }

  unlockSkillNode(monsterUid: string, nodeId: string) {
    const partyIndex = this.state.tamer.party.findIndex(m => m.uid === monsterUid);
    if (partyIndex !== -1) {
      const monster = this.state.tamer.party[partyIndex];
      const updated = unlockNode(monster, nodeId);
      this.state.tamer.party[partyIndex] = updated;
      this.updateState({});
    }
  }

  addGold(amount: number) {
    this.state.tamer.gold += amount;
    this.updateState({});
  }

  addDebugMonster(speciesId: string) {
    const monster = createMonsterInstance(speciesId, 10);
    if (this.state.tamer.party.length < this.state.tamer.unlockedPartySlots) {
      this.state.tamer.party.push(monster);
    } else {
      this.state.tamer.storage.push(monster);
    }
    if (!this.state.tamer.collection.includes(speciesId)) {
      this.state.tamer.collection.push(speciesId);
    }
    this.updateState({});
  }

  autoSave() {
    SaveManager.save(this.state);
  }

  save(): SaveResult {
    return SaveManager.save(this.state);
  }

  manualSave(): SaveResult {
    return this.save();
  }

  manualLoad(): boolean {
    const result = SaveManager.load();
    if (result.ok) {
      this.state = result.state;
      this.updateState({});
      return true;
    }
    return false;
  }

  hasSave(): boolean {
    return SaveManager.hasSave();
  }

  returnToTitle() {
    // We emit an event that scenes can listen to, or we can just reload for simplicity
    // But let's emit an event for a smoother transition
    bus.emitEvent({ type: 'RETURN_TO_TITLE' });
  }
}

export const gameStateManager = new GameStateManager();
