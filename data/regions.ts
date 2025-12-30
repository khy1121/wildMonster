import { Region } from '../domain/types';
import { ElementType } from '../domain/types';

// Phase 5: Complete Region Data for 8 Fragments + Hub

export const REGION_DATA: Region[] = [
    // Hub - Safe Zone
    {
        id: 'chronos_plaza',
        name: 'Chronos Plaza',
        nameKo: '크로노스 광장',
        description: 'The central hub where all portals converge. A safe haven for tamers.',
        descriptionKo: '모든 포털이 모이는 중심 허브. 테이머들의 안전한 피난처.',
        element: ElementType.NEUTRAL,
        levelRange: { tamer: { min: 1, max: 50 }, wilder: { min: 1, max: 80 } },
        encounterPool: {
            common: [],
            uncommon: [],
            rare: []
        },
        boss: '',  // No boss in hub
        quests: ['welcome_to_aetheria'],
        portals: [
            'portal_hub_to_emberfall',
            'portal_hub_to_tidecrest',
            'portal_hub_to_stormwatch',
            'portal_hub_to_gloomveil',
            'portal_hub_to_verdant',
            'portal_hub_to_frozen',
            'portal_hub_to_celestial'
        ],
        npcs: ['elder_chronos', 'portal_keeper_aria', 'master_merchant_goldy', 'training_master_rex', 'archivist_luna'],
        loreNotes: ['hub_lore_1', 'hub_lore_2'],
        environment: 'void',
        isSafeZone: true
    },

    // Region 1: Emberfall Grove (Fire) - Lv.1-15
    {
        id: 'emberfall_grove',
        name: 'Emberfall Grove',
        nameKo: '엠버폴 숲',
        description: 'A tropical forest ablaze with volcanic activity. The starting point for all tamers.',
        descriptionKo: '화산 활동으로 불타는 열대 숲. 모든 테이머의 출발점.',
        element: ElementType.FIRE,
        levelRange: { tamer: { min: 1, max: 10 }, wilder: { min: 1, max: 15 } },
        encounterPool: {
            common: ['ignis', 'emberkit', 'pyrocat'],
            uncommon: ['flarehound', 'blazewing', 'flarehide'],
            rare: ['volcatrice', 'magmurtle'],
            elite: ['inferno_sprite']
        },
        boss: 'pyroclast_titan',
        bossTriggers: [
            {
                bossId: 'flarelion',
                condition: { type: 'LEVEL', value: 10 },
                spawnLocation: { x: 50, z: 50 }
            },
            {
                bossId: 'thunderhoof',
                condition: { type: 'TIME', value: 'MIDNIGHT' },
                spawnLocation: { x: -30, z: 40 }
            }
        ],
        quests: ['first_steps', 'forest_fire', 'keepers_request', 'shrine_guardian', 'titans_fall', 'intro_evolution'],
        portals: ['portal_emberfall_to_hub'],
        npcs: ['flame_keeper_ignar', 'wandering_trader_sam'],
        loreNotes: ['emberfall_lore_1', 'emberfall_lore_2', 'emberfall_lore_3', 'emberfall_lore_4'],
        environment: 'forest',
        weather: 'clear'
    },

    // Region 2: Tidecrest Shore (Water) - Lv.8-28
    {
        id: 'tidecrest_shore',
        name: 'Tidecrest Shore',
        nameKo: '타이드크레스트 해안',
        description: 'Endless ocean and misty islands. The sea guardian\'s domain.',
        descriptionKo: '끝없는 바다와 안개 낀 섬들. 바다 수호자의 영역.',
        element: ElementType.WATER,
        levelRange: { tamer: { min: 8, max: 18 }, wilder: { min: 12, max: 28 } },
        encounterPool: {
            common: ['droplet', 'bubblefin', 'mistlynx'],
            uncommon: ['aquaglide', 'coralclaw', 'wavemane'],
            rare: ['aquadrake', 'sea_serpent', 'tidehowler'],
            elite: ['kraken_spawn'],
            hidden: ['oceanid']  // Rain weather only
        },
        boss: 'leviathans_echo',
        bossTriggers: [
            {
                bossId: 'leviathans_echo',
                condition: { type: 'DEFEAT_COUNT', value: 50 },
                spawnLocation: { x: 0, z: 100 }
            }
        ],
        quests: ['tides_of_change', 'fog_walker', 'lost_treasure', 'temple_trial', 'leviathans_wrath'],
        portals: ['portal_tidecrest_to_hub', 'portal_tidecrest_to_emberfall', 'portal_tidecrest_to_stormwatch'],
        npcs: ['tide_priestess_nereia', 'fisher_kael', 'shipwreck_survivor_marco'],
        loreNotes: ['tidecrest_lore_1', 'tidecrest_lore_2', 'tidecrest_lore_3', 'tidecrest_lore_4', 'tidecrest_lore_5'],
        environment: 'ocean',
        weather: 'fog'
    },

    // Region 3: Stormwatch Peaks (Electric) - Lv.16-40
    {
        id: 'stormwatch_peaks',
        name: 'Stormwatch Peaks',
        nameKo: '스톰워치 봉우리',
        description: 'Treacherous mountains where lightning never ceases. Ancient ruins scatter the peaks.',
        descriptionKo: '번개가 끊임없이 내리치는 험준한 산맥. 고대 유적이 산재.',
        element: ElementType.ELECTRIC,
        levelRange: { tamer: { min: 16, max: 26 }, wilder: { min: 24, max: 40 } },
        encounterPool: {
            common: ['sparkling', 'voltkit', 'thunderhoof'],
            uncommon: ['boltmane', 'shockwing', 'voltiger'],
            rare: ['voltrex', 'stormbeast', 'lightningfang'],
            elite: ['thunder_wyvern'],
            hidden: ['raiju'],  // Thunderstorm only
            mythic: ['ancient_voltasaur']  // Excavation
        },
        boss: 'stormcaller_rex',
        quests: [],  // Will add in next phase
        portals: ['portal_stormwatch_to_hub', 'portal_stormwatch_to_tidecrest', 'portal_stormwatch_to_gloomveil'],
        npcs: ['thunder_sage_zephyr', 'excavator_granite', 'ancient_golem_guard'],
        loreNotes: [],  // Will add in next phase
        environment: 'mountain',
        weather: 'thunderstorm'
    },

    // Regions 4-8 will be added in subsequent phases
    // For now, creating placeholders to avoid errors
];

// Quick lookup by ID
export const REGIONS: Record<string, Region> = {};
REGION_DATA.forEach(r => REGIONS[r.id] = r);
