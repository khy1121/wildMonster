
import { GameState, Tamer, MonsterInstance, BattleRewards, InventoryItem } from '../domain/types';
import { MONSTER_DATA } from '../data/monsters';
import { ITEM_DATA } from '../data/items';
import { QUEST_DATA } from '../data/quests';
import { gameEvents as bus } from './EventBus';
import { addExpToMonster, addExpToTamer, createMonsterInstance, addToInventory, rollLoot, calculateCaptureChance, checkEvolution, transformMonster, unlockNode, consumeItem } from '../domain/logic';
import { SaveManager } from '../save/SaveManager';
import { gameRNG } from '../domain/RNG';

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
  completedQuests: []
};

class GameStateManager {
  private state: GameState;

  constructor() {
    const saved = SaveManager.load();
    this.state = saved || { ...INITIAL_STATE };
  }

  getState() {
    return this.state;
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

  // SHOP LOGIC
  buyItem(itemId: string, quantity: number): boolean {
    const item = ITEM_DATA[itemId];
    const totalCost = item.price * quantity;
    if (this.state.tamer.gold < totalCost) return false;

    this.state.tamer.gold -= totalCost;
    this.state.tamer.inventory = addToInventory(this.state.tamer.inventory, itemId, quantity);
    this.autoSave();
    bus.emitEvent({ type: 'STATE_UPDATED', state: this.state });
    return true;
  }

  sellItem(itemId: string, quantity: number): boolean {
    const item = ITEM_DATA[itemId];
    const invItem = this.state.tamer.inventory.find(i => i.itemId === itemId);
    if (!invItem || invItem.quantity < quantity) return false;

    this.state.tamer.gold += Math.floor(item.price * 0.5) * quantity;
    this.state.tamer.inventory = consumeItem(this.state.tamer.inventory, itemId, quantity);
    this.autoSave();
    bus.emitEvent({ type: 'STATE_UPDATED', state: this.state });
    return true;
  }

  // QUEST LOGIC
  checkQuests() {
    QUEST_DATA.forEach(quest => {
      if (this.state.completedQuests.includes(quest.id)) return;

      let satisfied = true;
      if (quest.requiredLevel && this.state.tamer.level < quest.requiredLevel) satisfied = false;
      if (quest.requiredFlag && !this.state.flags[quest.requiredFlag]) satisfied = false;
      
      // Special logic for first capture
      if (quest.id === 'first_capture' && this.state.tamer.collection.length <= 1) satisfied = false;

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

  // MONSTER LOGIC
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

      this.autoSave();
      bus.emitEvent({ type: 'STATE_UPDATED', state: this.state });
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
      
      bus.emitEvent({ type: 'MONSTER_CAPTURED', monster });
    }
    
    this.autoSave();
    bus.emitEvent({ type: 'STATE_UPDATED', state: this.state });
    return success;
  }

  grantRewards(enemySpeciesId: string, enemyLevel: number) {
    const rewards = rollLoot(enemySpeciesId, gameRNG);
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

    // Special flag for quest: Lunacat
    if (enemySpeciesId === 'lunacat') {
        this.state.flags['lunacat_defeated'] = true;
    }

    this.state.tamer = newTamer;
    this.checkQuests();
    this.autoSave();
    
    bus.emitEvent({ type: 'STATE_UPDATED', state: this.state });
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

  // DEBUG METHODS
  addGold(amount: number) {
    this.state.tamer.gold += amount;
    bus.emitEvent({ type: 'STATE_UPDATED', state: this.state });
  }

  addDebugMonster(speciesId: string) {
    const monster = createMonsterInstance(speciesId, 10);
    this.state.tamer.party.push(monster);
    if (!this.state.tamer.collection.includes(speciesId)) {
        this.state.tamer.collection.push(speciesId);
    }
    bus.emitEvent({ type: 'STATE_UPDATED', state: this.state });
  }

  autoSave() { SaveManager.save(this.state); }

  healParty() {
    this.state.tamer.party.forEach(m => { m.currentHp = m.currentStats.maxHp; });
    this.autoSave();
    bus.emitEvent({ type: 'STATE_UPDATED', state: this.state });
  }
}

export const gameStateManager = new GameStateManager();
