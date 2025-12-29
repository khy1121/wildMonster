import { Quest } from '../domain/types';

// Phase 5: Region-based Quest System
// Quests are now tied to regions and use objective-based progression

export const QUEST_DATA: any[] = [  // Using any[] to avoid type conflicts with old Quest components
  // ===== CHRONOS PLAZA (Hub) - Tutorial & Introduction =====
  {
    id: 'welcome_to_aetheria',
    type: 'main',
    name: 'Welcome to Aetheria',
    nameKo: '아이테리아에 오신 것을 환영합니다',
    description: 'Meet Elder Chronos and learn about the Great Rift.',
    descriptionKo: '크로노스 장로를 만나 대균열에 대해 알아보세요.',
    region: 'chronos_plaza',
    objectives: [
      {
        type: 'talk',
        target: 'elder_chronos',
        count: 1,
        current: 0,
        description: 'Talk to Elder Chronos',
        descriptionKo: '크로노스 장로와 대화하기'
      }
    ],
    rewards: {
      gold: 100,
      exp: 50
    },
    npcGiver: 'elder_chronos',
    status: 'available'
  },

  // ===== EMBERFALL GROVE (Region 1) - Main Story =====
  {
    id: 'first_steps',
    type: 'main',
    name: 'First Steps',
    nameKo: '첫 걸음',
    description: 'Capture your first wild monster in Emberfall Grove.',
    descriptionKo: '엠버폴 숲에서 첫 야생 몬스터를 포획하세요.',
    region: 'emberfall_grove',
    requiresLevel: 1,
    prerequisites: ['welcome_to_aetheria'],
    objectives: [
      {
        type: 'capture',
        target: 'any',
        count: 1,
        current: 0,
        description: 'Capture any wild monster',
        descriptionKo: '야생 몬스터 1마리 포획'
      }
    ],
    rewards: {
      gold: 200,
      exp: 100,
      items: [{ itemId: 'capture_orb', quantity: 3 }]
    },
    status: 'locked'
  },
  {
    id: 'forest_fire',
    type: 'main',
    name: 'Forest Fire',
    nameKo: '숲의 불길',
    description: 'Flame Keeper Ignar needs help clearing the burning forest. Defeat 10 Fire-type monsters.',
    descriptionKo: '불의 수호자 이그나르가 타오르는 숲을 정리하는 것을 도와주세요. 불 속성 몬스터 10마리를 처치하세요.',
    region: 'emberfall_grove',
    requiresLevel: 2,
    prerequisites: ['first_steps'],
    objectives: [
      {
        type: 'defeat',
        target: 'fire_type',
        count: 10,
        current: 0,
        description: 'Defeat 10 Fire-type monsters',
        descriptionKo: '불 속성 몬스터 10마리 처치'
      }
    ],
    rewards: {
      gold: 500,
      exp: 250,
      items: [{ itemId: 'potion', quantity: 3 }]
    },
    npcGiver: 'flame_keeper_ignar',
    status: 'locked'
  },
  {
    id: 'keepers_request',
    type: 'side',
    name: "Keeper's Request",
    nameKo: '수호자의 부탁',
    description: 'Collect 5 Fire Herbs for Ignar.',
    descriptionKo: '이그나르를 위해 불의 약초 5개를 수집하세요.',
    region: 'emberfall_grove',
    requiresLevel: 3,
    objectives: [
      {
        type: 'collect',
        target: 'fire_herb',
        count: 5,
        current: 0,
        description: 'Collect 5 Fire Herbs',
        descriptionKo: '불의 약초 5개 수집'
      }
    ],
    rewards: {
      gold: 300,
      exp: 150,
      items: [{ itemId: 'fire_data', quantity: 1 }]
    },
    npcGiver: 'flame_keeper_ignar',
    status: 'locked'
  },
  {
    id: 'shrine_guardian',
    type: 'main',
    name: 'Shrine Guardian',
    nameKo: '신전 수호자',
    description: 'Open the path to the Flame Shrine.',
    descriptionKo: '불의 신전으로 가는 길을 여세요.',
    region: 'emberfall_grove',
    requiresLevel: 8,
    prerequisites: ['forest_fire'],
    objectives: [
      {
        type: 'explore',
        target: 'flame_shrine',
        count: 1,
        current: 0,
        description: 'Reach the Flame Shrine',
        descriptionKo: '불의 신전에 도달하기'
      }
    ],
    rewards: {
      gold: 800,
      exp: 400
    },
    status: 'locked'
  },
  {
    id: 'titans_fall',
    type: 'main',
    name: "Titan's Fall",
    nameKo: '타이탄의 몰락',
    description: 'Defeat the Pyroclast Titan and claim the Fire Fragment.',
    descriptionKo: '화산 타이탄을 물리치고 불의 파편을 획득하세요.',
    region: 'emberfall_grove',
    requiresLevel: 10,
    prerequisites: ['shrine_guardian'],
    objectives: [
      {
        type: 'defeat',
        target: 'pyroclast_titan',
        count: 1,
        current: 0,
        description: 'Defeat Pyroclast Titan',
        descriptionKo: '화산 타이탄 격파'
      }
    ],
    rewards: {
      gold: 1000,
      exp: 500,
      items: [{ itemId: 'fire_fragment', quantity: 1 }],
      unlocks: ['portal_emberfall_to_hub', 'portal_hub_to_tidecrest']
    },
    status: 'locked'
  },

  // ===== TIDECREST SHORE (Region 2) - Main Story =====
  {
    id: 'tides_of_change',
    type: 'main',
    name: 'Tides of Change',
    nameKo: '변화의 조류',
    description: 'Explore Coral Shores and meet Tide Priestess Nereia.',
    descriptionKo: '산호 해변을 탐험하고 조수 여사제 네레이아를 만나세요.',
    region: 'tidecrest_shore',
    requiresLevel: 8,
    prerequisites: ['titans_fall'],
    objectives: [
      {
        type: 'explore',
        target: 'coral_shores',
        count: 1,
        current: 0,
        description: 'Explore Coral Shores',
        descriptionKo: '산호 해변 탐험'
      },
      {
        type: 'talk',
        target: 'tide_priestess_nereia',
        count: 1,
        current: 0,
        description: 'Talk to Tide Priestess Nereia',
        descriptionKo: '조수 여사제 네레이아와 대화'
      }
    ],
    rewards: {
      gold: 1200,
      exp: 600
    },
    npcGiver: 'tide_priestess_nereia',
    status: 'locked'
  },
  {
    id: 'fog_walker',
    type: 'main',
    name: 'Fog Walker',
    nameKo: '안개 속의 방랑자',
    description: 'Navigate through the Misty Isles.',
    descriptionKo: '안개 낀 섬을 통과하세요.',
    region: 'tidecrest_shore',
    requiresLevel: 12,
    prerequisites: ['tides_of_change'],
    objectives: [
      {
        type: 'explore',
        target: 'misty_isles',
        count: 1,
        current: 0,
        description: 'Navigate through Misty Isles',
        descriptionKo: '안개 섬 통과'
      }
    ],
    rewards: {
      gold: 1500,
      exp: 800
    },
    status: 'locked'
  },
  {
    id: 'lost_treasure',
    type: 'side',
    name: 'Lost Treasure',
    nameKo: '잃어버린 보물',
    description: 'Find 3 Ancient Artifacts in the Sunken Ruins.',
    descriptionKo: '수몰된 유적에서 고대 유물 3개를 찾으세요.',
    region: 'tidecrest_shore',
    requiresLevel: 15,
    objectives: [
      {
        type: 'collect',
        target: 'ancient_artifact',
        count: 3,
        current: 0,
        description: 'Collect 3 Ancient Artifacts',
        descriptionKo: '고대 유물 3개 수집'
      }
    ],
    rewards: {
      gold: 2000,
      exp: 1000,
      items: [{ itemId: 'water_data', quantity: 3 }]
    },
    status: 'locked'
  },
  {
    id: 'temple_trial',
    type: 'main',
    name: 'Temple Trial',
    nameKo: '신전의 시련',
    description: "Pass Nereia's trial to enter the Ocean Temple.",
    descriptionKo: '네레이아의 시련을 통과해 바다 신전에 들어가세요.',
    region: 'tidecrest_shore',
    requiresLevel: 16,
    prerequisites: ['fog_walker'],
    objectives: [
      {
        type: 'defeat',
        target: 'water_type',
        count: 20,
        current: 0,
        description: 'Defeat 20 Water-type monsters',
        descriptionKo: '물 속성 몬스터 20마리 처치'
      }
    ],
    rewards: {
      gold: 2500,
      exp: 1200
    },
    npcGiver: 'tide_priestess_nereia',
    status: 'locked'
  },
  {
    id: 'leviathans_wrath',
    type: 'main',
    name: "Leviathan's Wrath",
    nameKo: '리바이어던의 분노',
    description: "Defeat Leviathan's Echo and obtain the Water Fragment.",
    descriptionKo: "리바이어던의 메아리를 물리치고 물의 파편을 획득하세요.",
    region: 'tidecrest_shore',
    requiresLevel: 18,
    prerequisites: ['temple_trial'],
    objectives: [
      {
        type: 'defeat',
        target: 'leviathans_echo',
        count: 1,
        current: 0,
        description: "Defeat Leviathan's Echo",
        descriptionKo: '리바이어던의 메아리 격파'
      }
    ],
    rewards: {
      gold: 3000,
      exp: 1500,
      items: [{ itemId: 'water_fragment', quantity: 1 }],
      unlocks: ['portal_tidecrest_to_stormwatch']
    },
    status: 'locked'
  },

  // ===== Additional Starter Quests =====
  {
    id: 'intro_evolution',
    type: 'side',
    name: 'Power of Evolution',
    nameKo: '진화의 힘',
    description: 'Evolve a monster for the first time.',
    descriptionKo: '처음으로 몬스터를 진화시키세요.',
    region: 'emberfall_grove',
    requiresLevel: 15,
    objectives: [
      {
        type: 'evolve',
        target: 'any',
        count: 1,
        current: 0,
        description: 'Evolve any monster',
        descriptionKo: '몬스터 1마리 진화'
      }
    ],
    rewards: {
      gold: 1000,
      exp: 500,
      items: [{ itemId: 'evolution_stone', quantity: 1 }]
    },
    status: 'locked'
  }
];

// Quick lookup by ID
export const QUESTS: Record<string, Quest> = {};
QUEST_DATA.forEach(q => QUESTS[q.id] = q);
