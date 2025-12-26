
export enum ElementType {
  FIRE = 'FIRE',
  WATER = 'WATER',
  GRASS = 'GRASS',
  ELECTRIC = 'ELECTRIC',
  NEUTRAL = 'NEUTRAL'
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: ElementType;
  power: number;
  cooldown: number; // in seconds
  animationType: 'projectile' | 'impact' | 'self';
}

export interface EvolutionRule {
  targetSpeciesId: string;
  levelThreshold: number;
  requiredItemId?: string;
  description: string;
}

export interface MonsterSpecies {
  id: string;
  name: string;
  type: ElementType;
  baseStats: Stats;
  learnableSkills: { level: number; skillId: string }[];
  evolutions: EvolutionRule[];
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
  icon: string;
}

export interface Stats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface MonsterInstance {
  uid: string;
  speciesId: string;
  nickname?: string;
  level: number;
  exp: number;
  currentStats: Stats;
  activeSkills: string[];
}

export interface Item {
  id: string;
  name: string;
  description: string;
  category: 'Healing' | 'Capture' | 'Evolution' | 'Misc';
  value: number;
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
}

export interface Tamer {
  name: string;
  level: number;
  exp: number;
  party: MonsterInstance[];
  storage: MonsterInstance[];
  inventory: InventoryItem[];
  maxPartySize: number;
  gold: number;
}

export type GameView = 'WORLD' | 'BATTLE' | 'MENU' | 'EVOLUTION' | 'LOADING';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  tamer: Tamer;
  view: GameView;
  currentWorldPosition: Position;
  battle?: BattleState;
}

export interface BattleState {
  playerMonsters: BattleEntity[];
  enemyMonsters: BattleEntity[];
  log: string[];
  isOver: boolean;
  winner?: 'PLAYER' | 'ENEMY';
}

export interface BattleEntity extends MonsterInstance {
  currentHp: number;
  maxHp: number;
  cooldowns: Record<string, number>; // skillId: remainingMs
  targetUid?: string;
  position: Position; // 0-100 range for arena layout
}
