
import { MonsterSpecies, ElementType, FactionType } from '../domain/types';

export const MONSTER_DATA: Record<string, MonsterSpecies> = {
  // --- STARTERS & THEIR EVOLUTIONS ---
  ignis: {
    id: 'ignis',
    name: 'Ignis',
    type: ElementType.FIRE,
    faction: FactionType.EMBER_CLAN,
    baseStats: { hp: 50, maxHp: 50, attack: 14, defense: 10, speed: 12 },
    icon: '🦖',
    rarity: 'Rare',
    learnableSkills: [{ level: 1, skillId: 'ember' }, { level: 5, skillId: 'scratch' }],
    evolutions: [
      { targetSpeciesId: 'flarehide', levelThreshold: 10, description: 'Focus on physical power.', previewSkills: ['tackle'] },
      { targetSpeciesId: 'volcadragon', levelThreshold: 20, description: 'Direct path to volcano lord.', previewSkills: ['fire_blast'] }
    ]
  },
  flarehide: {
    id: 'flarehide',
    name: 'Flarehide',
    type: ElementType.FIRE,
    faction: FactionType.EMBER_CLAN,
    baseStats: { hp: 120, maxHp: 120, attack: 35, defense: 25, speed: 30 },
    icon: '🐉',
    rarity: 'Uncommon',
    learnableSkills: [{ level: 12, skillId: 'fire_blast' }],
    evolutions: [{ targetSpeciesId: 'volcadragon', levelThreshold: 25, description: 'Ultimate fire master.', previewSkills: ['rally'] }]
  },
  volcadragon: {
    id: 'volcadragon',
    name: 'Volcadragon',
    type: ElementType.FIRE,
    faction: FactionType.EMBER_CLAN,
    baseStats: { hp: 350, maxHp: 350, attack: 95, defense: 75, speed: 80 },
    icon: '🔥🐉',
    rarity: 'Legendary',
    learnableSkills: [{ level: 30, skillId: 'fire_blast' }]
  },

  aqualo: {
    id: 'aqualo',
    name: 'Aqualo',
    type: ElementType.WATER,
    faction: FactionType.TIDE_WATCHERS,
    baseStats: { hp: 60, maxHp: 60, attack: 10, defense: 12, speed: 10 },
    icon: '🐡',
    rarity: 'Rare',
    learnableSkills: [{ level: 1, skillId: 'bubble' }, { level: 5, skillId: 'first_aid' }],
    evolutions: [
      { targetSpeciesId: 'serpentform', levelThreshold: 10, description: 'Graceful sea serpent.', previewSkills: ['ice_shard'] },
      { targetSpeciesId: 'krakenwhale', levelThreshold: 25, description: 'Ocean titan.', previewSkills: ['water_blast'] }
    ]
  },
  serpentform: {
    id: 'serpentform',
    name: 'Serpentform',
    type: ElementType.WATER,
    faction: FactionType.TIDE_WATCHERS,
    baseStats: { hp: 140, maxHp: 140, attack: 32, defense: 28, speed: 35 },
    icon: '🐍',
    rarity: 'Uncommon',
    learnableSkills: [{ level: 12, skillId: 'ice_shard' }],
    evolutions: [{ targetSpeciesId: 'krakenwhale', levelThreshold: 25, description: 'Ruler of the deep ocean.', previewSkills: ['water_blast'] }]
  },
  krakenwhale: {
    id: 'krakenwhale',
    name: 'Krakenwhale',
    type: ElementType.WATER,
    faction: FactionType.TIDE_WATCHERS,
    baseStats: { hp: 450, maxHp: 450, attack: 85, defense: 95, speed: 65 },
    icon: '🐋',
    rarity: 'Legendary'
  },

  voltwing: {
    id: 'voltwing',
    name: 'Voltwing',
    type: ElementType.ELECTRIC,
    faction: FactionType.STORM_HERDERS,
    baseStats: { hp: 45, maxHp: 45, attack: 12, defense: 8, speed: 16 },
    icon: '🐥',
    rarity: 'Rare',
    learnableSkills: [{ level: 1, skillId: 'scratch' }, { level: 5, skillId: 'ember' }],
    evolutions: [
      { targetSpeciesId: 'stormhawk', levelThreshold: 10, description: 'Lightning fast raptor.', previewSkills: ['tackle'] },
      { targetSpeciesId: 'thundernebula', levelThreshold: 25, description: 'Electric avatar.', previewSkills: ['rally'] }
    ]
  },
  stormhawk: {
    id: 'stormhawk',
    name: 'Stormhawk',
    type: ElementType.ELECTRIC,
    faction: FactionType.STORM_HERDERS,
    baseStats: { hp: 110, maxHp: 110, attack: 40, defense: 20, speed: 45 },
    icon: '🦅',
    rarity: 'Uncommon',
    evolutions: [{ targetSpeciesId: 'thundernebula', levelThreshold: 25, description: 'Avatar of the electric storm.', previewSkills: ['rally'] }]
  },
  thundernebula: {
    id: 'thundernebula',
    name: 'Thundernebula',
    type: ElementType.ELECTRIC,
    faction: FactionType.STORM_HERDERS,
    baseStats: { hp: 320, maxHp: 320, attack: 105, defense: 60, speed: 110 },
    icon: '🌩️🦅',
    rarity: 'Legendary'
  },

  // --- EXISTING MONSTERS ---
  'pyrocat': {
    id: 'pyrocat',
    name: 'Pyrocat',
    type: ElementType.FIRE,
    faction: FactionType.EMBER_CLAN,
    icon: '🔥',
    rarity: 'Common',
    baseStats: { hp: 50, maxHp: 50, attack: 12, defense: 8, speed: 10 },
    learnableSkills: [
      { level: 1, skillId: 'scratch' },
      { level: 5, skillId: 'ember' },
      { level: 15, skillId: 'fire_blast' }
    ],
    evolutions: [
      {
        targetSpeciesId: 'flarelion',
        levelThreshold: 10,
        description: 'Evolution into Flarelion.',
        previewSkills: ['ember', 'fire_blast']
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
    baseStats: { hp: 70, maxHp: 70, attack: 18, defense: 10, speed: 25 },
    learnableSkills: [
      { level: 1, skillId: 'scratch' },
      { level: 8, skillId: 'dark_pulse' }
    ]
  },
  'thunderhoof': {
    id: 'thunderhoof',
    name: 'Thunderhoof',
    type: ElementType.ELECTRIC,
    faction: FactionType.STORM_HERDERS,
    icon: '🦌',
    rarity: 'Legendary',
    isSpecial: true,
    baseStats: { hp: 150, maxHp: 150, attack: 35, defense: 20, speed: 30 },
    learnableSkills: [
      { level: 1, skillId: 'scratch' },
      { level: 6, skillId: 'spark' }
    ]
  },
  'flarelion': {
    id: 'flarelion',
    name: 'Flarelion',
    type: ElementType.FIRE,
    faction: FactionType.EMBER_CLAN,
    icon: '🦁',
    rarity: 'Uncommon',
    baseStats: { hp: 100, maxHp: 100, attack: 28, defense: 15, speed: 18 },
    learnableSkills: [
      { level: 1, skillId: 'ember' },
      { level: 12, skillId: 'fire_blast' }
    ]
  },
  'droplet': {
    id: 'droplet',
    name: 'Droplet',
    type: ElementType.WATER,
    faction: FactionType.TIDE_WATCHERS,
    icon: '💧',
    rarity: 'Common',
    baseStats: { hp: 60, maxHp: 60, attack: 8, defense: 12, speed: 8 },
    learnableSkills: [
      { level: 1, skillId: 'tackle' },
      { level: 5, skillId: 'bubble' }
    ],
    evolutions: [
      {
        targetSpeciesId: 'mistlynx',
        levelThreshold: 12,
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
    learnableSkills: [
      { level: 1, skillId: 'bubble' },
      { level: 10, skillId: 'ice_shard' }
    ]
  },
  'puffle': {
    id: 'puffle',
    name: 'Puffle',
    type: ElementType.GRASS,
    faction: FactionType.GLADE_KEEPERS,
    icon: '🌿',
    rarity: 'Common',
    baseStats: {
      hp: 55,
      maxHp: 55,
      attack: 9,
      defense: 14,
      speed: 7
    },
    learnableSkills: [
      { level: 1, skillId: 'tackle' },
      { level: 5, skillId: 'bubble' }
    ]
  }
};
