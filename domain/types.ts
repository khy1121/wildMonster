
export enum ElementType {
  FIRE = 'FIRE',
  WATER = 'WATER',
  GRASS = 'GRASS',
  ELECTRIC = 'ELECTRIC',
  NEUTRAL = 'NEUTRAL',
  DARK = 'DARK',
  LIGHT = 'LIGHT',
  ICE = 'ICE',
  VOID = 'VOID'
}

export enum FactionType {
  EMBER_CLAN = 'EMBER_CLAN',
  TIDE_WATCHERS = 'TIDE_WATCHERS',
  STORM_HERDERS = 'STORM_HERDERS',
  GLOOM_STALKERS = 'GLOOM_STALKERS',
  GLADE_KEEPERS = 'GLADE_KEEPERS'
}

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
export type Language = 'ko' | 'en';

export interface Stats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  skillResistance: number;
  speed: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'Healing' | 'Capture' | 'Evolution' | 'Weapon' | 'Armor' | 'Accessory' | 'Material' | 'Egg' | 'Incubator' | 'Misc' | 'Equipment';
  tier?: 'D' | 'C' | 'B' | 'A' | 'S';
  power: number;
  price: number;
  stats?: Partial<Stats>;
  requiredMaterials?: InventoryItem[];
  allowedTypes?: ElementType[];
  flavorText?: string;
  factionLock?: FactionType;
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  cost: number;
  prerequisites: string[];
  effect: {
    type: 'skill' | 'stat';
    value: string | Partial<Stats>;
  };
  position: { x: number; y: number };
}

export interface SkillTree {
  speciesId: string;
  nodes: SkillNode[];
}

export interface SpawnCondition {
  type: 'LEVEL_MIN' | 'QUEST_FLAG' | 'TIME_OF_DAY';
  value: string | number;
}

export interface EvolutionOption {
  targetSpeciesId: string;
  levelThreshold: number;
  description: string;
  previewSkills: string[];
  requiredNodeId?: string;
  requiredItemId?: string;
  requiredFlag?: string;
}

export interface LootEntry {
  itemId: string;
  chance: number;
  minQuantity: number;
  maxQuantity: number;
}

export interface SupportSkill {
  id: string;
  name: string;
  description: string;
  icon: string;
  cooldown: number; // ms
  duration?: number; // ms
  effect: 'HEAL' | 'BUFF_ATK' | 'BUFF_DEF' | 'BUFF_SPD' | 'CLEANSE' | 'DEBUFF_DEF' | 'REGEN';
  power: number;
}

export interface Skill {
  id: string;
  name: string;
  type: ElementType;
  category: 'BASIC' | 'SPECIAL' | 'ULTIMATE';
  power: number;
  cooldown: number; // in milliseconds
  description: string;
}

export interface MonsterSpecies {
  id: string;
  name: string;
  type: ElementType;
  faction: FactionType;
  baseStats: Stats;
  icon: string;
  rarity: Rarity;
  evolutionStage: 1 | 2 | 3 | 4;
  skills: {
    basic: string;
    special: string;
    ultimate?: string;
  };
  learnableSkills?: { level: number; skillId: string }[];
  lootTable?: LootEntry[];
  evolutions?: EvolutionOption[];
  isSpecial?: boolean;
  auraColor?: number;
  spawnConditions?: SpawnCondition[];
  spriteKey?: string;
}

export interface MonsterInstance {
  uid: string;
  speciesId: string;
  level: number;
  exp: number;
  currentHp: number;
  currentStats: Stats;
  enhancementLevel: number; // 0-15
  heldItemId?: string;      // Equipped item
  evolutionHistory: string[];
  skillPoints: number;
  unlockedNodes: string[];
}

export interface IncubatorSlot {
  id: string;
  eggItemId: string;
  materials: InventoryItem[];
  startTime: number;
  duration: number; // in gameTime units
  isComplete: boolean;
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  rewardGold: number;
  rewardExp: number;
  rewardItems?: InventoryItem[];
  requiredFlag?: string;
  requiredLevel?: number;
  category: 'DAILY' | 'WEEKLY' | 'STORY' | 'CHALLENGE';
  progressMax?: number; // For quests like "Catch 3 monsters"
}

export type AchievementCategory = 'combat' | 'collection' | 'progression' | 'economy';

