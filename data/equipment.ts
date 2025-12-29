import { Equipment } from '../domain/types';

// Equipment System - Weapons, Armor, Accessories for Tamer

export const EQUIPMENT_DATA: Equipment[] = [
    // ===== WEAPONS (Increase Attack & Special Attack) =====
    {
        id: 'wooden_staff',
        name: 'Wooden Staff',
        nameKo: '나무 지팡이',
        description: 'A simple wooden staff for beginner tamers.',
        descriptionKo: '초보 테이머를 위한 간단한 나무 지팡이입니다.',
        slot: 'weapon',
        rarity: 'Common',
        requiredLevel: 1,
        stats: { attack: 5, specialAttack: 8 },
        price: 100,
        icon: '🪵'
    },
    {
        id: 'iron_sword',
        name: 'Iron Sword',
        nameKo: '철 검',
        description: 'A sturdy iron sword that boosts physical power.',
        descriptionKo: '물리력을 높이는 튼튼한 철 검입니다.',
        slot: 'weapon',
        rarity: 'Common',
        requiredLevel: 5,
        stats: { attack: 12, defense: 3 },
        price: 300,
        icon: '⚔️'
    },
    {
        id: 'magic_wand',
        name: 'Magic Wand',
        nameKo: '마법 지팡이',
        description: 'Enhances special attack power.',
        descriptionKo: '특수 공격력을 강화합니다.',
        slot: 'weapon',
        rarity: 'Uncommon',
        requiredLevel: 10,
        stats: { specialAttack: 18, skillResistance: 5 },
        price: 800,
        icon: '🪄'
    },
    {
        id: 'steel_blade',
        name: 'Steel Blade',
        nameKo: '강철 검',
        description: 'A well-forged steel blade.',
        descriptionKo: '잘 단련된 강철 검입니다.',
        slot: 'weapon',
        rarity: 'Uncommon',
        requiredLevel: 15,
        stats: { attack: 22, speed: 5 },
        price: 1500,
        icon: '🗡️'
    },
    {
        id: 'crystal_staff',
        name: 'Crystal Staff',
        nameKo: '수정 지팡이',
        description: 'A staff imbued with magical crystals.',
        descriptionKo: '마법 수정이 박힌 지팡이입니다.',
        slot: 'weapon',
        rarity: 'Rare',
        requiredLevel: 20,
        stats: { specialAttack: 35, skillResistance: 10, speed: -3 },
        price: 3000,
        icon: '🔮'
    },
    {
        id: 'dragon_slayer',
        name: 'Dragon Slayer',
        nameKo: '용검',
        description: 'A legendary sword forged to slay dragons.',
        descriptionKo: '용을 쓰러뜨리기 위해 단조된 전설의 검입니다.',
        slot: 'weapon',
        rarity: 'Rare',
        requiredLevel: 30,
        stats: { attack: 45, specialAttack: 30, defense: 10 },
        price: 8000,
        icon: '⚔️🐉'
    },
    {
        id: 'archmage_staff',
        name: 'Archmage Staff',
        nameKo: '대마법사의 지팡이',
        description: 'The ultimate staff for powerful tamers.',
        descriptionKo: '강력한 테이머를 위한 최강 지팡이입니다.',
        slot: 'weapon',
        rarity: 'Legendary',
        requiredLevel: 40,
        stats: { specialAttack: 60, skillResistance: 20, speed: 10 },
        price: 20000,
        icon: '✨🪄'
    },

    // ===== ARMOR (Increase HP, Defense, Skill Resistance) =====
    {
        id: 'cloth_robe',
        name: 'Cloth Robe',
        nameKo: '천 로브',
        description: 'Basic protective clothing.',
        descriptionKo: '기본적인 방어복입니다.',
        slot: 'armor',
        rarity: 'Common',
        requiredLevel: 1,
        stats: { maxHp: 20, defense: 3, skillResistance: 3 },
        price: 150,
        icon: '👘'
    },
    {
        id: 'leather_armor',
        name: 'Leather Armor',
        nameKo: '가죽 갑옷',
        description: 'Light armor made from monster hide.',
        descriptionKo: '몬스터 가죽으로 만든 가벼운 갑옷입니다.',
        slot: 'armor',
        rarity: 'Common',
        requiredLevel: 5,
        stats: { maxHp: 40, defense: 8, speed: -2 },
        price: 400,
        icon: '🦺'
    },
    {
        id: 'chain_mail',
        name: 'Chain Mail',
        nameKo: '사슬 갑옷',
        description: 'Interlocking metal rings provide solid defense.',
        descriptionKo: '연결된 금속 고리가 견고한 방어를 제공합니다.',
        slot: 'armor',
        rarity: 'Uncommon',
        requiredLevel: 12,
        stats: { maxHp: 70, defense: 15, skillResistance: 8 },
        price: 1200,
        icon: '🛡️'
    },
    {
        id: 'mage_robe',
        name: 'Mage Robe',
        nameKo: '마법사 로브',
        description: 'Enchanted robes that resist magic.',
        descriptionKo: '마법을 저항하는 마법 로브입니다.',
        slot: 'armor',
        rarity: 'Uncommon',
        requiredLevel: 15,
        stats: { maxHp: 60, skillResistance: 18, specialAttack: 10 },
        price: 1600,
        icon: '🧙‍♂️'
    },
    {
        id: 'plate_armor',
        name: 'Plate Armor',
        nameKo: '판금 갑옷',
        description: 'Heavy armor providing maximum defense.',
        descriptionKo: '최대 방어력을 제공하는 중갑옷입니다.',
        slot: 'armor',
        rarity: 'Rare',
        requiredLevel: 25,
        stats: { maxHp: 120, defense: 30, skillResistance: 15, speed: -5 },
        price: 5000,
        icon: '🛡️⚔️'
    },
    {
        id: 'dragon_scale_armor',
        name: 'Dragon Scale Armor',
        nameKo: '용비늘 갑옷',
        description: 'Armor crafted from dragon scales.',
        descriptionKo: '용의 비늘로 만든 갑옷입니다.',
        slot: 'armor',
        rarity: 'Legendary',
        requiredLevel: 35,
        stats: { maxHp: 180, defense: 45, skillResistance: 35, speed: -2 },
        price: 15000,
        icon: '🐉🛡️'
    },

    // ===== ACCESSORIES (Various Bonuses) =====
    {
        id: 'power_ring',
        name: 'Power Ring',
        nameKo: '힘의 반지',
        description: 'A ring that increases attack power.',
        descriptionKo: '공격력을 증가시키는 반지입니다.',
        slot: 'accessory1',
        rarity: 'Common',
        requiredLevel: 1,
        stats: { attack: 8 },
        price: 200,
        icon: '💍'
    },
    {
        id: 'speed_boots',
        name: 'Speed Boots',
        nameKo: '스피드 부츠',
        description: 'Boots that boost movement speed.',
        descriptionKo: '이동 속도를 높이는 부츠입니다.',
        slot: 'accessory2',
        rarity: 'Common',
        requiredLevel: 3,
        stats: { speed: 12 },
        price: 250,
        icon: '👢'
    },
    {
        id: 'health_amulet',
        name: 'Health Amulet',
        nameKo: '생명의 부적',
        description: 'Increases maximum health.',
        descriptionKo: '최대 체력을 증가시킵니다.',
        slot: 'accessory1',
        rarity: 'Uncommon',
        requiredLevel: 8,
        stats: { maxHp: 50 },
        price: 600,
        icon: '📿'
    },
    {
        id: 'wisdom_pendant',
        name: 'Wisdom Pendant',
        nameKo: '지혜의 펜던트',
        description: 'Enhances special attack and resistance.',
        descriptionKo: '특수 공격과 저항을 강화합니다.',
        slot: 'accessory2',
        rarity: 'Uncommon',
        requiredLevel: 10,
        stats: { specialAttack: 15, skillResistance: 10 },
        price: 900,
        icon: '📿✨'
    },
    {
        id: 'defense_bracelet',
        name: 'Defense Bracelet',
        nameKo: '방어 팔찌',
        description: 'Boosts both physical and magical defense.',
        descriptionKo: '물리 및 마법 방어를 모두 높입니다.',
        slot: 'accessory1',
        rarity: 'Rare',
        requiredLevel: 18,
        stats: { defense: 20, skillResistance: 20 },
        price: 2500,
        icon: '📿🛡️'
    },
    {
        id: 'critical_ring',
        name: 'Critical Ring',
        nameKo: '크리티컬 반지',
        description: 'Increases attack and speed dramatically.',
        descriptionKo: '공격과 속도를 크게 증가시킵니다.',
        slot: 'accessory2',
        rarity: 'Rare',
        requiredLevel: 22,
        stats: { attack: 25, speed: 15 },
        price: 3500,
        icon: '💍⚡'
    },
    {
        id: 'phoenix_feather',
        name: 'Phoenix Feather',
        nameKo: '불사조의 깃털',
        description: 'A legendary feather granting immense power.',
        descriptionKo: '엄청난 힘을 부여하는 전설의 깃털입니다.',
        slot: 'accessory1',
        rarity: 'Legendary',
        requiredLevel: 30,
        stats: { maxHp: 100, attack: 20, specialAttack: 20, speed: 10 },
        price: 12000,
        icon: '🪶🔥'
    },
    {
        id: 'elders_blessing',
        name: "Elder's Blessing",
        nameKo: '장로의 축복',
        description: 'A blessing granting balanced stat increases.',
        descriptionKo: '균형잡힌 스탯 증가를 부여하는 축복입니다.',
        slot: 'accessory2',
        rarity: 'Legendary',
        requiredLevel: 35,
        stats: { attack: 25, specialAttack: 25, defense: 25, skillResistance: 25, speed: 25 },
        price: 18000,
        icon: '✨🙏'
    },

    // ===== SPECIAL/QUEST REWARDS =====
    {
        id: 'void_slayer',
        name: 'Void Slayer',
        nameKo: '공허의 칼날',
        description: 'The ultimate weapon against void creatures.',
        descriptionKo: '공허 생물에 대항하는 최강 무기입니다.',
        slot: 'weapon',
        rarity: 'Legendary',
        requiredLevel: 50,
        stats: { attack: 80, specialAttack: 80, defense: 20, skillResistance: 20, speed: 20 },
        price: 50000,
        icon: '⚔️💀'
    },
    {
        id: 'chronos_armor',
        name: 'Chronos Armor',
        nameKo: '크로노스의 갑옷',
        description: 'Armor imbued with the power of time.',
        descriptionKo: '시간의 힘이 깃든 갑옷입니다.',
        slot: 'armor',
        rarity: 'Legendary',
        requiredLevel: 45,
        stats: { maxHp: 250, defense: 60, skillResistance: 60, speed: 30 },
        price: 40000,
        icon: '🛡️⏰'
    }
];

// Helper: Get equipment by ID
export const EQUIPMENT: Record<string, Equipment> = {};
EQUIPMENT_DATA.forEach(eq => EQUIPMENT[eq.id] = eq);

// Helper: Get equipment by slot
export function getEquipmentBySlot(slot: string): Equipment[] {
    return EQUIPMENT_DATA.filter(eq => eq.slot === slot);
}

// Helper: Get equipment by rarity
export function getEquipmentByRarity(rarity: string): Equipment[] {
    return EQUIPMENT_DATA.filter(eq => eq.rarity === rarity);
}
