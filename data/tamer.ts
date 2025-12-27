
import { SupportSkill } from '../domain/types';

export const SUPPORT_SKILLS: Record<string, SupportSkill> = {
  // --- LEO (Warrior) ---
  'leo_rage': {
    id: 'leo_rage',
    name: 'Rage Shout',
    description: 'Boost Attack by 10 for 20s.',
    icon: '🗯️',
    cooldown: 25000,
    duration: 20000,
    effect: 'BUFF_ATK',
    power: 10
  },
  'leo_iron': {
    id: 'leo_iron',
    name: 'Iron Will',
    description: 'Boost Defense by 10 for 20s.',
    icon: '🛡️',
    cooldown: 30000,
    duration: 20000,
    effect: 'BUFF_DEF',
    power: 10
  },
  'leo_war_cry': {
    id: 'leo_war_cry',
    name: 'War Cry',
    description: 'Boost Attack by 30 for 20s.',
    icon: '⚔️',
    cooldown: 40000,
    duration: 20000,
    effect: 'BUFF_ATK',
    power: 30
  },
  'leo_pride': {
    id: 'leo_pride',
    name: "Lion's Pride",
    description: 'Boost Attack/Defense by 20 for 30s.',
    icon: '🦁',
    cooldown: 60000,
    duration: 30000,
    effect: 'BUFF_ATK', // Logic should handle multi-buff but types are simple for now
    power: 20
  },
  'leo_king': {
    id: 'leo_king',
    name: 'King of Beasts',
    description: 'Boost Attack by 60 for 15s.',
    icon: '👑',
    cooldown: 90000,
    duration: 15000,
    effect: 'BUFF_ATK',
    power: 60
  },

  // --- KEN (Scholar) ---
  'ken_eye': {
    id: 'ken_eye',
    name: 'Tactical Eye',
    description: 'Boost Speed by 15 for 20s.',
    icon: '👁️',
    cooldown: 25000,
    duration: 20000,
    effect: 'BUFF_SPD',
    power: 15
  },
  'ken_scan': {
    id: 'ken_scan',
    name: 'Weakness Scan',
    description: 'Enemy Defense -15 for 20s.',
    icon: '🔍',
    cooldown: 35000,
    duration: 20000,
    effect: 'DEBUFF_DEF',
    power: 15
  },
  'ken_command': {
    id: 'ken_command',
    name: 'Precise Command',
    description: 'Boost Speed by 30 for 20s.',
    icon: '📡',
    cooldown: 45000,
    duration: 20000,
    effect: 'BUFF_SPD',
    power: 30
  },
  'ken_strategy': {
    id: 'ken_strategy',
    name: 'Grand Strategy',
    description: 'Boost Attack by 25 for 30s.',
    icon: '🗺️',
    cooldown: 70000,
    duration: 30000,
    effect: 'BUFF_ATK',
    power: 25
  },

  // --- ELARA (Mystic) ---
  'elara_heal': {
    id: 'elara_heal',
    name: 'Spirit Heal',
    description: 'Heal active monster for 50 HP.',
    icon: '✨',
    cooldown: 25000,
    effect: 'HEAL',
    power: 50
  },
  'elara_regen': {
    id: 'elara_regen',
    name: 'Inner Peace',
    description: 'Cleanse & Regen 10 HP/s for 10s.',
    icon: '🧘',
    cooldown: 40000,
    duration: 10000,
    effect: 'REGEN',
    power: 10
  },
  'elara_flow': {
    id: 'elara_flow',
    name: 'Spirit Flow',
    description: 'Heal active monster for 150 HP.',
    icon: '🌊',
    cooldown: 45000,
    effect: 'HEAL',
    power: 150
  },

  // --- ZOE (Ranger) ---
  'zoe_wind': {
    id: 'zoe_wind',
    name: 'Tailwind',
    description: 'Boost Speed by 20 for 20s.',
    icon: '🍃',
    cooldown: 25000,
    duration: 20000,
    effect: 'BUFF_SPD',
    power: 20
  },
  'zoe_lock': {
    id: 'zoe_lock',
    name: 'Target Lock',
    description: 'Next attack power boost (represented by ATK buff).',
    icon: '🎯',
    cooldown: 30000,
    duration: 10000,
    effect: 'BUFF_ATK',
    power: 15
  },
  'zoe_hurricane': {
    id: 'zoe_hurricane',
    name: 'Hurricane',
    description: 'Boost Speed by 40 for 20s.',
    icon: '🌀',
    cooldown: 45000,
    duration: 20000,
    effect: 'BUFF_SPD',
    power: 40
  }
};

export interface TamerMilestone {
  level: number;
  partySlots?: number;
  unlockSkill?: string | Record<string, string>; // Support Record<characterId, skillId>
}

export const TAMER_MILESTONES: TamerMilestone[] = [
  { level: 1, partySlots: 1 },
  { level: 3, unlockSkill: { leo: 'leo_rage', ken: 'ken_eye', elara: 'elara_heal', zoe: 'zoe_wind' } },
  { level: 5, partySlots: 2 },
  { level: 7, unlockSkill: { leo: 'leo_iron', ken: 'ken_scan', elara: 'elara_regen', zoe: 'zoe_lock' } },
  { level: 10, partySlots: 3 },
  { level: 15, unlockSkill: { leo: 'leo_war_cry', ken: 'ken_command', elara: 'elara_flow', zoe: 'zoe_hurricane' } },
  { level: 20, partySlots: 4 },
  { level: 25, unlockSkill: { leo: 'leo_pride', ken: 'ken_strategy' } },
  { level: 30, partySlots: 5 },
  { level: 35, unlockSkill: { elara: 'elara_flow' } }, // Reusing or adding more later
  { level: 40, partySlots: 6 },
  { level: 50, unlockSkill: { leo: 'leo_king' } }
];