export interface Achievement {
  id: string;
  name: string;
  nameKo?: string;  // Korean translation
  description: string;
  descriptionKo?: string;  // Korean translation
  category: AchievementCategory;
  target: number;  // e.g., 100 for "Defeat 100 monsters"
  reward: {
    gold?: number;
    items?: { itemId: string; quantity: number }[];
    title?: string;
  };
  icon: string;
}

export interface DailyLoginState {
  lastLoginDate: string;  // ISO date string (YYYY-MM-DD)
  consecutiveDays: number;
  claimedToday: boolean;
}

export interface ActiveExpedition {
  expeditionId: string;
  monsterUids: string[];
  startTime: number;  // timestamp
  endTime: number;
}

export interface Expedition {
  id: string;
  name: string;
  nameKo?: string;  // Korean translation
  description: string;
  descriptionKo?: string;  // Korean translation
  duration: number;  // in milliseconds
  requirements: {
    minLevel?: number;
    element?: ElementType;
    partySize: number;
  };
  rewards: {
    gold: number;
    exp: number;
    items?: { itemId: string; chance: number }[];
  };
  icon: string;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
  startingBonus?: Partial<Stats>;
}

export interface Tamer {
  name: string;
  level: number;
  exp: number;
  characterId?: string;
  party: MonsterInstance[];
  storage: MonsterInstance[];
  gold: number;
  maxSpiritPoints: number; // For Tamer skills (DS)
  currentSpiritPoints: number;
  inventory: InventoryItem[];
  unlockedPartySlots: number;
  unlockedStorageSlots: number;
  unlockedSupportSkills: string[];
  collection: string[];
  // Phase 4: Achievements
  achievementProgress: Record<string, number>;  // achievementId -> current progress
  unlockedAchievements: string[];  // completed achievement IDs
  // Phase 4: Expeditions
  activeExpeditions: ActiveExpedition[];
  expeditionSlots: number;  // default 1
}

export interface GameState {
  version: number;
  tamer: Tamer;
  worldPosition: { x: number; y: number };
  currentScene: string;
  flags: Record<string, boolean | number | string>;
  gameTime: number;
  language: Language;
  activeQuests: string[];
  completedQuests: string[];
  pendingRewards: string[];
  reputation: Record<string, number>;
  lastQuestRefresh: number;
  lastWeeklyRefresh?: number;
  shopStock?: string[];
  shopNextRefresh?: number;
  incubators: IncubatorSlot[];
  // Phase 4
  dailyLogin: DailyLoginState;
  // Phase 5: World Building
  currentRegion: string;  // Current region ID
  unlockedRegions: string[];  // Unlocked region IDs
  unlockedPortals: string[];  // Unlocked portal IDs
  storyProgress: StoryProgress;
  activeQuestObjectives: Record<string, QuestObjective[]>;  // questId -> objectives
  foundLoreNotes: string[];  // Lore note IDs
}

export type GameEvent =
  | { type: 'BATTLE_START'; enemySpeciesId: string }
  | { type: 'BATTLE_END'; winner: 'PLAYER' | 'ENEMY' | 'CAPTURED' }
  | { type: 'STATE_UPDATED'; state: GameState }
  | { type: 'SCENE_CHANGED'; sceneKey: string }
  | { type: 'REWARD_EARNED'; rewards: BattleRewards }
  | { type: 'MONSTER_CAPTURED'; monster: MonsterInstance }
  | { type: 'EVOLUTION_READY'; monsterUid: string; options: EvolutionOption[] }
  | { type: 'SKILL_UNLOCKED'; monsterUid: string; nodeId: string }
  | { type: 'TAMER_LEVEL_UP'; level: number }
  | { type: 'QUEST_COMPLETED'; questId: string }
  | { type: 'REPUTATION_CHANGED'; faction: FactionType; delta: number; total: number }
  | { type: 'RETURN_TO_TITLE' }
  | { type: 'LOG_MESSAGE'; message: string }
  | { type: 'ACHIEVEMENT_UNLOCKED'; achievementId: string }
  | { type: 'EXPEDITION_COMPLETE'; expeditionId: string };

export interface BattleRewards {
  exp: number;
  gold: number;
  items: { itemId: string; quantity: number }[];
}

export interface BattleEntity {
  uid: string;
  speciesId: string;
  level: number;
  currentStats: Stats;
  maxHp: number;
  currentHp: number;
  activeSkills: string[];
  cooldowns: Record<string, number>;
  position: { x: number; y: number };
  enhancementLevel: number;
  heldItemId?: string;
}

