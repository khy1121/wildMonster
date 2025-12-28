import { Achievement } from '../domain/types';

export const ACHIEVEMENT_DATA: Achievement[] = [
    // Combat Achievements
    {
        id: 'combat_first_victory',
        name: 'First Blood',
        nameKo: '첫 승리',
        description: 'Win your first battle',
        descriptionKo: '첫 전투에서 승리하기',
        category: 'combat',
        target: 1,
        reward: { gold: 100 },
        icon: '⚔️'
    },
    {
        id: 'combat_10_victories',
        name: 'Battle Veteran',
        nameKo: '전투 베테랑',
        description: 'Win 10 battles',
        descriptionKo: '10번의 전투에서 승리하기',
        category: 'combat',
        target: 10,
        reward: { gold: 500, items: [{ itemId: 'potion', quantity: 3 }] },
        icon: '🏆'
    },
    {
        id: 'combat_50_victories',
        name: 'Battle Master',
        nameKo: '전투의 달인',
        description: 'Win 50 battles',
        descriptionKo: '50번의 전투에서 승리하기',
        category: 'combat',
        target: 50,
        reward: { gold: 2000, items: [{ itemId: 'power_clone_d', quantity: 2 }] },
        icon: '🎖️'
    },
    {
        id: 'combat_100_victories',
        name: 'Legendary Warrior',
        nameKo: '전설의 전사',
        description: 'Win 100 battles',
        descriptionKo: '100번의 전투에서 승리하기',
        category: 'combat',
        target: 100,
        reward: { gold: 5000, items: [{ itemId: 'attack_ring', quantity: 1 }], title: 'Legendary' },
        icon: '👑'
    },

    // Collection Achievements
    {
        id: 'collection_first_capture',
        name: 'Tamer Initiate',
        nameKo: '테이머 입문',
        description: 'Capture your first monster',
        descriptionKo: '첫 몬스터 포획하기',
        category: 'collection',
        target: 1,
        reward: { gold: 100 },
        icon: '🎯'
    },
    {
        id: 'collection_5_species',
        name: 'Collector',
        nameKo: '수집가',
        description: 'Register 5 different species in your collection',
        descriptionKo: '5종의 다른 몬스터를 도감에 등록하기',
        category: 'collection',
        target: 5,
        reward: { gold: 500, items: [{ itemId: 'normal_egg', quantity: 1 }] },
        icon: '📚'
    },
    {
        id: 'collection_10_species',
        name: 'Dedicated Collector',
        nameKo: '열혈 수집가',
        description: 'Register 10 different species in your collection',
        descriptionKo: '10종의 다른 몬스터를 도감에 등록하기',
        category: 'collection',
        target: 10,
        reward: { gold: 1500, items: [{ itemId: 'fire_egg', quantity: 1 }] },
        icon: '📖'
    },
    {
        id: 'collection_hatch_first',
        name: 'Egg Hatcher',
        nameKo: '알 부화 성공',
        description: 'Hatch your first egg',
        descriptionKo: '첫 알 부화시키기',
        category: 'collection',
        target: 1,
        reward: { gold: 200 },
        icon: '🐣'
    },
    {
        id: 'collection_hatch_5',
        name: 'Incubation Expert',
        nameKo: '부화 전문가',
        description: 'Hatch 5 eggs',
        descriptionKo: '5개의 알 부화시키기',
        category: 'collection',
        target: 5,
        reward: { gold: 1000, items: [{ itemId: 'fire_data', quantity: 5 }] },
        icon: '🥚'
    },

    // Progression Achievements
    {
        id: 'progression_tamer_5',
        name: 'Rising Tamer',
        nameKo: '떠오르는 테이머',
        description: 'Reach Tamer Level 5',
        descriptionKo: '테이머 레벨 5 달성하기',
        category: 'progression',
        target: 5,
        reward: { gold: 300 },
        icon: '⬆️'
    },
    {
        id: 'progression_tamer_10',
        name: 'Experienced Tamer',
        nameKo: '경험 많은 테이머',
        description: 'Reach Tamer Level 10',
        descriptionKo: '테이머 레벨 10 달성하기',
        category: 'progression',
        target: 10,
        reward: { gold: 1000, items: [{ itemId: 'super_potion', quantity: 5 }] },
        icon: '🌟'
    },
    {
        id: 'progression_monster_lvl_20',
        name: 'Monster Trainer',
        nameKo: '몬스터 트레이너',
        description: 'Level a monster to 20',
        descriptionKo: '몬스터를 레벨 20까지 성장시키기',
        category: 'progression',
        target: 20,
        reward: { gold: 800, items: [{ itemId: 'power_clone_d', quantity: 1 }] },
        icon: '💪'
    },
    {
        id: 'progression_enhance_3',
        name: 'Enhancement Beginner',
        nameKo: '강화 입문자',
        description: 'Enhance a monster to +3',
        descriptionKo: '몬스터를 +3 강화까지 성공시키기',
        category: 'progression',
        target: 3,
        reward: { gold: 500 },
        icon: '✨'
    },
    {
        id: 'progression_enhance_5',
        name: 'Enhancement Adept',
        nameKo: '강화의 달인',
        description: 'Enhance a monster to +5',
        descriptionKo: '몬스터를 +5 강화까지 성공시키기',
        category: 'progression',
        target: 5,
        reward: { gold: 1500, items: [{ itemId: 'backup_disk', quantity: 2 }] },
        icon: '💎'
    },
    {
        id: 'progression_first_evolution',
        name: 'Evolution!',
        nameKo: '진화!',
        description: 'Evolve a monster for the first time',
        descriptionKo: '첫 몬스터 진화시키기',
        category: 'progression',
        target: 1,
        reward: { gold: 500 },
        icon: '🦋'
    },

    // Economy Achievements
    {
        id: 'economy_earn_1000',
        name: 'Budgeter',
        nameKo: '예산 관리자',
        description: 'Earn a total of 1,000 gold',
        descriptionKo: '총 1,000 골드 획득하기',
        category: 'economy',
        target: 1000,
        reward: { items: [{ itemId: 'potion', quantity: 2 }] },
        icon: '💰'
    },
    {
        id: 'economy_earn_10000',
        name: 'Wealthy Tamer',
        nameKo: '부유한 테이머',
        description: 'Earn a total of 10,000 gold',
        descriptionKo: '총 10,000 골드 획득하기',
        category: 'economy',
        target: 10000,
        reward: { gold: 2000, items: [{ itemId: 'health_necklace', quantity: 1 }] },
        icon: '💵'
    },
    {
        id: 'economy_spend_5000',
        name: 'Big Spender',
        nameKo: '큰손',
        description: 'Spend a total of 5,000 gold',
        descriptionKo: '총 5,000 골드 사용하기',
        category: 'economy',
        target: 5000,
        reward: { gold: 1000 },
        icon: '🛒'
    },
];

// Quick lookup by ID
export const ACHIEVEMENTS: Record<string, Achievement> = {};
ACHIEVEMENT_DATA.forEach(a => ACHIEVEMENTS[a.id] = a);
