
import { ElementType, SkillTree } from '../domain/types';

export interface Skill {
  id: string;
  name: string;
  type: ElementType;
  power: number;
  cooldown: number; // in milliseconds
  description: string;
}

export const SKILL_DATA: Record<string, Skill> = {
  'tackle': { id: 'tackle', name: 'Tackle', type: ElementType.NEUTRAL, power: 10, cooldown: 1500, description: 'A basic physical charge.' },
  'ember': { id: 'ember', name: 'Ember', type: ElementType.FIRE, power: 25, cooldown: 4000, description: 'A small burst of flame.' },
  'bubble': { id: 'bubble', name: 'Bubble', type: ElementType.WATER, power: 22, cooldown: 3500, description: 'Shoots a spray of bubbles.' },
  'scratch': { id: 'scratch', name: 'Scratch', type: ElementType.NEUTRAL, power: 12, cooldown: 1200, description: 'Quick claws attack.' },
  'fire_blast': { id: 'fire_blast', name: 'Fire Blast', type: ElementType.FIRE, power: 45, cooldown: 8000, description: 'A devastating inferno wave.' },
  'dark_pulse': { id: 'dark_pulse', name: 'Dark Pulse', type: ElementType.DARK, power: 35, cooldown: 6000, description: 'Releases a wave of shadow energy.' },
  'ice_shard': { id: 'ice_shard', name: 'Ice Shard', type: ElementType.WATER, power: 30, cooldown: 5000, description: 'Rapidly fire freezing shards.' }
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
  }
};
