
export enum ElementType {
  FIRE = 'FIRE',
  WATER = 'WATER',
  GRASS = 'GRASS',
  ELECTRIC = 'ELECTRIC',
  NEUTRAL = 'NEUTRAL',
  DARK = 'DARK',
  LIGHT = 'LIGHT'
}

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Legendary';

export interface Stats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'Healing' | 'Capture' | 'Evolution' | 'Misc';
  power: number;
  price: number;
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
  cooldown: number;
  effect: 'HEAL' | 'BUFF_ATK' | 'CLEANSE';
  power: number;
}

export interface MonsterSpecies {
  id: string;
  name: string;
  type: ElementType;
  baseStats: Stats;
  icon: string;
  rarity: Rarity;
  learnableSkills?: string[];
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

export interface Tamer {
  name: string;
  level: number;
  exp: number;
  party: MonsterInstance[];
  storage: MonsterInstance[];
  gold: number;
  inventory: InventoryItem[];
  unlockedPartySlots: number;
  unlockedSupportSkills: string[];
  collection: string[]; // List of encountered species IDs
}

export interface GameState {
  version: number;
  tamer: Tamer;
  worldPosition: { x: number; y: number };
  currentScene: string;
  flags: Record<string, boolean | number | string>;
  gameTime: number;
  completedQuests: string[];
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
  | { type: 'QUEST_COMPLETED'; questId: string };

export interface BattleRewards {
  exp: number;
  gold: number;
  items: { itemId: string; quantity: number }[];
}
