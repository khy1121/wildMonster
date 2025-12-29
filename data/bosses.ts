import { BossEncounter } from '../domain/types';

// Phase 5: Boss Encounters for all 8 regions + final boss

export const BOSS_DATA: BossEncounter[] = [
    // Region 1: Emberfall Grove - Pyroclast Titan
    {
        id: 'pyroclast_titan',
        name: 'Pyroclast Titan',
        nameKo: '화산 타이탄',
        speciesId: 'flarelion',  // Uses evolved fire monster as template
        level: 15,
        maxHp: 5000,
        phases: [
            {
                hpThreshold: 100,
                pattern: ['fire_blast', 'ember'],
                description: 'Pyroclast Titan attacks with fire blasts.',
                descriptionKo: '화산 타이탄이 화염 공격을 가합니다.'
            },
            {
                hpThreshold: 50,
                pattern: ['fire_blast', 'lava_summon', 'area_damage'],
                description: 'Titan summons lava pools! Watch your step!',
                descriptionKo: '타이탄이 용암을 소환합니다! 조심하세요!'
            }
        ],
        guaranteedRewards: {
            gold: 1000,
            exp: 500,
            items: [
                { itemId: 'fire_fragment', quantity: 1 },
                { itemId: 'fire_titan_egg', quantity: 1 },
                { itemId: 'rare_capture_orb', quantity: 3 }
            ],
            fragment: 'fire_fragment'
        },
        icon: '🔥',
        defeated: false
    },

    // Region 2: Tidecrest Shore - Leviathan's Echo
    {
        id: 'leviathans_echo',
        name: "Leviathan's Echo",
        nameKo: '리바이어던의 메아리',
        speciesId: 'aquadrake',  // Water dragon template
        level: 28,
        maxHp: 12000,
        phases: [
            {
                hpThreshold: 100,
                pattern: ['water_jet', 'bubble_beam'],
                description: 'The Echo attacks from range with water jets.',
                descriptionKo: '메아리가 원거리에서 물줄기 공격을 가합니다.'
            },
            {
                hpThreshold: 66,
                pattern: ['summon_adds', 'heal'],
                description: 'Leviathan summons sea creatures and heals!',
                descriptionKo: '리바이어던이 바다 생물을 소환하고 회복합니다!'
            },
            {
                hpThreshold: 33,
                pattern: ['tidal_wave', 'whirlpool'],
                description: 'Massive tidal wave incoming!',
                descriptionKo: '거대한 해일이 밀려옵니다!'
            }
        ],
        guaranteedRewards: {
            gold: 3000,
            exp: 1500,
            items: [
                { itemId: 'water_fragment', quantity: 1 },
                { itemId: 'leviathan_egg', quantity: 1 },
                { itemId: 'water_data', quantity: 5 },
                { itemId: 'super_potion', quantity: 5 }
            ],
            fragment: 'water_fragment'
        },
        icon: '🌊',
        defeated: false
    },

    // Region 3: Stormwatch Peaks - Stormcaller Rex
    {
        id: 'stormcaller_rex',
        name: 'Stormcaller Rex',
        nameKo: '폭풍왕',
        speciesId: 'voltrex',  // Electric beast template
        level: 40,
        maxHp: 20000,
        phases: [
            {
                hpThreshold: 100,
                pattern: ['thunder_bolt', 'shock'],
                description: 'Rex strikes with precise lightning bolts.',
                descriptionKo: '렉스가 정확한 번개 공격을 가합니다.'
            },
            {
                hpThreshold: 66,
                pattern: ['lightning_field', 'static_charge'],
                description: 'Electric field covers the area!',
                descriptionKo: '전기장이 지역을 뒤덮습니다!'
            },
            {
                hpThreshold: 33,
                pattern: ['overcharge', 'speed_boost', 'thunder_storm'],
                description: 'Rex overcharges! Speed and power increased!',
                descriptionKo: '렉스가 과충전! 속도와 힘이 증가합니다!'
            }
        ],
        enrageTimer: 600000,  // 10 minutes
        guaranteedRewards: {
            gold: 6000,
            exp: 3000,
            items: [
                { itemId: 'electric_fragment', quantity: 1 },
                { itemId: 'storm_dragon_egg', quantity: 1 },
                { itemId: 'power_clone_c', quantity: 2 },
                { itemId: 'attack_ring', quantity: 1 }
            ],
            fragment: 'electric_fragment'
        },
        icon: '⚡',
        defeated: false
    },

    // Region 4: Gloomveil Hollow - Voidbringer
    {
        id: 'voidbringer',
        name: 'Voidbringer',
        nameKo: '공허의 사자',
        speciesId: 'void_stalker',  // Dark elite template
        level: 54,
        maxHp: 35000,
        phases: [
            {
                hpThreshold: 100,
                pattern: ['void_orb', 'dark_blast'],
                description: 'Voidbringer summons dark orbs.',
                descriptionKo: '공허의 사자가 암흑 구체를 소환합니다.'
            },
            {
                hpThreshold: 66,
                pattern: ['shadow_clone', 'confusion'],
                description: 'Shadow clones appear! Find the real one!',
                descriptionKo: '그림자 분신이 나타납니다! 진짜를 찾으세요!'
            },
            {
                hpThreshold: 33,
                pattern: ['void_explosion', 'dot_aura'],
                description: 'Void energy explodes! Damage over time!',
                descriptionKo: '공허 에너지가 폭발합니다! 지속 피해!'
            }
        ],
        enrageTimer: 600000,
        guaranteedRewards: {
            gold: 10000,
            exp: 6000,
            items: [
                { itemId: 'dark_fragment', quantity: 1 },
                { itemId: 'void_dragon_egg', quantity: 1 },
                { itemId: 'power_clone_b', quantity: 2 },
                { itemId: 'health_necklace', quantity: 1 }
            ],
            fragment: 'dark_fragment'
        },
        icon: '🌑',
        defeated: false
    },

    // Region 5: Verdant Realm - Primordial Guardian
    {
        id: 'primordial_guardian',
        name: 'Primordial Guardian',
        nameKo: '태초의 수호자',
        speciesId: 'ancient_treant',  // Nature ancient template
        level: 68,
        maxHp: 50000,
        phases: [
            {
                hpThreshold: 100,
                pattern: ['root_attack', 'vine_whip'],
                description: 'Guardian attacks with massive roots.',
                descriptionKo: '수호자가 거대한 뿌리로 공격합니다.'
            },
            {
                hpThreshold: 66,
                pattern: ['regeneration', 'stat_buff'],
                description: 'Guardian regenerates health!',
                descriptionKo: '수호자가 체력을 회복합니다!'
            },
            {
                hpThreshold: 33,
                pattern: ['nature_fury', 'percent_damage'],
                description: "Nature's fury! Massive percentage damage!",
                descriptionKo: '자연의 분노! 강력한 비율 피해!'
            }
        ],
        enrageTimer: 720000,  // 12 minutes
        guaranteedRewards: {
            gold: 15000,
            exp: 10000,
            items: [
                { itemId: 'nature_fragment', quantity: 1 },
                { itemId: 'world_tree_seed', quantity: 1 },
                { itemId: 'power_clone_a', quantity: 2 },
                { itemId: 'legendary_ring', quantity: 1 }
            ],
            fragment: 'nature_fragment'
        },
        icon: '🌿',
        defeated: false
    },

    // Region 6: Frozen Wastelands - Eternal Glacier
    {
        id: 'eternal_glacier',
        name: 'Eternal Glacier',
        nameKo: '영원한 빙하',
        speciesId: 'ice_phoenix',  // Ice mythic template
        level: 76,
        maxHp: 70000,
        phases: [
            {
                hpThreshold: 100,
                pattern: ['ice_shard', 'frost_bite'],
                description: 'Glacier hurls massive ice shards.',
                descriptionKo: '빙하가 거대한 얼음 조각을 던집니다.'
            },
            {
                hpThreshold: 66,
                pattern: ['freeze_aura', 'slow_debuff'],
                description: 'Freezing aura slows all movement!',
                descriptionKo: '동결 오라가 모든 움직임을 느리게 합니다!'
            },
            {
                hpThreshold: 33,
                pattern: ['absolute_zero', 'one_hit_ko'],
                description: 'ABSOLUTE ZERO! Dodge or die!',
                descriptionKo: '절대 영도! 회피하지 않으면 즉사!'
            }
        ],
        enrageTimer: 720000,
        guaranteedRewards: {
            gold: 20000,
            exp: 15000,
            items: [
                { itemId: 'ice_fragment', quantity: 1 },
                { itemId: 'glacier_dragon_egg', quantity: 1 },
                { itemId: 'power_clone_s', quantity: 1 },
                { itemId: 'ultimate_necklace', quantity: 1 }
            ],
            fragment: 'ice_fragment'
        },
        icon: '❄️',
        defeated: false
    },

    // Region 7: Celestial Summit - Radiant Seraph
    {
        id: 'radiant_seraph',
        name: 'Radiant Seraph',
        nameKo: '빛나는 세라핌',
        speciesId: 'aurora_phoenix',  // Light legendary template
        level: 80,
        maxHp: 100000,
        phases: [
            {
                hpThreshold: 100,
                pattern: ['light_sword', 'holy_beam'],
                description: 'Seraph wields swords of pure light.',
                descriptionKo: '세라핌이 순수한 빛의 검을 휘두릅니다.'
            },
            {
                hpThreshold: 75,
                pattern: ['angel_summon', 'divine_shield'],
                description: 'Angels descend to aid the Seraph!',
                descriptionKo: '천사들이 세라핌을 돕기 위해 강림합니다!'
            },
            {
                hpThreshold: 50,
                pattern: ['judgment_ray', 'aoe_damage'],
                description: 'Judgment Ray illuminates the battlefield!',
                descriptionKo: '심판의 빛이 전장을 비춥니다!'
            },
            {
                hpThreshold: 25,
                pattern: ['resurrection', 'full_heal'],
                description: 'Seraph resurrects with 50% HP! (One-time only)',
                descriptionKo: '세라핌이 50% HP로 부활합니다! (1회만)'
            }
        ],
        enrageTimer: 900000,  // 15 minutes
        guaranteedRewards: {
            gold: 30000,
            exp: 25000,
            items: [
                { itemId: 'light_fragment', quantity: 1 },
                { itemId: 'seraph_egg', quantity: 1 },
                { itemId: 'power_clone_s', quantity: 2 },
                { itemId: 'angel_wings', quantity: 1 }
            ],
            fragment: 'light_fragment'
        },
        icon: '✨',
        defeated: false
    },

    // Endgame: Rift Core - Elder God Fragment (Final Boss)
    {
        id: 'elder_god_fragment',
        name: 'Elder God Fragment',
        nameKo: '고대신의 파편',
        speciesId: 'elder_god',  // Unique void template
        level: 80,
        maxHp: 150000,
        phases: [
            {
                hpThreshold: 100,
                pattern: ['omni_element', 'chaos_bolt'],
                description: 'The Fragment wields all elemental powers!',
                descriptionKo: '파편이 모든 원소의 힘을 사용합니다!'
            },
            {
                hpThreshold: 75,
                pattern: ['time_skip', 'turn_manipulation'],
                description: 'Time itself bends! Turns are skipped!',
                descriptionKo: '시간이 왜곡됩니다! 턴이 스킵됩니다!'
            },
            {
                hpThreshold: 50,
                pattern: ['instant_death', 'pattern_telegraph'],
                description: 'Death patterns repeat! Learn and dodge!',
                descriptionKo: '즉사 패턴 반복! 학습하고 회피하세요!'
            },
            {
                hpThreshold: 25,
                pattern: ['screen_nuke', 'regeneration'],
                description: 'Full-screen attack with regeneration!',
                descriptionKo: '전체 화면 공격과 재생!'
            }
        ],
        enrageTimer: 1200000,  // 20 minutes
        guaranteedRewards: {
            gold: 50000,
            exp: 50000,
            items: [
                { itemId: 'void_fragment', quantity: 1 },
                { itemId: 'elder_god_egg', quantity: 1 },
                { itemId: 'power_clone_ss', quantity: 1 },
                { itemId: 'god_slayer_ring', quantity: 1 },
                { itemId: 'true_ending_key', quantity: 1 }
            ],
            fragment: 'void_fragment'
        },
        icon: '💀',
        defeated: false
    }
];

// Quick lookup by ID
export const BOSSES: Record<string, BossEncounter> = {};
BOSS_DATA.forEach(b => BOSSES[b.id] = b);
