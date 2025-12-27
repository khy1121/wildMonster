import { Quest } from '../domain/types';

export const QUEST_DATA: Quest[] = [
  // --- STORY QUESTS (1-10) ---
  {
    id: 'first_capture',
    title: 'The Tamer Path',
    description: 'Capture your first wild monster using a Capture Orb.',
    rewardGold: 100,
    rewardExp: 50,
    rewardItems: [{ itemId: 'capture_orb', quantity: 3 }],
    category: 'STORY'
  },
  {
    id: 'reach_level_5',
    title: 'Rising Star',
    description: 'Reach Tamer level 5 to prove your potential.',
    requiredLevel: 5,
    rewardGold: 500,
    rewardExp: 200,
    rewardItems: [{ itemId: 'potion', quantity: 5 }],
    category: 'STORY'
  },
  {
    id: 'defeat_lunacat',
    title: 'Night Stalker',
    description: 'Defeat the elusive Lunacat that appears in the fields at night.',
    requiredLevel: 10,
    requiredFlag: 'lunacat_defeated',
    rewardGold: 1500,
    rewardExp: 1000,
    rewardItems: [{ itemId: 'sun_stone', quantity: 1 }, { itemId: 'moon_stone', quantity: 1 }],
    category: 'STORY'
  },
  {
    id: 'story_capture_5',
    title: 'Growing Collection',
    description: 'Capture 5 different species of monsters.',
    rewardGold: 800,
    rewardExp: 400,
    category: 'STORY'
  },
  {
    id: 'reach_level_10',
    title: 'Tamer Apprentice',
    description: 'Reach Tamer level 10.',
    requiredLevel: 10,
    rewardGold: 1000,
    rewardExp: 500,
    category: 'STORY'
  },
  {
    id: 'reach_level_20',
    title: 'Tamer Professional',
    description: 'Reach Tamer level 20.',
    requiredLevel: 20,
    rewardGold: 2000,
    rewardExp: 1000,
    category: 'STORY'
  },
  {
    id: 'defeat_boss_flarelion',
    title: 'Trial of Fire',
    description: 'Defeat the Alpha Flarelion.',
    requiredFlag: 'boss_flarelion_defeated',
    rewardGold: 5000,
    rewardExp: 2500,
    rewardItems: [{ itemId: 'blazing_fang', quantity: 1 }],
    category: 'STORY'
  },
  {
    id: 'defeat_boss_krakenwhale',
    title: 'Depths of the Ocean',
    description: 'Defeat the Alpha Krakenwhale.',
    requiredFlag: 'boss_krakenwhale_defeated',
    rewardGold: 6000,
    rewardExp: 3000,
    rewardItems: [{ itemId: 'tidal_blade', quantity: 1 }],
    category: 'STORY'
  },
  {
    id: 'reach_level_50',
    title: 'The Ultimate Tamer',
    description: 'Reach Tamer level 50.',
    requiredLevel: 50,
    rewardGold: 10000,
    rewardExp: 5000,
    category: 'STORY'
  },

  // --- DAILY QUESTS (11-25) ---
  {
    id: 'daily_win_3',
    title: 'Morning Drill',
    description: 'Win 3 battles against wild monsters.',
    rewardGold: 200,
    rewardExp: 100,
    category: 'DAILY',
    progressMax: 3
  },
  {
    id: 'daily_win_5',
    title: 'Battle Hardened',
    description: 'Win 5 battles against wild monsters.',
    rewardGold: 350,
    rewardExp: 150,
    category: 'DAILY',
    progressMax: 5
  },
  {
    id: 'daily_capture_1',
    title: 'Quick Catch',
    description: 'Capture 1 wild monster.',
    rewardGold: 150,
    rewardExp: 75,
    category: 'DAILY',
    progressMax: 1
  },
  {
    id: 'daily_capture_3',
    title: 'Recruitment Drive',
    description: 'Capture 3 wild monsters.',
    rewardGold: 400,
    rewardExp: 200,
    category: 'DAILY',
    progressMax: 3
  },
  {
    id: 'daily_item_use',
    title: 'Prep Time',
    description: 'Use 5 items.',
    rewardGold: 150,
    rewardExp: 75,
    category: 'DAILY',
    progressMax: 5
  },
  {
    id: 'daily_item_use_10',
    title: 'Inventory Check',
    description: 'Use 10 items.',
    rewardGold: 300,
    rewardExp: 150,
    category: 'DAILY',
    progressMax: 10
  },
  {
    id: 'daily_spend_100',
    title: 'Local Customer',
    description: 'Spend 100 gold at the shop.',
    rewardGold: 50,
    rewardExp: 50,
    category: 'DAILY',
    progressMax: 100
  },
  {
    id: 'daily_spend_500',
    title: 'Big Spender',
    description: 'Spend 500 gold at the shop.',
    rewardGold: 200,
    rewardExp: 100,
    category: 'DAILY',
    progressMax: 500
  },
  {
    id: 'daily_win_fire',
    title: 'Extinguish Flames',
    description: 'Defeat 3 Fire type monsters.',
    rewardGold: 250,
    rewardExp: 125,
    category: 'DAILY',
    progressMax: 3
  },
  {
    id: 'daily_win_water',
    title: 'Tame the Tides',
    description: 'Defeat 3 Water type monsters.',
    rewardGold: 250,
    rewardExp: 125,
    category: 'DAILY',
    progressMax: 3
  },
  {
    id: 'daily_win_grass',
    title: 'Weed Out',
    description: 'Defeat 3 Grass type monsters.',
    rewardGold: 250,
    rewardExp: 125,
    category: 'DAILY',
    progressMax: 3
  },
  {
    id: 'daily_win_electric',
    title: 'Ground the Current',
    description: 'Defeat 3 Electric type monsters.',
    rewardGold: 250,
    rewardExp: 125,
    category: 'DAILY',
    progressMax: 3
  },
  {
    id: 'daily_win_neutral',
    title: 'Balance of Power',
    description: 'Defeat 3 Neutral type monsters.',
    rewardGold: 200,
    rewardExp: 100,
    category: 'DAILY',
    progressMax: 3
  },
  {
    id: 'daily_win_dark_light',
    title: 'Twilight Duel',
    description: 'Defeat 3 Dark or Light type monsters.',
    rewardGold: 300,
    rewardExp: 150,
    category: 'DAILY',
    progressMax: 3
  },
  {
    id: 'daily_earn_500',
    title: 'Profit Hunter',
    description: 'Earn 500 gold from battles.',
    rewardGold: 100,
    rewardExp: 50,
    category: 'DAILY',
    progressMax: 500
  },

  // --- WEEKLY QUESTS (26-35) ---
  {
    id: 'weekly_monster_collector',
    title: 'Master Collector',
    description: 'Capture total 10 monsters this week.',
    rewardGold: 2000,
    rewardExp: 1000,
    rewardItems: [{ itemId: 'monster_core', quantity: 5 }],
    category: 'WEEKLY',
    progressMax: 10
  },
  {
    id: 'weekly_win_20',
    title: 'Battle Marathon',
    description: 'Win 20 battles against wild monsters.',
    rewardGold: 1500,
    rewardExp: 750,
    category: 'WEEKLY',
    progressMax: 20
  },
  {
    id: 'weekly_win_50',
    title: 'Grand Champion',
    description: 'Win 50 battles against wild monsters.',
    rewardGold: 4000,
    rewardExp: 2000,
    category: 'WEEKLY',
    progressMax: 50
  },
  {
    id: 'weekly_capture_5_rare',
    title: 'Rare Specialist',
    description: 'Capture 5 Rare or higher rarity monsters.',
    rewardGold: 3000,
    rewardExp: 1500,
    rewardItems: [{ itemId: 'spirit_essence', quantity: 1 }],
    category: 'WEEKLY',
    progressMax: 5
  },
  {
    id: 'weekly_spend_5000',
    title: 'Market Roller',
    description: 'Spend 5000 gold at the shop.',
    rewardGold: 1000,
    rewardExp: 500,
    category: 'WEEKLY',
    progressMax: 5000
  },
  {
    id: 'weekly_evolve_3',
    title: 'Evolutionary Peak',
    description: 'Evolve 3 monsters.',
    rewardGold: 2500,
    rewardExp: 1250,
    category: 'WEEKLY',
    progressMax: 3
  },
  {
    id: 'weekly_earn_5000',
    title: 'Gold Tycoon',
    description: 'Earn 5000 gold from battles.',
    rewardGold: 1000,
    rewardExp: 500,
    category: 'WEEKLY',
    progressMax: 5000
  },
  {
    id: 'weekly_item_use_30',
    title: 'Resourceful',
    description: 'Use 30 items.',
    rewardGold: 1000,
    rewardExp: 500,
    category: 'WEEKLY',
    progressMax: 30
  },
  {
    id: 'weekly_boss_slayer_3',
    title: 'Titan Slayer',
    description: 'Defeat 3 Alpha monsters (Bosses).',
    rewardGold: 5000,
    rewardExp: 2500,
    rewardItems: [{ itemId: 'ancient_scrap', quantity: 5 }],
    category: 'WEEKLY',
    progressMax: 3
  },
  {
    id: 'weekly_spend_10000',
    title: 'Market Titan',
    description: 'Spend 10000 gold at the shop.',
    rewardGold: 2500,
    rewardExp: 1000,
    category: 'WEEKLY',
    progressMax: 10000
  },
  {
    id: 'weekly_completionist',
    title: 'Weekly Completionist',
    description: 'Complete 10 other quests this week.',
    rewardGold: 5000,
    rewardExp: 2500,
    category: 'WEEKLY',
    progressMax: 10
  },

  // --- CHALLENGE QUESTS (36-50) ---
  {
    id: 'collector_beginner',
    title: 'Collection 101',
    description: 'Capture at least 3 different species of monsters.',
    rewardGold: 300,
    rewardExp: 150,
    rewardItems: [{ itemId: 'capture_orb', quantity: 5 }],
    category: 'CHALLENGE'
  },
  {
    id: 'collector_pro',
    title: 'Collection Expert',
    description: 'Capture at least 20 different species of monsters.',
    rewardGold: 2000,
    rewardExp: 1000,
    rewardItems: [{ itemId: 'capture_orb', quantity: 20 }],
    category: 'CHALLENGE'
  },
  {
    id: 'collector_master',
    title: 'Grand Master Explorer',
    description: 'Capture at least 50 different species of monsters.',
    rewardGold: 10000,
    rewardExp: 5000,
    category: 'CHALLENGE'
  },
  {
    id: 'gold_saver',
    title: 'Thrifty Tamer',
    description: 'Accumulate 1000 gold in your wallet.',
    rewardGold: 200,
    rewardExp: 100,
    rewardItems: [{ itemId: 'potion', quantity: 3 }],
    category: 'CHALLENGE'
  },
  {
    id: 'gold_millionaire',
    title: 'Gold Hoarder',
    description: 'Accumulate 100,000 gold in your wallet.',
    rewardGold: 10000,
    rewardExp: 5000,
    category: 'CHALLENGE'
  },
  {
    id: 'evolution_master',
    title: 'Lord of Change',
    description: 'Successfully evolve 10 monsters.',
    rewardGold: 3000,
    rewardExp: 1500,
    category: 'CHALLENGE',
    progressMax: 10
  },
  {
    id: 'rare_hunter',
    title: 'Rare Hunter',
    description: 'Capture a monster with "Rare" or higher rarity.',
    rewardGold: 1000,
    rewardExp: 500,
    category: 'CHALLENGE'
  },
  {
    id: 'legendary_hunter',
    title: 'Legendary Hunter',
    description: 'Capture a monster with "Legendary" rarity.',
    rewardGold: 10000,
    rewardExp: 5000,
    category: 'CHALLENGE'
  },
  {
    id: 'faction_friend',
    title: 'Trusted Ally',
    description: 'Reach 100 Reputation with any faction.',
    rewardGold: 1000,
    rewardExp: 500,
    category: 'CHALLENGE'
  },
  {
    id: 'faction_hero',
    title: 'Faction Hero',
    description: 'Reach 500 Reputation with any faction.',
    rewardGold: 5000,
    rewardExp: 2500,
    category: 'CHALLENGE'
  },
  {
    id: 'skill_unlock_10',
    title: 'Power Awakening',
    description: 'Unlock 10 skill nodes across your monsters.',
    rewardGold: 1000,
    rewardExp: 500,
    category: 'CHALLENGE',
    progressMax: 10
  },
  {
    id: 'skill_unlock_all',
    title: 'Master of One',
    description: 'Unlock all skill nodes for a single monster.',
    rewardGold: 5000,
    rewardExp: 2500,
    category: 'CHALLENGE'
  },
  {
    id: 'win_streak_10',
    title: 'Unstoppable',
    description: 'Win 10 battles in a row without losing a monster.',
    rewardGold: 1000,
    rewardExp: 500,
    category: 'CHALLENGE',
    progressMax: 10
  },
  {
    id: 'win_streak_50',
    title: 'God of Battle',
    description: 'Win 50 battles in a row.',
    rewardGold: 10000,
    rewardExp: 5000,
    category: 'CHALLENGE',
    progressMax: 50
  },
  {
    id: 'pesticide_specialist',
    title: 'Pesticide Specialist',
    description: 'Defeat 100 Puffles.',
    rewardGold: 2000,
    rewardExp: 1000,
    category: 'CHALLENGE',
    progressMax: 100
  }
];
