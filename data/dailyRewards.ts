import { InventoryItem } from '../domain/types';

export interface DailyReward {
    day: number;  // 1-7
    gold: number;
    items?: { itemId: string; quantity: number }[];
    description: string;
}

export const DAILY_LOGIN_REWARDS: DailyReward[] = [
    {
        day: 1,
        gold: 100,
        description: '100 Gold'
    },
    {
        day: 2,
        gold: 0,
        items: [{ itemId: 'potion', quantity: 2 }],
        description: '2x Potion'
    },
    {
        day: 3,
        gold: 300,
        description: '300 Gold'
    },
    {
        day: 4,
        gold: 0,
        items: [{ itemId: 'fire_data', quantity: 1 }],
        description: '1x Fire Data'
    },
    {
        day: 5,
        gold: 500,
        description: '500 Gold'
    },
    {
        day: 6,
        gold: 0,
        items: [{ itemId: 'power_clone_d', quantity: 1 }],
        description: '1x Power Clone [D]'
    },
    {
        day: 7,
        gold: 1000,
        items: [{ itemId: 'normal_egg', quantity: 1 }],
        description: '1x Normal Egg + 1000 Gold'
    }
];

export function getDailyReward(day: number): DailyReward {
    // Days cycle 1-7
    const normalizedDay = ((day - 1) % 7) + 1;
    return DAILY_LOGIN_REWARDS.find(r => r.day === normalizedDay) || DAILY_LOGIN_REWARDS[0];
}
