
import { ElementType, SkillTree } from '../domain/types';

export interface Skill {
  id: string;
  name: string;
  type: ElementType;
  category: 'BASIC' | 'SPECIAL' | 'ULTIMATE';
  power: number;
  cooldown: number; // in milliseconds
  description: string;
}

export const SKILL_DATA: Record<string, Skill> = {
  // --- BASIC ---
  'scratch': { id: 'scratch', name: 'Scratch', type: ElementType.NEUTRAL, category: 'BASIC', power: 15, cooldown: 1000, description: 'Quick claws attack.' },
  'tackle': { id: 'tackle', name: 'Tackle', type: ElementType.NEUTRAL, category: 'BASIC', power: 18, cooldown: 1200, description: 'Basic physical charge.' },
  'sonic_blade': { id: 'sonic_blade', name: 'Sonic Blade', type: ElementType.ELECTRIC, category: 'BASIC', power: 30, cooldown: 1000, description: 'Speed-based slash.' },
  'blazing_strike': { id: 'blazing_strike', name: 'Blazing Strike', type: ElementType.FIRE, category: 'BASIC', power: 35, cooldown: 1200, description: 'Fiery impact.' },
  'ocean_slash': { id: 'ocean_slash', name: 'Ocean Slash', type: ElementType.WATER, category: 'BASIC', power: 32, cooldown: 1100, description: 'Fluid sword strike.' },

  // --- SPECIAL ---
  'ember': { id: 'ember', name: 'Ember', type: ElementType.FIRE, category: 'SPECIAL', power: 45, cooldown: 4000, description: 'Small burst of flame.' },
  'bubble': { id: 'bubble', name: 'Bubble', type: ElementType.WATER, category: 'SPECIAL', power: 42, cooldown: 3500, description: 'Spray of bubbles.' },
  'spark': { id: 'spark', name: 'Spark', type: ElementType.ELECTRIC, category: 'SPECIAL', power: 40, cooldown: 3000, description: 'Quick electric jolt.' },
  'fire_blast': { id: 'fire_blast', name: 'Fire Blast', type: ElementType.FIRE, category: 'SPECIAL', power: 110, cooldown: 8000, description: 'Devastating inferno wave.' },
  'ice_shard': { id: 'ice_shard', name: 'Ice Shard', type: ElementType.WATER, category: 'SPECIAL', power: 85, cooldown: 6000, description: 'Freezing shards.' },
  'dark_pulse': { id: 'dark_pulse', name: 'Dark Pulse', type: ElementType.DARK, category: 'SPECIAL', power: 100, cooldown: 7000, description: 'Shadow energy wave.' },
  'lightning_storm': { id: 'lightning_storm', name: 'Lightning Storm', type: ElementType.ELECTRIC, category: 'SPECIAL', power: 120, cooldown: 9000, description: 'Calls down thunder.' },
  'tidal_wave': { id: 'tidal_wave', name: 'Tidal Wave', type: ElementType.WATER, category: 'SPECIAL', power: 115, cooldown: 8500, description: 'Massive water surge.' },

  // --- ULTIMATE ---
  'magma_surge': { id: 'magma_surge', name: 'Magma Surge', type: ElementType.FIRE, category: 'ULTIMATE', power: 250, cooldown: 25000, description: 'Erupts the battlefield.' },
  'kraken_wrath': { id: 'kraken_wrath', name: 'Kraken Wrath', type: ElementType.WATER, category: 'ULTIMATE', power: 280, cooldown: 30000, description: 'Crushes with depth power.' },
  'volt_overload': { id: 'volt_overload', name: 'Volt Overload', type: ElementType.ELECTRIC, category: 'ULTIMATE', power: 260, cooldown: 28000, description: 'Blinding electric discharge.' },
  'inferno_doom': { id: 'inferno_doom', name: 'Inferno Doom', type: ElementType.FIRE, category: 'ULTIMATE', power: 400, cooldown: 45000, description: 'Total fire annihilation.' },
  'abyssal_surge': { id: 'abyssal_surge', name: 'Abyssal Surge', type: ElementType.WATER, category: 'ULTIMATE', power: 420, cooldown: 45000, description: 'Swallows all in the abyss.' },
  'divine_thunder': { id: 'divine_thunder', name: 'Divine Thunder', type: ElementType.ELECTRIC, category: 'ULTIMATE', power: 450, cooldown: 45000, description: 'Judgment from the skies.' },
  'world_on_fire': { id: 'world_on_fire', name: 'World on Fire', type: ElementType.FIRE, category: 'ULTIMATE', power: 600, cooldown: 60000, description: 'Ultimate stage 4 apocalypse.' },
  'deluge_end': { id: 'deluge_end', name: 'Deluge of the End', type: ElementType.WATER, category: 'ULTIMATE', power: 650, cooldown: 60000, description: 'Ultimate stage 4 ocean wrath.' },
  'eternal_spark': { id: 'eternal_spark', name: 'Eternal Spark', type: ElementType.ELECTRIC, category: 'ULTIMATE', power: 700, cooldown: 60000, description: 'Ultimate stage 4 electric flare.' }
};

