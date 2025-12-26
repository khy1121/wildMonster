
import { Quest } from '../domain/types';

export const QUEST_DATA: Quest[] = [
  {
    id: 'first_capture',
    title: 'The Tamer Path',
    description: 'Capture your first wild monster using a Capture Orb.',
    rewardGold: 100,
    rewardExp: 50,
    rewardItems: [{ itemId: 'capture_orb', quantity: 3 }]
  },
  {
    id: 'reach_level_5',
    title: 'Rising Star',
    description: 'Reach Tamer level 5 to unlock more party slots.',
    requiredLevel: 5,
    rewardGold: 500,
    rewardExp: 200,
    rewardItems: [{ itemId: 'potion', quantity: 5 }]
  },
  {
    id: 'boss_slayer',
    title: 'Guardian of the Fields',
    description: 'Defeat the special monster Lunacat at night.',
    requiredFlag: 'lunacat_defeated',
    rewardGold: 1000,
    rewardExp: 500,
    rewardItems: [{ itemId: 'sun_stone', quantity: 1 }]
  }
];
