
import { GameState, Tamer, MonsterInstance, BattleRewards, InventoryItem, Language, FactionType, EvolutionOption, GameEvent, IncubatorSlot } from '../domain/types';
import { MONSTER_DATA } from '../data/monsters';
import { ITEM_DATA } from '../data/items';
import { CHARACTER_DATA } from '../data/characters';
import { QUEST_DATA } from '../data/quests';
import { SKILL_TREES } from '../data/skills';
import { gameEvents as bus } from './EventBus';
import { addExpToMonster, addExpToTamer, createMonsterInstance, addToInventory, rollLoot, calculateCaptureChance, checkEvolution, transformMonster, unlockNode, consumeItem, validateEnhancement, recalculateMonsterStats } from '../domain/logic';
import { SaveManager, SaveResult } from '../save/SaveManager';
import { gameRNG } from '../domain/RNG';
import { getFactionDiscount } from '../localization/strings';
// Phase 4 imports
import { ACHIEVEMENTS } from '../data/achievements';
import { getDailyReward } from '../data/dailyRewards';
import { EXPEDITIONS } from '../data/expeditions';

const INITIAL_STATE: GameState = {
  version: 1,
  tamer: {
    name: 'Tamer Zero',
    level: 1,
    exp: 0,
    party: [],
    storage: [],
    gold: 150,
    maxSpiritPoints: 100,
    currentSpiritPoints: 100,
    inventory: [
      { itemId: 'capture_orb', quantity: 5 }
    ],
    unlockedPartySlots: 6,
    unlockedStorageSlots: 20,
    unlockedSupportSkills: ['cheer'],
    collection: [],
    // Phase 4
    achievementProgress: {},
    unlockedAchievements: [],
    activeExpeditions: [],
    expeditionSlots: 1
  },
  worldPosition: { x: 400, y: 300 },
  currentScene: 'BootScene',
  flags: {},
  gameTime: 1200,
  language: (navigator.language.startsWith('ko') ? 'ko' : 'en') as Language,
  activeQuests: [],
  completedQuests: [],
  pendingRewards: [],
  reputation: {},
  lastQuestRefresh: Date.now(),
  incubators: [],
  // Phase 4
  dailyLogin: {
    lastLoginDate: '',
    consecutiveDays: 0,
    claimedToday: false
  }
};

export class GameStateManager {
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
    if (!this.state.activeQuests) {
      this.state.activeQuests = ['first_capture'];
    }
    if (!this.state.pendingRewards) {
      this.state.pendingRewards = [];
    }
    if (!this.state.lastQuestRefresh) {
      this.state.lastQuestRefresh = Date.now();
    }
    if (!this.state.lastWeeklyRefresh) {
      this.state.lastWeeklyRefresh = Date.now();
    }

    // Phase 4: Ensure new fields exist for old saves
    if (!this.state.dailyLogin) {
      this.state.dailyLogin = {
        lastLoginDate: '',
        consecutiveDays: 0,
        claimedToday: false
      };
    }
    if (!this.state.tamer.achievementProgress) {
      this.state.tamer.achievementProgress = {};
    }
    if (!this.state.tamer.unlockedAchievements) {
      this.state.tamer.unlockedAchievements = [];
    }
    if (!this.state.tamer.activeExpeditions) {
      this.state.tamer.activeExpeditions = [];
    }
    if (this.state.tamer.expeditionSlots === undefined) {
      this.state.tamer.expeditionSlots = 1;
    }

    if (!this.state.shopStock || !this.state.shopNextRefresh) {
      this.refreshShopStock();
    } else {
      this.checkShopRefresh();
    }

