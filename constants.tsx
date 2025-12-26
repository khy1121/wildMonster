
import { MonsterSpecies, Skill, ElementType, Item } from './types';

export const SKILLS: Record<string, Skill> = {
  'scratch': {
    id: 'scratch',
    name: 'Scratch',
    description: 'Basic physical attack.',
    type: ElementType.NEUTRAL,
    power: 10,
    cooldown: 2,
    animationType: 'impact'
  },
  'ember': {
    id: 'ember',
    name: 'Ember',
    description: 'Small flame burst.',
    type: ElementType.FIRE,
    power: 20,
    cooldown: 4,
    animationType: 'projectile'
  },
  'bubble': {
    id: 'bubble',
    name: 'Bubble',
    description: 'Quick water bubble.',
    type: ElementType.WATER,
    power: 18,
    cooldown: 3.5,
    animationType: 'projectile'
  },
  'leaf_blade': {
    id: 'leaf_blade',
    name: 'Leaf Blade',
    description: 'Sharp leaf slash.',
    type: ElementType.GRASS,
    power: 22,
    cooldown: 5,
    animationType: 'impact'
  },
  'spark': {
    id: 'spark',
    name: 'Spark',
    description: 'Crackling electric shock.',
    type: ElementType.ELECTRIC,
    power: 25,
    cooldown: 4.5,
    animationType: 'projectile'
  }
};

export const MONSTERS: Record<string, MonsterSpecies> = {
  'pyrocat': {
    id: 'pyrocat',
    name: 'Pyrocat',
    type: ElementType.FIRE,
    icon: '🔥',
    rarity: 'Common',
    baseStats: { hp: 50, maxHp: 50, attack: 12, defense: 8, speed: 10 },
    learnableSkills: [
      { level: 1, skillId: 'scratch' },
      { level: 5, skillId: 'ember' }
    ],
    evolutions: [
      { targetSpeciesId: 'inferlion', levelThreshold: 15, description: 'Evolves into Inferlion at Lvl 15' }
    ]
  },
  'inferlion': {
    id: 'inferlion',
    name: 'Inferlion',
    type: ElementType.FIRE,
    icon: '🦁',
    rarity: 'Uncommon',
    baseStats: { hp: 100, maxHp: 100, attack: 25, defense: 18, speed: 15 },
    learnableSkills: [{ level: 1, skillId: 'ember' }],
    evolutions: []
  },
  'droplet': {
    id: 'droplet',
    name: 'Droplet',
    type: ElementType.WATER,
    icon: '💧',
    rarity: 'Common',
    baseStats: { hp: 60, maxHp: 60, attack: 8, defense: 12, speed: 8 },
    learnableSkills: [
      { level: 1, skillId: 'scratch' },
      { level: 5, skillId: 'bubble' }
    ],
    evolutions: [
      { targetSpeciesId: 'tidalkraken', levelThreshold: 18, description: 'Evolves into Tidalkraken at Lvl 18' }
    ]
  },
  'tidalkraken': {
    id: 'tidalkraken',
    name: 'Tidalkraken',
    type: ElementType.WATER,
    icon: '🐙',
    rarity: 'Rare',
    baseStats: { hp: 120, maxHp: 120, attack: 20, defense: 25, speed: 10 },
    learnableSkills: [{ level: 1, skillId: 'bubble' }],
    evolutions: []
  },
  'sprout': {
    id: 'sprout',
    name: 'Sprout',
    type: ElementType.GRASS,
    icon: '🌱',
    rarity: 'Common',
    baseStats: { hp: 55, maxHp: 55, attack: 10, defense: 10, speed: 9 },
    learnableSkills: [
      { level: 1, skillId: 'scratch' },
      { level: 5, skillId: 'leaf_blade' }
    ],
    evolutions: []
  }
};

export const ITEMS: Record<string, Item> = {
  'potion': {
    id: 'potion',
    name: 'Small Potion',
    description: 'Heals 20 HP.',
    category: 'Healing',
    value: 50
  },
  'capture_orb': {
    id: 'capture_orb',
    name: 'Capture Orb',
    description: 'Used to capture wild monsters.',
    category: 'Capture',
    value: 100
  }
};
