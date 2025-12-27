
export enum ElementType {
  FIRE = 'FIRE',
  WATER = 'WATER',
  GRASS = 'GRASS',
  ELECTRIC = 'ELECTRIC',
  NEUTRAL = 'NEUTRAL',
  DARK = 'DARK',
  LIGHT = 'LIGHT'
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

export interface Item {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'Healing' | 'Capture' | 'Evolution' | 'Weapon' | 'Armor' | 'Accessory' | 'Material' | 'Misc';
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
}

export interface MonsterInstance {
  uid: string;
  speciesId: string;
  level: number;
  exp: number;
  currentHp: number;
  currentStats: Stats;
  evolutionHistory: string[];
  skillPoints: number;
  unlockedNodes: string[];
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
  inventory: InventoryItem[];
  unlockedPartySlots: number;
  unlockedSupportSkills: string[];
  collection: string[];
}

export interface GameState {
  version: number;
  tamer: Tamer;
  worldPosition: { x: number; y: number };
  currentScene: string;
  flags: Record<string, boolean | number | string>;
  gameTime: number;
  completedQuests: string[];
  reputation: Record<FactionType, number>;
  language: Language;
  shopStock?: string[];
  shopNextRefresh?: number;
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
  | { type: 'RETURN_TO_TITLE' };

export interface BattleRewards {
  exp: number;
  gold: number;
  items: { itemId: string; quantity: number }[];
}