export interface BattleState {
  playerMonsters: BattleEntity[];
  enemyMonsters: BattleEntity[];
  log: string[];
}

// ===== PHASE 5: World Building Types =====

export type EnvironmentType = 'forest' | 'ocean' | 'mountain' | 'cave' | 'meadow' | 'frozen' | 'sky' | 'void';
export type WeatherType = 'clear' | 'rain' | 'thunderstorm' | 'blizzard' | 'fog' | 'rainbow';
export type MonsterRarity = 'common' | 'uncommon' | 'rare' | 'elite' | 'hidden' | 'mythic' | 'legendary';

export interface Portal {
  id: string;
  name: string;
  nameKo?: string;
  fromRegion: string;
  toRegion: string;
  unlockLevel: number;
  unlockQuest?: string;
  bossRequired?: boolean;
  icon: string;
}

export interface EncounterPool {
  common: string[];      // 70% chance
  uncommon: string[];    // 25% chance
  rare: string[];        // 5% chance
  elite?: string[];      // 2% from common/uncommon pool, 1.5x stats
  hidden?: string[];     // Weather/time dependent
  mythic?: string[];     // Very rare, 0.1% chance
}

export interface Region {
  id: string;
  name: string;
  nameKo?: string;
  description: string;
  descriptionKo?: string;
  element: ElementType;
  levelRange: { tamer: { min: number; max: number }; wilder: { min: number; max: number } };
  encounterPool: EncounterPool;
  boss: string;  // Boss ID
  quests: string[];  // Quest IDs
  portals: string[];  // Portal IDs
  npcs: string[];  // NPC IDs
  loreNotes: string[];  // Lore Note IDs
  bgMusic?: string;
  environment: EnvironmentType;
  weather?: WeatherType;
  isSafeZone?: boolean;
}

export interface BossPhase {
  hpThreshold: number;  // Percentage (0-100)
  pattern: string[];
  description: string;
  descriptionKo?: string;
}

export interface BossEncounter {
  id: string;
  name: string;
  nameKo?: string;
  speciesId: string;  // Uses monster template
  level: number;
  maxHp: number;
  phases: BossPhase[];
  enrageTimer?: number;  // Milliseconds
  guaranteedRewards: {
    gold: number;
    exp: number;
    items: { itemId: string; quantity: number }[];
    fragment?: string;  // Story fragment ID
  };
  icon: string;
  defeated: boolean;
}

export type QuestType = 'main' | 'side' | 'lore' | 'hidden';
export type QuestStatus = 'locked' | 'available' | 'active' | 'completed';

export interface QuestObjective {
  type: 'defeat' | 'collect' | 'talk' | 'explore' | 'evolve' | 'capture';
  target: string;  // Monster ID, Item ID, NPC ID, Region ID
  count: number;
  current: number;
  description: string;
  descriptionKo?: string;
}

export interface Quest {
  id: string;
  type: QuestType;
  name: string;
  nameKo?: string;
  description: string;
  descriptionKo?: string;
  region: string;
  requiresLevel?: number;
  prerequisites?: string[];  // Quest IDs
  objectives: QuestObjective[];
  rewards: {
    gold: number;
    exp: number;
    items?: { itemId: string; quantity: number }[];
    unlocks?: string[];  // Portal IDs, Region IDs
  };
  npcGiver?: string;
  status: QuestStatus;
}

export interface NPC {
  id: string;
  name: string;
  nameKo?: string;
  role: string;
  roleKo?: string;
  region: string;
  dialogue: {
    greeting: string;
    greetingKo?: string;
    questAvailable?: string;
    questAvailableKo?: string;
    questActive?: string;
    questActiveKo?: string;
    questComplete?: string;
    questCompleteKo?: string;
  };
  icon: string;
  quests?: string[];  // Quest IDs this NPC gives
}

export interface LoreNote {
  id: string;
  title: string;
  titleKo?: string;
  content: string;
  contentKo?: string;
  region: string;
  category: 'history' | 'character' | 'world' | 'fragment';
  found: boolean;
}

export type EndingType = 'good' | 'true' | 'dark';

export interface StoryProgress {
  fragmentsCollected: number;
  bossesDefeated: string[];
  mainQuestsCompleted: string[];
  loreNotesFound: number;
  currentAct: number;
  endingAchieved?: EndingType;
}
