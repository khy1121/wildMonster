
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
    description: 'Reach Tamer level 5 to prove your potential.',
    requiredLevel: 5,
    rewardGold: 500,
    rewardExp: 200,
    rewardItems: [{ itemId: 'potion', quantity: 5 }]
  },
  {
    id: 'collector_beginner',
    title: 'Collection 101',
    description: 'Capture at least 3 different species of monsters.',
    rewardGold: 300,
    rewardExp: 150,
    rewardItems: [{ itemId: 'capture_orb', quantity: 5 }]
  },
  {
    id: 'gold_saver',
    title: 'Thrifty Tamer',
    description: 'Accumulate 1000 gold in your wallet.',
    rewardGold: 200,
    rewardExp: 100,
    rewardItems: [{ itemId: 'potion', quantity: 3 }]
  },
  {
    id: 'defeat_lunacat',
    title: 'Night Stalker',
    description: 'Defeat the elusive Lunacat that appears in the fields at night.',
    requiredLevel: 10,
    requiredFlag: 'lunacat_defeated',
    rewardGold: 1500,
    rewardExp: 1000,
    rewardItems: [{ itemId: 'sun_stone', quantity: 1 }, { itemId: 'moon_stone', quantity: 1 }]
  },
  {
    id: 'evolution_master',
    title: 'Metamorphosis',
    description: 'Successfully evolve one of your monsters to its next stage.',
    requiredFlag: 'evolved_once',
    rewardGold: 800,
    rewardExp: 400,
    rewardItems: [{ itemId: 'capture_orb', quantity: 10 }]
  }
];
