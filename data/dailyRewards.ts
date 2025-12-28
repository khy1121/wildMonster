import { InventoryItem } from '../domain/types';

export interface DailyReward {
    day: number;  // 1-7
    gold: number;
    items?: { itemId: string; quantity: number }[];
    description: string;
    descriptionKo?: string;
}

export const DAILY_LOGIN_REWARDS: DailyReward[] = [
    {
        day: 1,
        gold: 100,
        description: '100 Gold',
        descriptionKo: '골드 100'
    },
    {
        day: 2,
        gold: 0,
        items: [{ itemId: 'potion', quantity: 2 }],
        description: '2x Potion',
        descriptionKo: '포션 2개'
    },
    {
        day: 3,
        gold: 300,
        description: '300 Gold',
        descriptionKo: '골드 300'
    },
    {
        day: 4,
        gold: 0,
        items: [{ itemId: 'fire_data', quantity: 1 }],
        description: '1x Fire Data',
        descriptionKo: '불 데이터 1개'
    },
    {
        day: 5,
        gold: 500,
        description: '500 Gold',
        descriptionKo: '골드 500'
    },
    {
        day: 6,
        gold: 0,
        items: [{ itemId: 'power_clone_d', quantity: 1 }],
        description: '1x Power Clone [D]',
        descriptionKo: '파워 클론 [D] 1개'
    },
    {
        day: 7,
        gold: 1000,
        items: [{ itemId: 'normal_egg', quantity: 1 }],
        description: '1x Normal Egg + 1000 Gold',
        descriptionKo: '일반 알 1개 + 골드 1000'
    }
];

export function getDailyReward(day: number): DailyReward {
    // Days cycle 1-7
    const normalizedDay = ((day - 1) % 7) + 1;
    return DAILY_LOGIN_REWARDS.find(r => r.day === normalizedDay) || DAILY_LOGIN_REWARDS[0];
}
