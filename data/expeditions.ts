import { Expedition, ElementType } from '../domain/types';

export const EXPEDITION_DATA: Expedition[] = [
    // Quick Expeditions (1 hour)
    {
        id: 'exp_quick_gold',
        name: 'Gold Rush',
        description: 'A quick trip to gather gold from the wild.',
        duration: 60 * 60 * 1000, // 1 hour
        requirements: {
            partySize: 1,
            minLevel: 1
        },
        rewards: {
            gold: 200,
            exp: 50,
            items: [
                { itemId: 'potion', chance: 0.3 }
            ]
        },
        icon: '💰'
    },
    {
        id: 'exp_quick_fire',
        name: 'Volcano Scouting',
        description: 'Send a Fire monster to scout the volcanic region.',
        duration: 60 * 60 * 1000, // 1 hour
        requirements: {
            partySize: 1,
            minLevel: 5,
            element: 'Fire' as ElementType
        },
        rewards: {
            gold: 150,
            exp: 80,
            items: [
                { itemId: 'fire_data', chance: 0.4 }
            ]
        },
        icon: '🌋'
    },

    // Medium Expeditions (4 hours)
    {
        id: 'exp_medium_treasure',
        name: 'Treasure Hunt',
        description: 'An extended expedition to uncover hidden treasures.',
        duration: 4 * 60 * 60 * 1000, // 4 hours
        requirements: {
            partySize: 2,
            minLevel: 10
        },
        rewards: {
            gold: 800,
            exp: 200,
            items: [
                { itemId: 'super_potion', chance: 0.5 },
                { itemId: 'normal_egg', chance: 0.1 }
            ]
        },
        icon: '🗺️'
    },
    {
        id: 'exp_medium_water',
        name: 'Deep Sea Dive',
        description: 'Explore the ocean depths with Water monsters.',
        duration: 4 * 60 * 60 * 1000, // 4 hours
        requirements: {
            partySize: 2,
            minLevel: 10,
            element: 'Water' as ElementType
        },
        rewards: {
            gold: 600,
            exp: 250,
            items: [
                { itemId: 'water_data', chance: 0.5 },
                { itemId: 'water_egg', chance: 0.15 }
            ]
        },
        icon: '🌊'
    },

    // Long Expeditions (8 hours)
    {
        id: 'exp_long_dungeon',
        name: 'Dungeon Raid',
        description: 'A dangerous dungeon expedition with great rewards.',
        duration: 8 * 60 * 60 * 1000, // 8 hours
        requirements: {
            partySize: 3,
            minLevel: 15
        },
        rewards: {
            gold: 2000,
            exp: 500,
            items: [
                { itemId: 'power_clone_d', chance: 0.3 },
                { itemId: 'backup_disk', chance: 0.2 },
                { itemId: 'attack_ring', chance: 0.05 }
            ]
        },
        icon: '🏰'
    },
    {
        id: 'exp_long_ancient',
        name: 'Ancient Ruins',
        description: 'Explore mysterious ancient ruins for rare treasures.',
        duration: 8 * 60 * 60 * 1000, // 8 hours
        requirements: {
            partySize: 3,
            minLevel: 20
        },
        rewards: {
            gold: 3000,
            exp: 800,
            items: [
                { itemId: 'power_clone_c', chance: 0.2 },
                { itemId: 'health_necklace', chance: 0.1 },
                { itemId: 'speed_boots', chance: 0.1 }
            ]
        },
        icon: '🏛️'
    }
];

// Quick lookup by ID
export const EXPEDITIONS: Record<string, Expedition> = {};
EXPEDITION_DATA.forEach(e => EXPEDITIONS[e.id] = e);
