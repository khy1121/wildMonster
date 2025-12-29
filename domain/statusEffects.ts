import { ElementType } from './types';

// Status Effect Types
export type StatusEffectType =
    | 'burn'      // Deals damage each turn, reduces attack
    | 'freeze'    // Chance to skip turn, reduces speed
    | 'poison'    // Deals increasing damage each turn
    | 'paralysis' // Reduces speed, chance to skip turn
    | 'sleep'     // Skips turns, wakes up after damage
    | 'confusion' // May hit self instead of target
    | 'flinch'    // Skips one turn (doesn't persist)
    | 'leech'     // Drains HP each turn to opponent
    | 'curse';    // Reduces HP each turn, can't be removed

export interface StatusEffect {
    type: StatusEffectType;
    duration: number; // -1 for permanent until cured
    turnsActive: number; // How many turns it's been active
    potency?: number; // For poison (stacks), burn damage, etc.
    source?: string; // What caused it (for tracking)
}

// Weather Types
export type WeatherType =
    | 'clear'
    | 'rain'      // Boosts Water, weakens Fire
    | 'sunny'     // Boosts Fire, weakens Water
    | 'sandstorm' // Damages non-Ground/Rock/Steel each turn
    | 'hail'      // Damages non-Ice each turn
    | 'fog'       // Reduces accuracy
    | 'storm';    // Boosts Electric, random damage

export interface Weather {
    type: WeatherType;
    duration: number; // Turns remaining, -1 for permanent
    intensity?: number; // 1-3 for effect strength
}

// Status Effect Mechanics
export const STATUS_EFFECTS = {
    burn: {
        name: 'Burn',
        nameKo: '화상',
        icon: '🔥',
        color: '#ff6b6b',
        damagePercent: 0.0625, // 1/16 of max HP per turn
        attackReduction: 0.5,
        canMiss: false,
        description: 'Takes damage each turn and attack is halved',
        descriptionKo: '매 턴 데미지를 받고 공격력이 절반으로 감소'
    },
    freeze: {
        name: 'Freeze',
        nameKo: '얼음',
        icon: '❄️',
        color: '#4dabf7',
        skipChance: 1.0, // 100% skip turn while frozen
        thawChance: 0.2, // 20% chance to thaw each turn
        speedReduction: 0.75,
        description: 'Cannot move until thawed',
        descriptionKo: '녹을 때까지 행동 불가'
    },
    poison: {
        name: 'Poison',
        nameKo: '중독',
        icon: '☠️',
        color: '#9c36b5',
        baseDamagePercent: 0.0625, // Starts at 1/16
        damageIncrease: 0.0625, // Increases by 1/16 each turn
        description: 'Takes increasing damage each turn',
        descriptionKo: '매 턴 증가하는 데미지를 받음'
    },
    paralysis: {
        name: 'Paralysis',
        nameKo: '마비',
        icon: '⚡',
        color: '#ffd43b',
        skipChance: 0.25, // 25% chance to skip turn
        speedReduction: 0.5,
        description: 'Speed reduced and may be unable to move',
        descriptionKo: '속도 감소 및 행동 불가 가능성'
    },
    sleep: {
        name: 'Sleep',
        nameKo: '수면',
        icon: '💤',
        color: '#868e96',
        minTurns: 1,
        maxTurns: 3,
        wakeOnDamage: false, // In this version, sleep for set turns
        description: 'Cannot move for 1-3 turns',
        descriptionKo: '1-3턴 동안 행동 불가'
    },
    confusion: {
        name: 'Confusion',
        nameKo: '혼란',
        icon: '😵',
        color: '#f59f00',
        selfHitChance: 0.33, // 33% chance to hit self
        selfHitPower: 40,
        minTurns: 1,
        maxTurns: 4,
        description: 'May attack itself instead of the target',
        descriptionKo: '자신을 공격할 수 있음'
    },
    flinch: {
        name: 'Flinch',
        nameKo: '풀죽음',
        icon: '😨',
        color: '#adb5bd',
        duration: 1, // Always 1 turn
        description: 'Skips this turn only',
        descriptionKo: '이번 턴만 행동 불가'
    },
    leech: {
        name: 'Leech Seed',
        nameKo: '씨뿌리기',
        icon: '🌱',
        color: '#51cf66',
        drainPercent: 0.125, // 1/8 of max HP
        description: 'HP is drained each turn to opponent',
        descriptionKo: '매 턴 HP가 상대에게 흡수됨'
    },
    curse: {
        name: 'Curse',
        nameKo: '저주',
        icon: '👻',
        color: '#5f3dc4',
        damagePercent: 0.25, // 1/4 of max HP per turn
        cannotRemove: true,
        description: 'Loses HP each turn, cannot be cured',
        descriptionKo: '매 턴 HP 손실, 치료 불가'
    }
} as const;

