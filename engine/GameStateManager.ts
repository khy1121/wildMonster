
import { GameState, Tamer, MonsterInstance, BattleRewards, InventoryItem, Language, FactionType, EvolutionOption, GameEvent, IncubatorSlot, Stats } from '../domain/types';
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
import { EQUIPMENT_DATA, EQUIPMENT } from '../data/equipment';
// Service Layer
import { battleService } from './services/BattleService';
import { shopService } from './services/ShopService';
import { questService } from './services/QuestService';


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
    achievementProgress: {},
    unlockedAchievements: [],
    activeExpeditions: [],
    expeditionSlots: 1,
    // Equipment System
    unlockedPartySlots: 3,
    unlockedStorageSlots: 20, // Added
    unlockedSupportSkills: [],

    collection: [],
    equippedItems: {}   // Added
  },
  worldPosition: { x: 400, y: 300 },
  currentScene: 'world_map',
  flags: {},
  gameTime: 0,
  language: 'en',
  activeQuests: [],
  completedQuests: [],
  pendingRewards: [],
  reputation: {},
  lastQuestRefresh: 0,
  incubators: [],
  // Phase 4
  dailyLogin: {
    lastLoginDate: '',
    consecutiveDays: 0,
    claimedToday: false
  },
  // Phase 5: World Building
  currentRegion: 'chronos_plaza',  // Start at hub
  unlockedRegions: ['chronos_plaza'],
  unlockedPortals: [],
  storyProgress: {
    fragmentsCollected: 0,
    bossesDefeated: [],
    mainQuestsCompleted: [],
    loreNotesFound: 0,
    currentAct: 1,
  },
  activeQuestObjectives: {},
  foundLoreNotes: []
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

    // Phase 5: Ensure world building fields exist for old saves
    if (!this.state.currentRegion) {
      this.state.currentRegion = 'chronos_plaza';
    }
    if (!this.state.unlockedRegions) {
      this.state.unlockedRegions = ['chronos_plaza'];
    }
    if (!this.state.unlockedPortals) {
      this.state.unlockedPortals = [];
    }
    if (!this.state.storyProgress) {
      this.state.storyProgress = {
        fragmentsCollected: 0,
        bossesDefeated: [],
        mainQuestsCompleted: [],
        loreNotesFound: 0,
        currentAct: 1
      };
    }
    if (!this.state.activeQuestObjectives) {
      this.state.activeQuestObjectives = {};
    }
    if (!this.state.foundLoreNotes) {
      this.state.foundLoreNotes = [];
    }

    // Equipment System: Ensure equippedItems exists for old saves
    if (!this.state.tamer.equippedItems) {
      this.state.tamer.equippedItems = {};
    }

    if (!this.state.shopStock || !this.state.shopNextRefresh) {
      this.refreshShopStock();
    } else {
      this.checkShopRefresh();
    }

    this.normalizeState();

    // Initialize Quest Service Hooks
    questService.init(() => this.state);
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

  /**
   * @deprecated Use shopService.refreshShopStock() directly for new code
   */
  refreshShopStock() {
    shopService.refreshShopStock(this.state);
    this.checkQuests();
    this.autoSave();
    bus.emitEvent({ type: 'STATE_UPDATED', state: this.state });
  }

  /**
   * @deprecated Use shopService.checkShopRefresh() directly for new code
   */
  checkShopRefresh() {
    const refreshed = shopService.checkShopRefresh(this.state);
    if (refreshed) {
      this.checkQuests();
      this.autoSave();
      bus.emitEvent({ type: 'STATE_UPDATED', state: this.state });
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

  /**
   * @deprecated Use shopService.getEffectivePrice() directly for new code
   */
  getEffectivePrice(itemId: string): number {
    return shopService.getEffectivePrice(this.state, itemId);
  }

  /**
   * @deprecated Use shopService.buyItem() directly for new code
   */
  buyItem(itemId: string, quantity: number): boolean {
    const success = shopService.buyItem(this.state, itemId, quantity);
    if (success) {
      this.checkQuests();
      this.autoSave();
      bus.emitEvent({ type: 'STATE_UPDATED', state: this.state });
    }
    return success;
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

  equipMonsterItem(monsterUid: string, itemId: string): { success: boolean; message: string } {
    const monster = this.state.tamer.party.find(m => m.uid === monsterUid)
      || this.state.tamer.storage.find(m => m.uid === monsterUid);
    if (!monster) return { success: false, message: 'Monster not found' };

    const invItem = this.state.tamer.inventory.find(i => i.itemId === itemId);
    if (!invItem || invItem.quantity <= 0) return { success: false, message: 'Item not in inventory' };

    const itemData = ITEM_DATA[itemId] || EQUIPMENT[itemId];
    if (!itemData) return { success: false, message: 'Item data not found' };

    // Check category or slot. Equipment items from equipment.ts have 'slot' but may not have 'category' explicitly set to 'Equipment' in the check if it's strict.
    // However, logic below checks category === 'Equipment'. 
    // New equipment items don't have 'category' field in data/equipment.ts? Let's check.
    // They have 'slot'. We should allow if it has 'slot' OR category === 'Equipment'.
    const isEquipment = ('category' in itemData && itemData.category === 'Equipment') || ('slot' in itemData);

    if (!isEquipment) return { success: false, message: 'Not an equipment item' };

    // Unequip current if any
    if (monster.heldItemId) {
      this.unequipMonsterItem(monsterUid);
    }

    // Equip new
    this.state.tamer.inventory = consumeItem(this.state.tamer.inventory, itemId, 1);
    monster.heldItemId = itemId;
    monster.currentStats = recalculateMonsterStats(monster);

    this.updateState({});
    return { success: true, message: 'Item equipped' };
  }


  unequipMonsterItem(monsterUid: string): { success: boolean; message: string } {
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
    const item = ITEM_DATA[itemId] || EQUIPMENT[itemId];
    if (!item) return { success: false, message: 'Item not found' };

    const invItem = this.state.tamer.inventory.find(i => i.itemId === itemId);
    if (!invItem || invItem.quantity <= 0) return { success: false, message: 'No more items' };

    // Check if it's a regular item with category (not equipment)
    const isRegularItem = 'category' in item;

    if (isRegularItem && item.category === 'Healing') {
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

  /**
   * @deprecated Use battleService.attemptCapture() directly for new code
   */
  attemptCapture(enemySpeciesId: string, enemyLevel: number, currentHp: number, maxHp: number): boolean {
    const success = battleService.attemptCapture(
      this.state,
      enemySpeciesId,
      enemyLevel,
      currentHp,
      maxHp,
      (faction: string, delta: number) => this.updateReputation(faction as FactionType, delta)
    );
    // Don't call updateState({}) here - it creates a shallow copy that loses the mutations
    // Instead, manually trigger events and save
    this.checkQuests();
    this.autoSave();
    bus.emitEvent({ type: 'STATE_UPDATED', state: this.state });
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
      expeditionSlots: 1,
      // Equipment
      equippedItems: {}
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

  /**
   * @deprecated Use questService.checkQuests() directly for new code
   */
  checkQuests() {
    const completed = questService.checkQuests(this.state);
    if (completed.length > 0) {
      this.autoSave();
      bus.emitEvent({ type: 'STATE_UPDATED', state: this.state });
    }
  }

  /**
   * @deprecated Use questService.completeQuest() directly for new code
   */
  completeQuest(questId: string) {
    questService.completeQuest(this.state, questId);
    this.checkQuests(); // Check if this completion triggers others
    this.updateState({});
  }

  /**
   * @deprecated Use questService.claimQuestReward() directly for new code
   */
  claimQuestReward(questId: string) {
    const result = questService.claimQuestReward(this.state, questId);
    if (result.success) {
      this.updateState({});
    }
  }

  /**
   * @deprecated Use questService.rerollQuest() directly for new code
   */
  rerollQuest(questId: string) {
    const success = questService.rerollQuest(this.state, questId);
    if (success) {
      this.updateState({});
    }
  }

  /**
   * @deprecated Use questService.refreshDailyQuests() directly for new code
   */
  refreshDailyQuests() {
    const changed = questService.refreshDailyQuests(this.state);
    if (changed) {
      this.updateState({});
    }
  }

  /**
   * @deprecated Use battleService.handleBattleEnd() directly for new code
   */
  handleBattleEnd(winner: 'PLAYER' | 'ENEMY' | 'CAPTURED', enemySpeciesId: string, enemyLevel: number, isBoss: boolean) {
    battleService.handleBattleEnd(this.state, winner, enemySpeciesId, enemyLevel, isBoss);

    if (winner === 'PLAYER') {
      bus.emitEvent({ type: 'MONSTER_DEFEATED', speciesId: enemySpeciesId, level: enemyLevel });
    }

    this.checkQuests();
    this.autoSave();
    bus.emitEvent({ type: 'STATE_UPDATED', state: this.state });
  }

  /**
   * @deprecated Use battleService.grantRewards() directly for new code
   */
  grantRewards(enemySpeciesId: string, enemyLevel: number, isBoss: boolean = false) {
    battleService.grantRewards(this.state, enemySpeciesId, enemyLevel, isBoss);
    this.checkQuests();
    this.autoSave();
    bus.emitEvent({ type: 'STATE_UPDATED', state: this.state });
  }

  /**
   * @deprecated Use battleService.grantExp() directly for new code
   */
  grantExp(monsterUid: string, amount: number) {
    battleService.grantExp(this.state, monsterUid, amount);
    this.checkQuests();
    this.autoSave();
    bus.emitEvent({ type: 'STATE_UPDATED', state: this.state });
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
        bus.emitEvent({ type: 'LOG_MESSAGE', message: `Expedition complete! Claim your rewards.` });
      }
    });
  }

  // ===== EQUIPMENT SYSTEM =====

  /**
   * Check if tamer can equip an item
   */
  canEquipItem(itemId: string): { canEquip: boolean; reason?: string } {
    const equipment = EQUIPMENT[itemId];
    if (!equipment) {
      return { canEquip: false, reason: 'Equipment not found' };
    }

    // Check level requirement
    if (this.state.tamer.level < equipment.requiredLevel) {
      return { canEquip: false, reason: `Level ${equipment.requiredLevel} required` };
    }

    // Check if tamer owns this item
    const inventoryItem = this.state.tamer.inventory.find(i => i.itemId === itemId);
    if (!inventoryItem || inventoryItem.quantity < 1) {
      return { canEquip: false, reason: 'Item not in inventory' };
    }

    return { canEquip: true };
  }

  /**
   * Equip an item to a slot
   */
  equipItem(itemId: string): { success: boolean; message: string } {
    const canEquip = this.canEquipItem(itemId);
    if (!canEquip.canEquip) {
      return { success: false, message: canEquip.reason || 'Cannot equip' };
    }

    const equipment = EQUIPMENT[itemId];
    const slot = equipment.slot;

    // Unequip existing item in slot if any
    const currentEquipped = this.state.tamer.equippedItems[slot];
    if (currentEquipped) {
      this.unequipItem(slot);
    }

    // Equip new item
    this.state.tamer.equippedItems[slot] = itemId;

    // Remove from inventory (equipment is "worn" not consumed)
    // Actually, we should keep it in inventory but mark as equipped
    // For simplicity, we'll just track in equippedItems

    this.updateState({});
    bus.emitEvent({
      type: 'LOG_MESSAGE',
      message: `Equipped ${equipment.name}!`
    });

    return { success: true, message: `Equipped ${equipment.name}` };
  }

  /**
   * Unequip an item from a slot
   */
  unequipItem(slot: string): { success: boolean; message: string } {
    const itemId = this.state.tamer.equippedItems[slot as keyof typeof this.state.tamer.equippedItems];

    if (!itemId) {
      return { success: false, message: 'No item equipped in this slot' };
    }

    const equipment = EQUIPMENT[itemId];

    // Remove from equipped
    delete this.state.tamer.equippedItems[slot as keyof typeof this.state.tamer.equippedItems];

    // Add back to inventory (if we had removed it)
    // Since we didn't remove it, no need to add back

    this.updateState({});
    bus.emitEvent({
      type: 'LOG_MESSAGE',
      message: `Unequipped ${equipment?.name || 'item'}`
    });

    return { success: true, message: 'Item unequipped' };
  }

  /**
   * Get total stat bonuses from all equipped items
   */
  getEquippedStats(): Partial<Stats> {
    const totalStats: Partial<Stats> = {};

    Object.values(this.state.tamer.equippedItems).forEach(itemId => {
      if (!itemId) return;

      const equipment = EQUIPMENT[itemId];
      if (!equipment || !equipment.stats) return;

      // Add each stat
      Object.entries(equipment.stats).forEach(([stat, value]) => {
        const key = stat as keyof Stats;
        if (typeof value === 'number') {
          totalStats[key] = (totalStats[key] || 0) + value;
        }
      });
    });

    return totalStats;
  }

  /**
   * Get tamer's effective stats including equipment bonuses
   */
  getTamerEffectiveStats(): Stats {
    const baseStats: Stats = {
      hp: 100,
      maxHp: 100 + (this.state.tamer.level * 10),
      attack: 10 + (this.state.tamer.level * 2),
      defense: 10 + (this.state.tamer.level * 2),
      specialAttack: 10 + (this.state.tamer.level * 2),
      skillResistance: 10 + (this.state.tamer.level * 2),
      speed: 50 + this.state.tamer.level
    };

    const equipBonus = this.getEquippedStats();

    // Merge bonuses
    Object.entries(equipBonus).forEach(([stat, value]) => {
      const key = stat as keyof Stats;
      if (typeof value === 'number' && baseStats[key] !== undefined) {
        (baseStats[key] as number) += value;
      }
    });

    return baseStats;
  }

  /**
   * Get all equipment items (for shop/inventory UI)
   */
  getAllEquipment(): typeof EQUIPMENT_DATA {
    return EQUIPMENT_DATA;
  }

  /**
   * Replace entire state (e.g. loading from save)
   */
  setState(newState: GameState): void {
    this.state = newState;
    bus.emitEvent({ type: 'STATE_UPDATED', state: this.state });
  }
}

export const gameStateManager = new GameStateManager();
