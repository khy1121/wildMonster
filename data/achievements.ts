import { Achievement } from '../domain/types';

export const ACHIEVEMENT_DATA: Achievement[] = [
    // Combat Achievements
    {
        id: 'combat_first_victory',
        name: 'First Blood',
        description: 'Win your first battle',
        category: 'combat',
        target: 1,
        reward: { gold: 100 },
        icon: '⚔️'
    },
    {
        id: 'combat_10_victories',
        name: 'Battle Veteran',
        description: 'Win 10 battles',
        category: 'combat',
        target: 10,
        reward: { gold: 500, items: [{ itemId: 'potion', quantity: 3 }] },
        icon: '🏆'
    },
    {
        id: 'combat_50_victories',
        name: 'Battle Master',
        description: 'Win 50 battles',
        category: 'combat',
        target: 50,
        reward: { gold: 2000, items: [{ itemId: 'power_clone_d', quantity: 2 }] },
        icon: '🎖️'
    },
    {
        id: 'combat_100_victories',
        name: 'Legendary Warrior',
        description: 'Win 100 battles',
        category: 'combat',
        target: 100,
        reward: { gold: 5000, items: [{ itemId: 'attack_ring', quantity: 1 }], title: 'Legendary' },
        icon: '👑'
    },

    // Collection Achievements
    {
        id: 'collection_first_capture',
        name: 'Tamer Initiate',
        description: 'Capture your first monster',
        category: 'collection',
        target: 1,
        reward: { gold: 100 },
        icon: '🎯'
    },
    {
        id: 'collection_5_species',
        name: 'Collector',
        description: 'Register 5 different species in your collection',
        category: 'collection',
        target: 5,
        reward: { gold: 500, items: [{ itemId: 'normal_egg', quantity: 1 }] },
        icon: '📚'
    },
    {
        id: 'collection_10_species',
        name: 'Dedicated Collector',
        description: 'Register 10 different species in your collection',
        category: 'collection',
        target: 10,
        reward: { gold: 1500, items: [{ itemId: 'fire_egg', quantity: 1 }] },
        icon: '📖'
    },
    {
        id: 'collection_hatch_first',
        name: 'Egg Hatcher',
        description: 'Hatch your first egg',
        category: 'collection',
        target: 1,
        reward: { gold: 200 },
        icon: '🐣'
    },
    {
        id: 'collection_hatch_5',
        name: 'Incubation Expert',
        description: 'Hatch 5 eggs',
        category: 'collection',
        target: 5,
        reward: { gold: 1000, items: [{ itemId: 'fire_data', quantity: 5 }] },
        icon: '🥚'
    },

    // Progression Achievements
    {
        id: 'progression_tamer_5',
        name: 'Rising Tamer',
        description: 'Reach Tamer Level 5',
        category: 'progression',
        target: 5,
        reward: { gold: 300 },
        icon: '⬆️'
    },
    {
        id: 'progression_tamer_10',
        name: 'Experienced Tamer',
        description: 'Reach Tamer Level 10',
        category: 'progression',
        target: 10,
        reward: { gold: 1000, items: [{ itemId: 'super_potion', quantity: 5 }] },
        icon: '🌟'
    },
    {
        id: 'progression_monster_lvl_20',
        name: 'Monster Trainer',
        description: 'Level a monster to 20',
        category: 'progression',
        target: 20,
        reward: { gold: 800, items: [{ itemId: 'power_clone_d', quantity: 1 }] },
        icon: '💪'
    },
    {
        id: 'progression_enhance_3',
        name: 'Enhancement Beginner',
        description: 'Enhance a monster to +3',
        category: 'progression',
        target: 3,
        reward: { gold: 500 },
        icon: '✨'
    },
    {
        id: 'progression_enhance_5',
        name: 'Enhancement Adept',
        description: 'Enhance a monster to +5',
        category: 'progression',
        target: 5,
        reward: { gold: 1500, items: [{ itemId: 'backup_disk', quantity: 2 }] },
        icon: '💎'
    },
    {
        id: 'progression_first_evolution',
        name: 'Evolution!',
        description: 'Evolve a monster for the first time',
        category: 'progression',
        target: 1,
        reward: { gold: 500 },
        icon: '🦋'
    },

    // Economy Achievements
    {
        id: 'economy_earn_1000',
        name: 'Budgeter',
        description: 'Earn a total of 1,000 gold',
        category: 'economy',
        target: 1000,
        reward: { items: [{ itemId: 'potion', quantity: 2 }] },
        icon: '💰'
    },
    {
        id: 'economy_earn_10000',
        name: 'Wealthy Tamer',
        description: 'Earn a total of 10,000 gold',
        category: 'economy',
        target: 10000,
        reward: { gold: 2000, items: [{ itemId: 'health_necklace', quantity: 1 }] },
        icon: '💵'
    },
    {
        id: 'economy_spend_5000',
        name: 'Big Spender',
        description: 'Spend a total of 5,000 gold',
        category: 'economy',
        target: 5000,
        reward: { gold: 1000 },
        icon: '🛒'
    },
];

// Quick lookup by ID
export const ACHIEVEMENTS: Record<string, Achievement> = {};
ACHIEVEMENT_DATA.forEach(a => ACHIEVEMENTS[a.id] = a);
