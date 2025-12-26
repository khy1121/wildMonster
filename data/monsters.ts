
import { MonsterSpecies, ElementType, FactionType } from '../domain/types';

export const MONSTER_DATA: Record<string, MonsterSpecies> = {
  'pyrocat': {
    id: 'pyrocat',
    name: 'Pyrocat',
    type: ElementType.FIRE,
    faction: FactionType.EMBER_CLAN,
    icon: '🔥',
    rarity: 'Common',
    baseStats: { hp: 50, maxHp: 50, attack: 12, defense: 8, speed: 10 },
    learnableSkills: ['scratch', 'ember'],
    lootTable: [{ itemId: 'potion', chance: 0.3, minQuantity: 1, maxQuantity: 1 }],
    evolutions: [
      { 
        targetSpeciesId: 'flarelion', 
        levelThreshold: 10, 
        requiredNodeId: 'p_fire_special',
        requiredItemId: 'sun_stone',
        description: 'Requires Sun Stone and Solar Core node.',
        previewSkills: ['ember', 'fire_blast']
      },
      { 
        targetSpeciesId: 'shadowcat', 
        levelThreshold: 10, 
        requiredNodeId: 'p_dark_special',
        requiredItemId: 'moon_stone',
        description: 'Requires Moon Stone and Lunar Shroud node.',
        previewSkills: ['scratch', 'dark_pulse']
      }
    ]
  },
  'lunacat': {
    id: 'lunacat',
    name: 'Lunacat',
    type: ElementType.DARK,
    faction: FactionType.GLOOM_STALKERS,
    icon: '🐈',
    rarity: 'Rare',
    isSpecial: true,
    auraColor: 0x818cf8,
    baseStats: { hp: 70, maxHp: 70, attack: 18, defense: 10, speed: 25 },
    learnableSkills: ['scratch', 'dark_pulse'],
    spawnConditions: [
      { type: 'TIME_OF_DAY', value: 'NIGHT' }
    ],
    lootTable: [{ itemId: 'moon_stone', chance: 0.2, minQuantity: 1, maxQuantity: 1 }]
  },
  'thunderhoof': {
    id: 'thunderhoof',
    name: 'Thunderhoof',
    type: ElementType.ELECTRIC,
    faction: FactionType.STORM_HERDERS,
    icon: '🦌',
    rarity: 'Legendary',
    isSpecial: true,
    auraColor: 0xfacc15,
    baseStats: { hp: 150, maxHp: 150, attack: 35, defense: 20, speed: 30 },
    learnableSkills: ['scratch', 'ember'], 
    spawnConditions: [
      { type: 'LEVEL_MIN', value: 10 }
    ],
    lootTable: [{ itemId: 'capture_orb', chance: 1.0, minQuantity: 3, maxQuantity: 5 }]
  },
  'flarelion': {
    id: 'flarelion',
    name: 'Flarelion',
    type: ElementType.FIRE,
    faction: FactionType.EMBER_CLAN,
    icon: '🦁',
    rarity: 'Uncommon',
    baseStats: { hp: 100, maxHp: 100, attack: 28, defense: 15, speed: 18 },
    learnableSkills: ['ember', 'fire_blast'],
    evolutions: []
  },
  'shadowcat': {
    id: 'shadowcat',
    name: 'Shadowcat',
    type: ElementType.DARK,
    faction: FactionType.GLOOM_STALKERS,
    icon: '🐈‍⬛',
    rarity: 'Uncommon',
    baseStats: { hp: 80, maxHp: 80, attack: 22, defense: 12, speed: 30 },
    learnableSkills: ['scratch', 'dark_pulse'],
    evolutions: []
  },
  'droplet': {
    id: 'droplet',
    name: 'Droplet',
    type: ElementType.WATER,
    faction: FactionType.TIDE_WATCHERS,
    icon: '💧',
    rarity: 'Common',
    baseStats: { hp: 60, maxHp: 60, attack: 8, defense: 12, speed: 8 },
    learnableSkills: ['tackle', 'bubble'],
    lootTable: [{ itemId: 'potion', chance: 0.4, minQuantity: 1, maxQuantity: 1 }],
    evolutions: [
      { 
        targetSpeciesId: 'mistlynx', 
        levelThreshold: 12, 
        requiredNodeId: 'd_mist',
        description: 'Graceful hunter of the fog.',
        previewSkills: ['bubble', 'ice_shard']
      }
    ]
  },
  'mistlynx': {
    id: 'mistlynx',
    name: 'Mistlynx',
    type: ElementType.WATER,
    faction: FactionType.TIDE_WATCHERS,
    icon: '🐆',
    rarity: 'Uncommon',
    baseStats: { hp: 95, maxHp: 95, attack: 24, defense: 18, speed: 22 },
    learnableSkills: ['bubble', 'ice_shard'],
    evolutions: []
  }
};