// Weather Effects
export const WEATHER_EFFECTS = {
    clear: {
        name: 'Clear',
        nameKo: '맑음',
        icon: '☀️',
        description: 'Normal weather conditions',
        descriptionKo: '일반 날씨'
    },
    rain: {
        name: 'Rain',
        nameKo: '비',
        icon: '🌧️',
        waterBoost: 1.5,
        fireWeaken: 0.5,
        thunderAccuracy: 1.0, // Thunder never misses
        description: 'Water moves boosted, Fire moves weakened',
        descriptionKo: '물 타입 강화, 불 타입 약화'
    },
    sunny: {
        name: 'Sunny',
        nameKo: '맑음',
        icon: '☀️',
        fireBoost: 1.5,
        waterWeaken: 0.5,
        description: 'Fire moves boosted, Water moves weakened',
        descriptionKo: '불 타입 강화, 물 타입 약화'
    },
    sandstorm: {
        name: 'Sandstorm',
        nameKo: '모래바람',
        icon: '🌪️',
        damagePercent: 0.0625,
        immuneTypes: ['GROUND', 'ROCK', 'STEEL'] as ElementType[],
        rockDefenseBoost: 1.5,
        description: 'Damages all except Ground/Rock/Steel types',
        descriptionKo: '땅/바위/강철 타입 외 모두 데미지'
    },
    hail: {
        name: 'Hail',
        nameKo: '싸라기눈',
        icon: '🌨️',
        damagePercent: 0.0625,
        immuneTypes: ['ICE'] as ElementType[],
        blizzardAccuracy: 1.0,
        description: 'Damages all except Ice types',
        descriptionKo: '얼음 타입 외 모두 데미지'
    },
    fog: {
        name: 'Fog',
        nameKo: '안개',
        icon: '🌫️',
        accuracyReduction: 0.6, // All moves have 60% accuracy
        description: 'Reduces accuracy of all moves',
        descriptionKo: '모든 기술의 명중률 감소'
    },
    storm: {
        name: 'Storm',
        nameKo: '폭풍',
        icon: '⛈️',
        electricBoost: 1.5,
        randomDamageChance: 0.1, // 10% chance for lightning strike
        randomDamagePercent: 0.125,
        description: 'Electric moves boosted, random lightning damage',
        descriptionKo: '전기 타입 강화, 무작위 번개 데미지'
    }
} as const;

// Helper functions
export function canApplyStatus(
    currentStatus: StatusEffect | null,
    newStatus: StatusEffectType
): boolean {
    // Can't apply status if already has one (except flinch)
    if (currentStatus && newStatus !== 'flinch') {
        return false;
    }
    return true;
}

export function processStatusDamage(
    status: StatusEffect,
    maxHp: number
): number {
    const effect = STATUS_EFFECTS[status.type];

    switch (status.type) {
        case 'burn':
            return Math.floor(maxHp * effect.damagePercent);

        case 'poison':
            const poisonDamage = effect.baseDamagePercent + (status.turnsActive * effect.damageIncrease);
            return Math.floor(maxHp * poisonDamage);

        case 'leech':
            return Math.floor(maxHp * effect.drainPercent);

        case 'curse':
            return Math.floor(maxHp * effect.damagePercent);

        default:
            return 0;
    }
}

export function shouldSkipTurn(status: StatusEffect): boolean {
    const effect = STATUS_EFFECTS[status.type];

    switch (status.type) {
        case 'freeze':
            // Check if thaws
            if (Math.random() < effect.thawChance) {
                return false; // Thawed!
            }
            return true;

        case 'paralysis':
            return Math.random() < effect.skipChance;

        case 'sleep':
        case 'flinch':
            return true;

        default:
            return false;
    }
}

export function getStatModifier(
    status: StatusEffect | null,
    stat: 'attack' | 'defense' | 'speed'
): number {
    if (!status) return 1.0;

    const effect = STATUS_EFFECTS[status.type];

    if (stat === 'attack' && status.type === 'burn') {
        return effect.attackReduction;
    }

    if (stat === 'speed') {
        if (status.type === 'paralysis') return effect.speedReduction;
        if (status.type === 'freeze') return effect.speedReduction;
    }

    return 1.0;
}

export function updateStatusDuration(status: StatusEffect): StatusEffect | null {
    const newStatus = { ...status };
    newStatus.turnsActive++;

    if (newStatus.duration > 0) {
        newStatus.duration--;
        if (newStatus.duration === 0) {
            return null; // Status expired
        }
    }

    return newStatus;
}
