
import { SupportSkill } from '../domain/types';

export const SUPPORT_SKILLS: Record<string, SupportSkill> = {
  'cheer': {
    id: 'cheer',
    name: 'Cheer',
    description: 'Boost active monster Attack by 5 for 10s.',
    icon: '📣',
    cooldown: 15000,
    effect: 'BUFF_ATK',
    power: 5
  },
  'first_aid': {
    id: 'first_aid',
    name: 'First Aid',
    description: 'Heal active monster for 25 HP.',
    icon: '🩹',
    cooldown: 20000,
    effect: 'HEAL',
    power: 25
  },
  'rally': {
    id: 'rally',
    name: 'Rally',
    description: 'Cleanse all skill cooldowns for active monster.',
    icon: '🎺',
    cooldown: 45000,
    effect: 'CLEANSE',
    power: 0
  }
};

export interface TamerMilestone {
  level: number;
  partySlots?: number;
  unlockSkill?: string;
}

export const TAMER_MILESTONES: TamerMilestone[] = [
  { level: 1, partySlots: 1, unlockSkill: 'cheer' },
  { level: 3, partySlots: 2 },
  { level: 5, unlockSkill: 'first_aid' },
  { level: 7, partySlots: 3 },
  { level: 10, unlockSkill: 'rally' },
  { level: 12, partySlots: 4 }
];