export const SKILL_TREES: Record<string, SkillTree> = {
  'pyrocat': {
    speciesId: 'pyrocat',
    nodes: [
      { id: 'p_speed_1', name: 'Swift Paws', description: '+5 Speed', cost: 1, prerequisites: [], effect: { type: 'stat', value: { speed: 5 } }, position: { x: 1, y: 0 } },
      { id: 'p_atk_1', name: 'Heated Claws', description: '+5 Attack', cost: 1, prerequisites: [], effect: { type: 'stat', value: { attack: 5 } }, position: { x: 1, y: 2 } },
      { id: 'p_fire_special', name: 'Solar Core', description: 'Condition for Flarelion', cost: 2, prerequisites: ['p_speed_1'], effect: { type: 'stat', value: { attack: 10 } }, position: { x: 3, y: 0 } },
      { id: 'p_dark_special', name: 'Lunar Shroud', description: 'Condition for Shadowcat', cost: 2, prerequisites: ['p_atk_1'], effect: { type: 'stat', value: { speed: 10 } }, position: { x: 3, y: 2 } }
    ]
  },
  'droplet': {
    speciesId: 'droplet',
    nodes: [
      { id: 'd_def_1', name: 'Fluid Armor', description: '+5 Defense', cost: 1, prerequisites: [], effect: { type: 'stat', value: { defense: 5 } }, position: { x: 1, y: 1 } },
      { id: 'd_ice', name: 'Cold Snap', description: 'Unlock Ice Shard', cost: 2, prerequisites: ['d_def_1'], effect: { type: 'skill', value: 'ice_shard' }, position: { x: 3, y: 1 } },
      { id: 'd_mist', name: 'Mist Mastery', description: 'Condition for Mistlynx', cost: 2, prerequisites: ['d_ice'], effect: { type: 'stat', value: { speed: 8 } }, position: { x: 5, y: 1 } }
    ]
  },
  'ignis': {
    speciesId: 'ignis',
    nodes: [
      { id: 'i_atk_1', name: 'Kindle', description: '+5 Attack', cost: 1, prerequisites: [], effect: { type: 'stat', value: { attack: 5 } }, position: { x: 1, y: 1 } },
      { id: 'i_blast', name: 'Magma Burst', description: 'Unlock Fire Blast', cost: 3, prerequisites: ['i_atk_1'], effect: { type: 'skill', value: 'fire_blast' }, position: { x: 3, y: 1 } },
      { id: 'i_hp_1', name: 'Lava Skin', description: '+30 Max HP', cost: 2, prerequisites: ['i_atk_1'], effect: { type: 'stat', value: { maxHp: 30 } }, position: { x: 2, y: 2 } }
    ]
  },
  'aqualo': {
    speciesId: 'aqualo',
    nodes: [
      { id: 'a_def_1', name: 'Water Veil', description: '+5 Defense', cost: 1, prerequisites: [], effect: { type: 'stat', value: { defense: 5 } }, position: { x: 1, y: 1 } },
      { id: 'a_shard', name: 'Frost Spike', description: 'Unlock Ice Shard', cost: 3, prerequisites: ['a_def_1'], effect: { type: 'skill', value: 'ice_shard' }, position: { x: 3, y: 1 } },
      { id: 'a_healing', name: 'Purification', description: '+20 Max HP', cost: 2, prerequisites: ['a_def_1'], effect: { type: 'stat', value: { maxHp: 20 } }, position: { x: 2, y: 0 } }
    ]
  },
  'voltwing': {
    speciesId: 'voltwing',
    nodes: [
      { id: 'v_spd_1', name: 'Static Charge', description: '+5 Speed', cost: 1, prerequisites: [], effect: { type: 'stat', value: { speed: 5 } }, position: { x: 1, y: 1 } },
      { id: 'v_dash', name: 'Spark Dash', description: '+8 Attack', cost: 3, prerequisites: ['v_spd_1'], effect: { type: 'stat', value: { attack: 8 } }, position: { x: 3, y: 1 } },
      { id: 'v_crit', name: 'Voltage Focus', description: '+5 Speed', cost: 2, prerequisites: ['v_spd_1'], effect: { type: 'stat', value: { speed: 5 } }, position: { x: 2, y: 2 } }
    ]
  }
};