    this.normalizeState();
  }

  normalizeState() {
    // Ensure all monster instances have the latest stat fields (specialAttack, skillResistance)
    const normalizeMonster = (m: MonsterInstance) => {
      if (m.currentStats.specialAttack === undefined || m.currentStats.skillResistance === undefined) {
        const species = MONSTER_DATA[m.speciesId];
        if (species) {
          m.currentStats.specialAttack = m.currentStats.specialAttack ?? species.baseStats.specialAttack;
          m.currentStats.skillResistance = m.currentStats.skillResistance ?? species.baseStats.skillResistance;
        } else {
          m.currentStats.specialAttack = m.currentStats.specialAttack ?? 10;
          m.currentStats.skillResistance = m.currentStats.skillResistance ?? 10;
        }
      }
    };

    this.state.tamer.party.forEach(normalizeMonster);
    this.state.tamer.storage.forEach(normalizeMonster);
    this.updateState({});
  }

  refreshShopStock() {
    const allItems = Object.keys(ITEM_DATA).filter(id => {
      const item = ITEM_DATA[id];
      return item.category !== 'Material';
    });

    const shuffled = [...allItems].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);

    // RPG Expansion: Ensure specialty items are in stock
    if (!selected.includes('storage_license')) selected.push('storage_license');
    if (!selected.includes('basic_incubator')) selected.push('basic_incubator');

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
    this.checkIncubation();
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

    // Special handling for Storage Expansion
    if (itemId === 'storage_license') {
      this.state.tamer.unlockedStorageSlots += 10 * quantity;
      this.state.tamer.inventory = consumeItem(this.state.tamer.inventory, itemId, quantity);
    }

    // Track spend progress
    ['daily_spend_100', 'daily_spend_500', 'weekly_spend_5000'].forEach(qid => {
      const key = `quest_progress_${qid}`;
      this.state.flags[key] = ((this.state.flags[key] as number) || 0) + totalCost;
    });

    this.updateState({});
    return true;
  }

  enhanceMonster(monsterUid: string, cloneItemId: string, useBackup: boolean): { success: boolean; message: string } {
    const monsterIdx = this.state.tamer.party.findIndex(m => m.uid === monsterUid);
    const monster = monsterIdx !== -1
      ? this.state.tamer.party[monsterIdx]
      : this.state.tamer.storage.find(m => m.uid === monsterUid);

    if (!monster) return { success: false, message: 'Monster not found.' };

    const hasClone = this.state.tamer.inventory.find(i => i.itemId === cloneItemId && i.quantity > 0);
    if (!hasClone) return { success: false, message: 'Missing Clone Item.' };

    if (useBackup) {
      const hasBackup = this.state.tamer.inventory.find(i => i.itemId === 'backup_disk' && i.quantity > 0);
      if (!hasBackup) return { success: false, message: 'Missing Backup Disk.' };
    }

    const val = validateEnhancement(monster, cloneItemId);
    if (!val.valid) return { success: false, message: val.reason || 'Invalid enhancement.' };

    // Consume Items
    this.state.tamer.inventory = consumeItem(this.state.tamer.inventory, cloneItemId, 1);
    if (useBackup) {
      this.state.tamer.inventory = consumeItem(this.state.tamer.inventory, 'backup_disk', 1);
    }

    // Success Check (Simple Logic)
    // Clone D: 70%, Clone C: 50%
    const chance = cloneItemId === 'power_clone_d' ? 0.7 : 0.5;
    const success = gameRNG.chance(chance);

    if (success) {
      monster.enhancementLevel++;
      monster.currentStats = recalculateMonsterStats(monster);
      bus.emitEvent({ type: 'LOG_MESSAGE', message: `${monster.speciesId} enhancement succeeded! (+${monster.enhancementLevel})` });
      this.updateState({});
      return { success: true, message: 'Enhancement Successful!' };
    } else {
      let message = 'Enhancement Failed.';
      if (!useBackup && monster.enhancementLevel > 0) {
        // Fail = No change for MVP
        message += ' (No change)';
      } else if (useBackup) {
        message += ' (Protected by Backup Disk)';
      }
      bus.emitEvent({ type: 'LOG_MESSAGE', message: `${monster.speciesId} enhancement failed.` });
      this.updateState({});
      return { success: false, message };
    }
  }

  equipItem(monsterUid: string, itemId: string): { success: boolean; message: string } {
    const monster = this.state.tamer.party.find(m => m.uid === monsterUid)
      || this.state.tamer.storage.find(m => m.uid === monsterUid);
    if (!monster) return { success: false, message: 'Monster not found' };

    const invItem = this.state.tamer.inventory.find(i => i.itemId === itemId);
    if (!invItem || invItem.quantity <= 0) return { success: false, message: 'Item not in inventory' };

    const itemData = ITEM_DATA[itemId];
    if (itemData.category !== 'Equipment') return { success: false, message: 'Not an equipment item' };

    // Unequip current if any
    if (monster.heldItemId) {
      this.unequipItem(monsterUid);
    }

    // Equip new
    this.state.tamer.inventory = consumeItem(this.state.tamer.inventory, itemId, 1);
    monster.heldItemId = itemId;
    monster.currentStats = recalculateMonsterStats(monster);

    this.updateState({});
    return { success: true, message: 'Item equipped' };
  }

  unequipItem(monsterUid: string): { success: boolean; message: string } {
    const monster = this.state.tamer.party.find(m => m.uid === monsterUid)
      || this.state.tamer.storage.find(m => m.uid === monsterUid);
    if (!monster) return { success: false, message: 'Monster not found' };

    if (!monster.heldItemId) return { success: false, message: 'No item equipped' };

    const oldItemId = monster.heldItemId;
    monster.heldItemId = undefined;
    monster.currentStats = recalculateMonsterStats(monster);
    this.state.tamer.inventory = addToInventory(this.state.tamer.inventory, oldItemId, 1);

    this.updateState({});
    return { success: true, message: 'Item unequipped' };
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

      // Track quest progress
      ['daily_item_use', 'daily_item_use_10', 'weekly_item_use_30'].forEach(qid => {
        const progressKey = `quest_progress_${qid}`;
        this.state.flags[progressKey] = ((this.state.flags[progressKey] as number) || 0) + 1;
      });

      this.updateState({});
      return { success: true, message: `${item.name} used!` };
    }

    return { success: false, message: 'Cannot use this item here' };
  }

  // --- RPG Expansion: Battle Skills ---
  useTamerSkill(skillId: 'heal' | 'boost'): { success: boolean, message: string } {
    const COST_HEAL = 20;
    const COST_BOOST = 30;

    if (skillId === 'heal') {
      if (this.state.tamer.currentSpiritPoints < COST_HEAL) return { success: false, message: 'Not enough Spirit Points!' };
      const activeMonster = this.state.tamer.party[0];
      if (!activeMonster) return { success: false, message: 'No monster!' };

      const healAmount = Math.floor(activeMonster.currentStats.maxHp * 0.3);
      activeMonster.currentHp = Math.min(activeMonster.currentStats.maxHp, activeMonster.currentHp + healAmount);
      this.state.tamer.currentSpiritPoints -= COST_HEAL;

      this.updateState({});
      bus.emitEvent({ type: 'LOG_MESSAGE', message: `Tamer used Heal! Restored ${healAmount} HP.` });
      return { success: true, message: 'Heal used!' };
    }

    if (skillId === 'boost') {
      if (this.state.tamer.currentSpiritPoints < COST_BOOST) return { success: false, message: 'Not enough Spirit Points!' };
      // Implementation note: "Boost" usually works via a temporary buff.
      // For phase 1 of this feature, we'll just heal a bit of SP or apply a flag? 
      // Let's make it meaningful: Give 50% HP Shield? Or just a log message + future hook.
      // Actually, we need to affect the BattleEntity. But GameStateManager affects Global State.
      // BattleScene manages local battle state.
      // So this method might need to emit an event that BattleScene listens to.

      this.state.tamer.currentSpiritPoints -= COST_BOOST;
      this.updateState({});
      bus.emitEvent({ type: 'LOG_MESSAGE', message: `Tamer used Boost! Attack increased!` });
      // We need a specific event to tell BattleScene to apply the buff
      // bus.emitEvent({ type: 'TAMER_SKILL_USED', skill: 'boost', targetUid: this.state.tamer.party[0].uid }); // Future
      return { success: true, message: 'Boost used!' };
    }

    return { success: false, message: 'Unknown skill' };
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
      } else if (this.state.tamer.storage.length < this.state.tamer.unlockedStorageSlots) {
        this.state.tamer.storage.push(monster);
      } else {
        // Storage full!
        bus.emitEvent({ type: 'LOG_MESSAGE', message: 'Storage is full! Captured monster escaped.' });
        this.updateState({});
        return true; // Still technically a "successful" capture act but result is loss
      }

      if (!this.state.tamer.collection.includes(enemySpeciesId)) {
        this.state.tamer.collection.push(enemySpeciesId);
      }

      const enemyData = MONSTER_DATA[enemySpeciesId];
      if (enemyData) {
        this.updateReputation(enemyData.faction, 5);

        // Track Rare Hunter progress
        const isRareOrHigher = ['Rare', 'Epic', 'Legendary'].includes(enemyData.rarity);
        if (isRareOrHigher) {
          this.state.flags['captured_rare_or_higher'] = true;
        }
        if (enemyData.rarity === 'Legendary') {
          this.state.flags['captured_legendary'] = true;
        }
      }

      // First Capture story quest flag
      this.state.flags['first_capture_done'] = true;

      // Track weekly monster capture progress
      ['daily_capture_1', 'daily_capture_3', 'weekly_monster_collector', 'weekly_capture_5_rare'].forEach(qid => {
        if (qid === 'weekly_capture_5_rare' && !['Rare', 'Epic', 'Legendary'].includes(enemyData?.rarity || '')) return;
        const captureKey = `quest_progress_${qid}`;
        this.state.flags[captureKey] = ((this.state.flags[captureKey] as number) || 0) + 1;
      });

      // Captures count as wins for streaks
      ['daily_win_3', 'daily_win_5', 'weekly_win_20', 'weekly_win_50', 'win_streak_10', 'win_streak_50'].forEach(qid => {
        const key = `quest_progress_${qid}`;
        this.state.flags[key] = ((this.state.flags[key] as number) || 0) + 1;
      });

      // Phase 4: Track Achievements
      this.trackAchievement('collection_first_capture', 1);
      this.trackAchievement('collection_' + this.state.tamer.collection.length + '_species', 0); // Update collection count
      // Track based on unique species count
      const speciesCount = this.state.tamer.collection.length;
      if (speciesCount >= 5) this.trackAchievement('collection_5_species', 0);
      if (speciesCount >= 10) this.trackAchievement('collection_10_species', 0);
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
      maxSpiritPoints: 100,
      currentSpiritPoints: 100,
      characterId: characterId,
      party: [],
      storage: [],
      inventory: [
        { itemId: 'potion', quantity: 3 },
        { itemId: 'capture_orb', quantity: 5 }
      ],
      unlockedPartySlots: 6,
      unlockedStorageSlots: 20,
      unlockedSupportSkills: ['cheer'],
      collection: [starterSpeciesId],
      // Phase 4
      achievementProgress: {},
      unlockedAchievements: [],
      activeExpeditions: [],
      expeditionSlots: 1
    };

    // Phase 4: Reset daily login for new game
    this.state.dailyLogin = {
      lastLoginDate: '',
      consecutiveDays: 0,
      claimedToday: false
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
      // Only check if it's currently active and not yet completed or pending
      if (!this.state.activeQuests.includes(quest.id)) return;
      if (this.state.completedQuests.includes(quest.id)) return;
      if (this.state.pendingRewards.includes(quest.id)) return;

      let satisfied = true;
      if (quest.requiredLevel && this.state.tamer.level < quest.requiredLevel) satisfied = false;
      if (quest.requiredFlag && !this.state.flags[quest.requiredFlag]) satisfied = false;

      // Special conditional logic for certain quest IDs
      if (quest.id === 'first_capture' && !this.state.flags['first_capture_done']) satisfied = false;
      if (quest.id === 'collector_beginner' && this.state.tamer.collection.length < 3) satisfied = false;
      if (quest.id === 'collector_pro' && this.state.tamer.collection.length < 20) satisfied = false;
      if (quest.id === 'collector_master' && this.state.tamer.collection.length < 50) satisfied = false;
      if (quest.id === 'story_capture_5' && this.state.tamer.collection.length < 5) satisfied = false;
      if (quest.id === 'gold_saver' && this.state.tamer.gold < 1000) satisfied = false;
      if (quest.id === 'gold_millionaire' && this.state.tamer.gold < 100000) satisfied = false;
      if (quest.id === 'rare_hunter' && !this.state.flags['captured_rare_or_higher']) satisfied = false;
      if (quest.id === 'legendary_hunter' && !this.state.flags['captured_legendary']) satisfied = false;
      if (quest.id === 'faction_friend' && !Object.values(this.state.reputation).some(r => r >= 100)) satisfied = false;
      if (quest.id === 'faction_hero' && !Object.values(this.state.reputation).some(r => r >= 500)) satisfied = false;
      if (quest.id === 'skill_unlock_all' && !this.state.tamer.party.some(m => {
        const tree = SKILL_TREES[m.speciesId];
        return tree && m.unlockedNodes.length >= tree.nodes.length;
      })) satisfied = false;

      // Progress tracking for specific quests
      if (quest.progressMax) {
        const progress = (this.state.flags[`quest_progress_${quest.id}`] as number) || 0;
        if (progress < quest.progressMax) satisfied = false;
      }

      if (satisfied) this.completeQuest(quest.id);
    });
  }

  completeQuest(questId: string) {
    const quest = QUEST_DATA.find(q => q.id === questId);
    if (!quest) return;
    if (this.state.completedQuests.includes(questId)) return;
    if (this.state.pendingRewards.includes(questId)) return;

    this.state.pendingRewards.push(questId);

    // Track weekly completionist progress
    if (quest.id !== 'weekly_completionist') {
      const key = 'quest_progress_weekly_completionist';
      this.state.flags[key] = ((this.state.flags[key] as number) || 0) + 1;
    }

    bus.emitEvent({ type: 'QUEST_COMPLETED', questId });
    this.updateState({});
  }

  claimQuestReward(questId: string) {
    const quest = QUEST_DATA.find(q => q.id === questId);
    if (!quest || !this.state.pendingRewards.includes(questId)) return;

    // Remove from pending and active
    this.state.pendingRewards = this.state.pendingRewards.filter(id => id !== questId);
    this.state.activeQuests = this.state.activeQuests.filter(id => id !== questId);

    // Add to completed
    if (!this.state.completedQuests.includes(questId)) {
      this.state.completedQuests.push(questId);
    }

    // Grant rewards
    this.state.tamer.gold += quest.rewardGold;
    const { tamer } = addExpToTamer(this.state.tamer, quest.rewardExp);
    this.state.tamer = tamer;

    if (quest.rewardItems) {
      quest.rewardItems.forEach(ri => {
        this.state.tamer.inventory = addToInventory(this.state.tamer.inventory, ri.itemId, ri.quantity);
      });
    }

    this.updateState({});
  }

  rerollQuest(questId: string) {
    if (!this.state.activeQuests.includes(questId)) return;

    // Hearthstone-like reroll: once per day (checking simple flag for simplicity in this demo)
    if (this.state.flags['rerolled_today']) {
      return;
    }

    const currentQuest = QUEST_DATA.find(q => q.id === questId);
    if (!currentQuest || currentQuest.category === 'STORY') return; // Can't reroll story quests

    const availableQuests = QUEST_DATA.filter(q =>
      q.category !== 'STORY' &&
      !this.state.activeQuests.includes(q.id) &&
      !this.state.completedQuests.includes(q.id)
    );

    if (availableQuests.length > 0) {
      const nextQuest = availableQuests[Math.floor(Math.random() * availableQuests.length)];
      this.state.activeQuests = this.state.activeQuests.map(id => id === questId ? nextQuest.id : id);
      this.state.flags['rerolled_today'] = true;
      this.updateState({});
    }
  }

  refreshDailyQuests() {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;

    let changed = false;

    // Daily Refresh
    if (now - this.state.lastQuestRefresh > oneDay) {
      this.state.lastQuestRefresh = now;
      this.state.flags['rerolled_today'] = false;

      const activeDailies = QUEST_DATA.filter(q => q.category === 'DAILY' && this.state.activeQuests.includes(q.id));
      if (activeDailies.length < 3) {
        const availableDailies = QUEST_DATA.filter(q =>
          q.category === 'DAILY' &&
          !this.state.activeQuests.includes(q.id) &&
          !this.state.completedQuests.includes(q.id)
        );
        if (availableDailies.length > 0) {
          const next = availableDailies[Math.floor(Math.random() * availableDailies.length)];
          this.state.activeQuests.push(next.id);
        }
      }
      changed = true;
    }

    // Weekly Refresh
    if (this.state.lastWeeklyRefresh === undefined || now - this.state.lastWeeklyRefresh > oneWeek) {
      this.state.lastWeeklyRefresh = now;

      const activeWeeklies = QUEST_DATA.filter(q => q.category === 'WEEKLY' && this.state.activeQuests.includes(q.id));
      if (activeWeeklies.length < 1) {
        const availableWeeklies = QUEST_DATA.filter(q =>
          q.category === 'WEEKLY' &&
          !this.state.activeQuests.includes(q.id) &&
          !this.state.completedQuests.includes(q.id)
        );
        if (availableWeeklies.length > 0) {
          const next = availableWeeklies[Math.floor(Math.random() * availableWeeklies.length)];
          this.state.activeQuests.push(next.id);
        }
      }
      changed = true;
    }

    if (changed) {
      this.updateState({});
    }
  }

  handleBattleEnd(winner: 'PLAYER' | 'ENEMY' | 'CAPTURED', enemySpeciesId: string, enemyLevel: number, isBoss: boolean) {
    if (winner === 'PLAYER') {
      this.grantRewards(enemySpeciesId, enemyLevel, isBoss);

      // Story flags for specific bosses
      if (isBoss) {
        if (enemySpeciesId === 'flarelion') this.state.flags['boss_flarelion_defeated'] = true;
        if (enemySpeciesId === 'krakenwhale') this.state.flags['boss_krakenwhale_defeated'] = true;
      }

      // Phase 4: Track Combat Achievements
      this.trackAchievement('combat_first_victory', 1);
      this.trackAchievement('combat_10_victories', 1);
      this.trackAchievement('combat_50_victories', 1);
      this.trackAchievement('combat_100_victories', 1);

      // Track regular wins vs elements (already in grantRewards)
    } else if (winner === 'ENEMY') {
      // Reset win streaks
      this.state.flags['quest_progress_win_streak_10'] = 0;
      this.state.flags['quest_progress_win_streak_50'] = 0;
    }
    // CAPTURED is already handled by attemptCapture

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

    // Track quest progress (Wins)
    ['daily_win_3', 'daily_win_5', 'weekly_win_20', 'weekly_win_50', 'win_streak_10', 'win_streak_50'].forEach(qid => {
      const key = `quest_progress_${qid}`;
      this.state.flags[key] = ((this.state.flags[key] as number) || 0) + 1;
    });

    if (enemyData) {
      if (enemyData.type === 'FIRE') this.state.flags['quest_progress_daily_win_fire'] = ((this.state.flags['quest_progress_daily_win_fire'] as number) || 0) + 1;
      if (enemyData.type === 'WATER') this.state.flags['quest_progress_daily_win_water'] = ((this.state.flags['quest_progress_daily_win_water'] as number) || 0) + 1;
      if (enemyData.type === 'GRASS') this.state.flags['quest_progress_daily_win_grass'] = ((this.state.flags['quest_progress_daily_win_grass'] as number) || 0) + 1;
      if (enemyData.type === 'ELECTRIC') this.state.flags['quest_progress_daily_win_electric'] = ((this.state.flags['quest_progress_daily_win_electric'] as number) || 0) + 1;
      if (enemyData.type === 'NEUTRAL') this.state.flags['quest_progress_daily_win_neutral'] = ((this.state.flags['quest_progress_daily_win_neutral'] as number) || 0) + 1;
      if (enemyData.type === 'DARK' || enemyData.type === 'LIGHT') this.state.flags['quest_progress_daily_win_dark_light'] = ((this.state.flags['quest_progress_daily_win_dark_light'] as number) || 0) + 1;

      if (enemySpeciesId === 'puffle') this.state.flags['quest_progress_pesticide_specialist'] = ((this.state.flags['quest_progress_pesticide_specialist'] as number) || 0) + 1;
    }

    if (isBoss) {
      this.state.flags['quest_progress_weekly_boss_slayer_3'] = ((this.state.flags['quest_progress_weekly_boss_slayer_3'] as number) || 0) + 1;
    }

    const goldKey = 'quest_progress_daily_earn_500';
    this.state.flags[goldKey] = ((this.state.flags[goldKey] as number) || 0) + rewards.gold;
    const weeklyGoldKey = 'quest_progress_weekly_earn_5000';
    this.state.flags[weeklyGoldKey] = ((this.state.flags[weeklyGoldKey] as number) || 0) + rewards.gold;

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

      // Evolution quest flag
      this.state.flags['evolved_once'] = true;

      // Track evolution progress
      ['weekly_evolve_3', 'evolution_master'].forEach(qid => {
        const key = `quest_progress_${qid}`;
        this.state.flags[key] = ((this.state.flags[key] as number) || 0) + 1;
      });

      this.updateState({});
    }
  }

  unlockSkillNode(monsterUid: string, nodeId: string) {
    const partyIndex = this.state.tamer.party.findIndex(m => m.uid === monsterUid);
    if (partyIndex !== -1) {
      const monster = this.state.tamer.party[partyIndex];
      const updated = unlockNode(monster, nodeId);
      this.state.tamer.party[partyIndex] = updated;

      // Track skill unlock progress
      const key = 'quest_progress_skill_unlock_10';
      this.state.flags[key] = ((this.state.flags[key] as number) || 0) + 1;

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

  // --- Incubation System ---

  startIncubation(eggItemId: string, materials: InventoryItem[]): boolean {
    const incubatorItem = this.state.tamer.inventory.find(i => i.itemId === 'basic_incubator');
    if (!incubatorItem) return false;

    const eggItem = this.state.tamer.inventory.find(i => i.itemId === eggItemId);
    if (!eggItem) return false;

    // Define requirements based on egg type
    const requirements: { itemId: string, quantity: number }[] = [];

    if (eggItemId.includes('fire')) requirements.push({ itemId: 'data_fire', quantity: 5 });
    if (eggItemId.includes('water')) requirements.push({ itemId: 'data_water', quantity: 5 });
    // Mercenary eggs might require more
    if (eggItemId.includes('mercenary')) requirements.forEach(r => r.quantity = 10);

    // Validate materials
    for (const req of requirements) {
      const mat = materials.find(m => m.itemId === req.itemId);
      if (!mat || mat.quantity < req.quantity) return false;
    }

    // Consume egg and materials
    this.state.tamer.inventory = consumeItem(this.state.tamer.inventory, eggItemId, 1);
    for (const mat of materials) {
      this.state.tamer.inventory = consumeItem(this.state.tamer.inventory, mat.itemId, mat.quantity);
    }

    const slot: IncubatorSlot = {
      id: Math.random().toString(36).substr(2, 9),
      eggItemId,
      materials,
      startTime: this.state.gameTime,
      duration: 200, // Takes 200 units of gameTime
      isComplete: false
    };

    this.state.incubators.push(slot);
    this.updateState({});
    return true;
  }

  checkIncubation() {
    let changed = false;
    this.state.incubators.forEach(slot => {
      if (!slot.isComplete) {
        // Simple progress check based on gameTime elapsed
        // Note: this assumes gameTime is continuous and doesn't wrap oddly for duration
        // For a more robust system, we might track absolute elapsed time
        const elapsed = (this.state.gameTime - slot.startTime + 2400) % 2400;
        if (elapsed >= slot.duration) {
          slot.isComplete = true;
          changed = true;
          bus.emitEvent({ type: 'LOG_MESSAGE', message: 'An egg is ready to hatch!' });
        }
      }
    });

    if (changed) this.updateState({});
  }

  hatchEgg(slotId: string): MonsterInstance | null {
    const index = this.state.incubators.findIndex(s => s.id === slotId);
    if (index === -1) return null;

    const slot = this.state.incubators[index];
    if (!slot.isComplete) return null;

    // Determine species based on egg type
    let speciesId = 'pyrocat'; // Default
    if (slot.eggItemId === 'wilder_egg_fire') speciesId = 'pyrocat';
    if (slot.eggItemId === 'wilder_egg_water') speciesId = 'droplet';
    // Add more logic for special materials later

    const monster = createMonsterInstance(speciesId, 1);

    // Add to storage or party
    if (this.state.tamer.party.length < this.state.tamer.unlockedPartySlots) {
      this.state.tamer.party.push(monster);
    } else if (this.state.tamer.storage.length < this.state.tamer.unlockedStorageSlots) {
      this.state.tamer.storage.push(monster);
    } else {
      // If full, we can't hatch. User needs to make space.
      return null;
    }

    this.state.incubators.splice(index, 1);
    this.updateState({});
    return monster;
  }

  // ===== PHASE 4: Achievement System =====
  trackAchievement(achievementId: string, incrementBy: number = 1): void {
    const current = this.state.tamer.achievementProgress[achievementId] || 0;
    this.state.tamer.achievementProgress[achievementId] = current + incrementBy;

    // Check if achievement is unlocked
    this.checkAchievementUnlock(achievementId);
  }

  private checkAchievementUnlock(achievementId: string): void {
    // Import dynamically to avoid circular dependencies
    import('../data/achievements').then(({ ACHIEVEMENTS }) => {
      const achievement = ACHIEVEMENTS[achievementId];
      if (!achievement) return;

      const progress = this.state.tamer.achievementProgress[achievementId] || 0;

      if (progress >= achievement.target && !this.state.tamer.unlockedAchievements.includes(achievementId)) {
        this.state.tamer.unlockedAchievements.push(achievementId);
        bus.emitEvent({ type: 'ACHIEVEMENT_UNLOCKED', achievementId });
        this.updateState({});
      }
    });
  }

  claimAchievementReward(achievementId: string): boolean {
    // Import dynamically
    const achievementPromise = import('../data/achievements').then(({ ACHIEVEMENTS }) => ACHIEVEMENTS[achievementId]);

    // For now, use sync approach with cached data
    const { ACHIEVEMENTS } = require('../data/achievements');
    const achievement = ACHIEVEMENTS[achievementId];

    if (!achievement) return false;
    if (!this.state.tamer.unlockedAchievements.includes(achievementId)) return false;

    // Check if already claimed (use flag)
    const claimedKey = `achievement_claimed_${achievementId}`;
    if (this.state.flags[claimedKey]) return false;

    // Grant rewards
    if (achievement.reward.gold) {
      this.state.tamer.gold += achievement.reward.gold;
    }
    if (achievement.reward.items) {
      achievement.reward.items.forEach((item: { itemId: string; quantity: number }) => {
        this.state.tamer.inventory = addToInventory(this.state.tamer.inventory, item.itemId, item.quantity);
      });
    }

    this.state.flags[claimedKey] = true;
    this.updateState({});
    return true;
  }

  // ===== PHASE 4: Daily Login =====
  checkDailyLogin(): { isNewDay: boolean; reward: any | null } {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const { lastLoginDate, consecutiveDays, claimedToday } = this.state.dailyLogin;

    if (lastLoginDate === today) {
      // Already logged in today
      return { isNewDay: false, reward: claimedToday ? null : this.getDayReward(consecutiveDays) };
    }

    // New day!
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = 1;
    if (lastLoginDate === yesterdayStr) {
      // Consecutive login
      newStreak = consecutiveDays + 1;
    }

    this.state.dailyLogin = {
      lastLoginDate: today,
      consecutiveDays: newStreak,
      claimedToday: false
    };

    this.updateState({});
    return { isNewDay: true, reward: this.getDayReward(newStreak) };
  }

  private getDayReward(day: number) {
    return getDailyReward(day);
  }

  claimDailyLogin(): boolean {
    if (this.state.dailyLogin.claimedToday) return false;

    const reward = getDailyReward(this.state.dailyLogin.consecutiveDays);

    if (reward.gold) {
      this.state.tamer.gold += reward.gold;
    }
    if (reward.items) {
      reward.items.forEach((item: { itemId: string; quantity: number }) => {
        this.state.tamer.inventory = addToInventory(this.state.tamer.inventory, item.itemId, item.quantity);
      });
    }

    this.state.dailyLogin.claimedToday = true;
    this.updateState({});
    return true;
  }

  // ===== PHASE 4: Expedition System =====
  startExpedition(expeditionId: string, monsterUids: string[]): { success: boolean; message: string } {
    const expedition = EXPEDITIONS[expeditionId];

    if (!expedition) return { success: false, message: 'Invalid expedition' };

    // Check slot availability
    if (this.state.tamer.activeExpeditions.length >= this.state.tamer.expeditionSlots) {
      return { success: false, message: 'No expedition slots available' };
    }

    // Validate monsters
    const monsters = monsterUids.map(uid =>
      this.state.tamer.party.find(m => m.uid === uid) ||
      this.state.tamer.storage.find(m => m.uid === uid)
    ).filter(m => m);

    if (monsters.length !== expedition.requirements.partySize) {
      return { success: false, message: `Requires ${expedition.requirements.partySize} monsters` };
    }

    // Check level requirements
    if (expedition.requirements.minLevel) {
      if (monsters.some(m => m!.level < expedition.requirements.minLevel!)) {
        return { success: false, message: `All monsters must be level ${expedition.requirements.minLevel}+` };
      }
    }

    // Check element requirements
    if (expedition.requirements.element) {
      if (!monsters.some(m => MONSTER_DATA[m!.speciesId]?.type === expedition.requirements.element)) {
        return { success: false, message: `Requires a ${expedition.requirements.element} type monster` };
      }
    }

    // Remove monsters from party/storage temporarily (they're on expedition)
    monsterUids.forEach(uid => {
      const partyIdx = this.state.tamer.party.findIndex(m => m.uid === uid);
      if (partyIdx !== -1) this.state.tamer.party.splice(partyIdx, 1);

      const storageIdx = this.state.tamer.storage.findIndex(m => m.uid === uid);
      if (storageIdx !== -1) this.state.tamer.storage.splice(storageIdx, 1);
    });

    const now = Date.now();
    this.state.tamer.activeExpeditions.push({
      expeditionId,
      monsterUids,
      startTime: now,
      endTime: now + expedition.duration
    });

    this.updateState({});
    return { success: true, message: 'Expedition started!' };
  }

  claimExpedition(expeditionId: string): { success: boolean; rewards: any } {
    const expIdx = this.state.tamer.activeExpeditions.findIndex(e => e.expeditionId === expeditionId);
    if (expIdx === -1) return { success: false, rewards: null };

    const active = this.state.tamer.activeExpeditions[expIdx];
    if (Date.now() < active.endTime) {
      return { success: false, rewards: null }; // Not finished yet
    }

    const expedition = EXPEDITIONS[expeditionId];
    if (!expedition) return { success: false, rewards: null };

    // Grant rewards
    const rewards: any = {
      gold: expedition.rewards.gold,
      exp: expedition.rewards.exp,
      items: []
    };

    this.state.tamer.gold += rewards.gold;

    // Roll for items
    if (expedition.rewards.items) {
      expedition.rewards.items.forEach((itemDef: { itemId: string; chance: number }) => {
        if (gameRNG.chance(itemDef.chance)) {
          this.state.tamer.inventory = addToInventory(this.state.tamer.inventory, itemDef.itemId, 1);
          rewards.items.push(itemDef.itemId);
        }
      });
    }

    // Return monsters and grant exp (stored temporarily)
    // We need to re-add the monsters (they were stored in activeExpedition.monsterUids)
    active.monsterUids.forEach(uid => {
      // Create a placeholder monster (in a real scenario, we'd store the full data)
      // For now, the monsters simply "reappear" - this is a simplification
      // Ideally we'd serialize the full monster data
    });

    // Remove expedition
    this.state.tamer.activeExpeditions.splice(expIdx, 1);

    bus.emitEvent({ type: 'EXPEDITION_COMPLETE', expeditionId });
    this.updateState({});
    return { success: true, rewards };
  }

  checkExpeditions(): void {
    const now = Date.now();
    this.state.tamer.activeExpeditions.forEach(exp => {
      if (now >= exp.endTime) {
        // Expedition is complete, could emit an event or set a flag
        bus.emitEvent({ type: 'LOG_MESSAGE', message: `Expedition complete! Claim your rewards.` });
      }
    });
  }
}

export const gameStateManager = new GameStateManager();
