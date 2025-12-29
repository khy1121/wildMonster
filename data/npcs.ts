import { NPC } from '../domain/types';

// Phase 5: NPC Data with Dialogues

export const NPC_DATA: NPC[] = [
    // ===== CHRONOS PLAZA (Hub) NPCs =====
    {
        id: 'elder_chronos',
        name: 'Elder Chronos',
        nameKo: '크로노스 장로',
        role: 'Story Guide',
        roleKo: '스토리 안내자',
        region: 'chronos_plaza',
        dialogue: {
            greeting: 'Welcome, young tamer. The Great Rift has fractured our world...',
            greetingKo: '환영하네, 젊은 테이머. 대균열이 우리 세계를 갈라놓았지...',
            questAvailable: 'I have important knowledge to share with you.',
            questAvailableKo: '자네에게 중요한 지식을 나누고 싶네.',
            questActive: 'The fragments await, scattered across the realms.',
            questActiveKo: '파편들이 영역 곳곳에 흩어져 기다리고 있네.',
            questComplete: 'You have done well. The path forward is clearer now.',
            questCompleteKo: '잘했네. 앞으로 나아갈 길이 더 분명해졌어.'
        },
        icon: '🧙',
        quests: ['welcome_to_aetheria']
    },
    {
        id: 'portal_keeper_aria',
        name: 'Aria',
        nameKo: '아리아',
        role: 'Portal Keeper',
        roleKo: '포털 지기',
        region: 'chronos_plaza',
        dialogue: {
            greeting: 'The portals connect all fragments. Where do you wish to go?',
            greetingKo: '포털들이 모든 파편을 연결합니다. 어디로 가실까요?',
            questAvailable: 'New portals will open as you prove yourself worthy.',
            questAvailableKo: '당신이 자격을 증명하면 새로운 포털이 열립니다.',
            questActive: 'The portals await your command.',
            questActiveKo: '포털들이 당신의 명령을 기다립니다.'
        },
        icon: '🌀'
    },
    {
        id: 'master_merchant_goldy',
        name: 'Goldy',
        nameKo: '골디',
        role: 'Master Merchant',
        roleKo: '마스터 상인',
        region: 'chronos_plaza',
        dialogue: {
            greeting: 'Everything has a price, friend. What are you looking for?',
            greetingKo: '모든 것엔 가격이 있어요, 친구. 무엇을 찾고 있나요?',
            questAvailable: 'I have rare items for the discerning tamer.',
            questAvailableKo: '식별력 있는 테이머를 위한 희귀 아이템이 있습니다.'
        },
        icon: '💰'
    },
    {
        id: 'training_master_rex',
        name: 'Rex',
        nameKo: '렉스',
        role: 'Training Master',
        roleKo: '훈련 마스터',
        region: 'chronos_plaza',
        dialogue: {
            greeting: 'Strength comes from training and dedication!',
            greetingKo: '힘은 훈련과 헌신에서 나옵니다!',
            questAvailable: 'I can help you unlock your monsters\' true potential.',
            questAvailableKo: '당신의 몬스터들의 진정한 잠재력을 깨우는 것을 도와드리죠.'
        },
        icon: '⚔️'
    },
    {
        id: 'archivist_luna',
        name: 'Luna',
        nameKo: '루나',
        role: 'Archivist',
        roleKo: '기록관',
        region: 'chronos_plaza',
        dialogue: {
            greeting: 'Knowledge is power. Let me share what I have learned.',
            greetingKo: '지식은 힘입니다. 제가 배운 것을 나누겠습니다.',
            questAvailable: 'I seek lore notes from across the fragments.',
            questAvailableKo: '저는 파편들 전역의 로어 노트를 찾고 있습니다.'
        },
        icon: '📚'
    },

    // ===== EMBERFALL GROVE NPCs =====
    {
        id: 'flame_keeper_ignar',
        name: 'Ignar',
        nameKo: '이그나르',
        role: 'Flame Keeper',
        roleKo: '불의 수호자',
        region: 'emberfall_grove',
        dialogue: {
            greeting: 'The forest burns, but we endure. Help us, tamer!',
            greetingKo: '숲이 불타지만 우리는 견뎌냅니다. 도와주세요, 테이머!',
            questAvailable: 'The fire spreads. We need someone brave to help.',
            questAvailableKo: '불길이 번지고 있습니다. 용감한 누군가가 필요합니다.',
            questActive: 'The flames still rage. Keep fighting!',
            questActiveKo: '불길이 여전히 맹렬합니다. 계속 싸우세요!',
            questComplete: 'The forest is saved! You have my eternal gratitude.',
            questCompleteKo: '숲이 구해졌습니다! 영원한 감사를 드립니다.'
        },
        icon: '🔥',
        quests: ['forest_fire', 'keepers_request']
    },
    {
        id: 'wandering_trader_sam',
        name: 'Sam',
        nameKo: '샘',
        role: 'Wandering Trader',
        roleKo: '떠도는 상인',
        region: 'emberfall_grove',
        dialogue: {
            greeting: 'Need supplies? I have potions and capture orbs!',
            greetingKo: '보급품이 필요한가요? 포션과 포획 구슬이 있어요!',
            questAvailable: 'Buy from me, and I might have work for you.',
            questAvailableKo: '저한테 사시면 일거리를 드릴 수도 있어요.'
        },
        icon: '🎒'
    },

    // ===== TIDECREST SHORE NPCs =====
    {
        id: 'tide_priestess_nereia',
        name: 'Nereia',
        nameKo: '네레이아',
        role: 'Tide Priestess',
        roleKo: '조수 여사제',
        region: 'tidecrest_shore',
        dialogue: {
            greeting: 'The ocean speaks to those who listen. Do you hear it?',
            greetingKo: '바다는 듣는 이에게 말합니다. 들리나요?',
            questAvailable: 'The sea guardian is restless. I need your help.',
            questAvailableKo: '바다 수호자가 불안해합니다. 당신의 도움이 필요합니다.',
            questActive: 'The trial continues. Prove your worth to the ocean.',
            questActiveKo: '시련이 계속됩니다. 바다에게 당신의 가치를 증명하세요.',
            questComplete: 'You have passed the ocean\'s trial. Well done.',
            questCompleteKo: '바다의 시련을 통과했습니다. 잘했어요.'
        },
        icon: '🌊',
        quests: ['tides_of_change', 'temple_trial']
    },
    {
        id: 'fisher_kael',
        name: 'Kael',
        nameKo: '카엘',
        role: 'Fisher',
        roleKo: '어부',
        region: 'tidecrest_shore',
        dialogue: {
            greeting: 'The fish are biting today! Want to try your luck?',
            greetingKo: '오늘 물고기가 잘 잡혀요! 운을 시험해볼래요?',
            questAvailable: 'I lost my fishing rod in the ruins. Can you find it?',
            questAvailableKo: '유적에 낚싯대를 잃어버렸어요. 찾을 수 있나요?'
        },
        icon: '🎣'
    },
    {
        id: 'shipwreck_survivor_marco',
        name: 'Marco',
        nameKo: '마르코',
        role: 'Shipwreck Survivor',
        roleKo: '난파선 생존자',
        region: 'tidecrest_shore',
        dialogue: {
            greeting: 'I survived the storm, but my treasure map is real!',
            greetingKo: '폭풍우에서 살아남았지만 내 보물 지도는 진짜예요!',
            questAvailable: 'Help me find my lost treasure, I\'ll share the reward!',
            questAvailableKo: '잃어버린 보물을 찾는 걸 도와주면 보상을 나눠줄게요!'
        },
        icon: '🗺️',
        quests: ['lost_treasure']
    },

    // ===== STORMWATCH PEAKS NPCs =====
    {
        id: 'thunder_sage_zephyr',
        name: 'Zephyr',
        nameKo: '제피로스',
        role: 'Thunder Sage',
        roleKo: '천둥 현자',
        region: 'stormwatch_peaks',
        dialogue: {
            greeting: 'Zzz... Who dares wake me? Oh, a tamer. What do you need?',
            greetingKo: 'Zzz... 누가 감히 날 깨우나? 오, 테이머군. 뭐가 필요한가?',
            questAvailable: 'If you wake me, you better have a good reason.',
            questAvailableKo: '날 깨웠으면 좋은 이유가 있어야지.',
            questActive: 'The storm never ends here. Get used to it.',
            questActiveKo: '여기선 폭풍이 멈추지 않아. 익숙해지게.',
            questComplete: 'You proved yourself. Perhaps I was wrong about you.',
            questCompleteKo: '실력을 증명했군. 내가 잘못 봤나 보네.'
        },
        icon: '⚡'
    },
    {
        id: 'excavator_granite',
        name: 'Granite',
        nameKo: '그래나이트',
        role: 'Excavator',
        roleKo: '발굴가',
        region: 'stormwatch_peaks',
        dialogue: {
            greeting: 'Ancient fossils hide beneath these peaks!',
            greetingKo: '고대 화석들이 이 봉우리 아래 숨어있어요!',
            questAvailable: 'Want to try excavating? It\'s quite rewarding!',
            questAvailableKo: '발굴을 시도해보실래요? 꽤 보람있답니다!'
        },
        icon: '⛏️'
    },
    {
        id: 'ancient_golem_guard',
        name: 'Golem Guard',
        nameKo: '골렘 경비',
        role: 'Ancient Guardian',
        roleKo: '고대 수호자',
        region: 'stormwatch_peaks',
        dialogue: {
            greeting: 'HALT. Answer my riddle to proceed.',
            greetingKo: '멈춰라. 수수께끼에 답해야 지나갈 수 있다.',
            questAvailable: 'Knowledge is the key to these ruins.',
            questAvailableKo: '지식이 이 유적의 열쇠다.'
        },
        icon: '🗿'
    }
];

// Quick lookup by ID
export const NPCS: Record<string, NPC> = {};
NPC_DATA.forEach(n => NPCS[n.id] = n);
