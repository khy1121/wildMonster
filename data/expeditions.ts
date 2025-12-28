import { Expedition } from '../domain/types';
import { ElementType } from '../domain/types';

const HOUR = 1000 * 60 * 60;

export const EXPEDITION_DATA: Expedition[] = [
    {
        id: 'quick_gold_rush',
        name: 'Gold Rush',
        nameKo: '골드 러시',
        description: 'A quick trip to gather gold',
        descriptionKo: '빠르게 골드를 모으러 떠나는 짧은 여정',
        duration: 1 * HOUR,
        requirements: {
            partySize: 1
        },
        rewards: {
            gold: 500,
            exp: 100
        },
        icon: '💰'
    },
    {
        id: 'medium_exploration',
        name: 'Monster Scouting',
        nameKo: '몬스터 정찰',
        description: 'Send monsters to explore nearby areas',
        descriptionKo: '주변 지역을 탐험할 몬스터 파견',
        duration: 4 * HOUR,
        requirements: {
            minLevel: 5,
            partySize: 2
        },
        rewards: {
            gold: 1500,
            exp: 400,
            items: [
                { itemId: 'potion', chance: 0.5 },
                { itemId: 'super_potion', chance: 0.3 }
            ]
        },
        icon: '🔍'
    },
    {
        id: 'long_treasure_hunt',
        name: 'Treasure Hunt',
        nameKo: '보물 찾기',
        description: 'Extended expedition to uncover treasures',
        descriptionKo: '숨겨진 보물을 찾아 떠나는 긴 탐험',
        duration: 8 * HOUR,
        requirements: {
            minLevel: 10,
            partySize: 3
        },
        rewards: {
            gold: 3000,
            exp: 800,
            items: [
                { itemId: 'power_clone_d', chance: 0.6 },
                { itemId: 'backup_disk', chance: 0.4 },
                { itemId: 'fire_data', chance: 0.3 }
            ]
        },
        icon: '🗺️'
    },
    {
        id: 'fire_volcano',
        name: 'Volcano Scouting',
        nameKo: '화산 정찰',
        description: 'Send a Fire monster to scout the volcanic region',
        descriptionKo: '화산 지역을 정찰할 불속성 몬스터 파견',
        duration: 4 * HOUR,
        requirements: {
            element: ElementType.FIRE,
            minLevel: 8,
            partySize: 1
        },
        rewards: {
            gold: 1000,
            exp: 500,
            items: [
                { itemId: 'fire_egg', chance: 0.4 },
                { itemId: 'fire_data', chance: 0.6 }
            ]
        },
        icon: '🌋'
    },
    {
        id: 'water_deep_dive',
        name: 'Deep Sea Dive',
        nameKo: '심해 탐험',
        description: 'Explore the ocean depths with a Water monster',
        descriptionKo: '물속성 몬스터와 함께 깊은 바다를 탐험',
        duration: 4 * HOUR,
        requirements: {
            element: ElementType.WATER,
            minLevel: 8,
            partySize: 1
        },
        rewards: {
            gold: 1000,
            exp: 500,
            items: [
                { itemId: 'water_egg', chance: 0.4 },
                { itemId: 'water_data', chance: 0.6 }
            ]
        },
        icon: '🌊'
    },
    {
        id: 'ancient_ruins',
        name: 'Ancient Ruins',
        nameKo: '고대 유적',
        description: 'Explore mysterious ruins for rare treasures',
        descriptionKo: '고대 유적을 탐사해 희귀한 보물 획득',
        duration: 12 * HOUR,
        requirements: {
            minLevel: 15,
            partySize: 4
        },
        rewards: {
            gold: 5000,
            exp: 1500,
            items: [
                { itemId: 'power_clone_c', chance: 0.5 },
                { itemId: 'attack_ring', chance: 0.3 },
                { itemId: 'health_necklace', chance: 0.3 }
            ]
        },
        icon: '🏛️'
    }
];

// Quick lookup by ID
export const EXPEDITIONS: Record<string, Expedition> = {};
EXPEDITION_DATA.forEach(e => EXPEDITIONS[e.id] = e);
