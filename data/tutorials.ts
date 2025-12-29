export interface TutorialStep {
    id: string;
    title: string;
    titleKo: string;
    description: string;
    descriptionKo: string;
    targetElement?: string; // CSS selector for highlighting
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
    action?: 'click' | 'wait' | 'custom';
    nextTrigger?: 'auto' | 'click' | 'action';
    image?: string;
}

export interface TutorialSequence {
    id: string;
    name: string;
    nameKo: string;
    steps: TutorialStep[];
    triggerCondition?: string; // When to show this tutorial
    priority: number;
}

export const TUTORIAL_SEQUENCES: TutorialSequence[] = [
    {
        id: 'first_time',
        name: 'Welcome to EonTamers',
        nameKo: 'EonTamers에 오신 것을 환영합니다',
        priority: 1,
        triggerCondition: 'firstTime',
        steps: [
            {
                id: 'welcome',
                title: 'Welcome to EonTamers!',
                titleKo: 'EonTamers에 오신 것을 환영합니다!',
                description: 'Embark on an epic journey to become the greatest monster tamer! This tutorial will guide you through the basics.',
                descriptionKo: '최고의 몬스터 테이머가 되기 위한 장대한 여정을 시작하세요! 이 튜토리얼이 기본 사항을 안내합니다.',
                position: 'center',
                nextTrigger: 'click'
            },
            {
                id: 'character_select',
                title: 'Choose Your Character',
                titleKo: '캐릭터 선택',
                description: 'Select your tamer character. Each has unique bonuses and starting stats.',
                descriptionKo: '테이머 캐릭터를 선택하세요. 각 캐릭터는 고유한 보너스와 시작 스탯을 가지고 있습니다.',
                position: 'center',
                nextTrigger: 'action'
            },
            {
                id: 'starter_select',
                title: 'Choose Your Starter',
                titleKo: '스타터 선택',
                description: 'Pick your first monster companion! Choose wisely - they will be your partner throughout your journey.',
                descriptionKo: '첫 번째 몬스터 동료를 선택하세요! 신중하게 선택하세요 - 여정 내내 당신의 파트너가 될 것입니다.',
                position: 'center',
                nextTrigger: 'action'
            }
        ]
    },
    {
        id: 'hud_basics',
        name: 'Understanding the HUD',
        nameKo: 'HUD 이해하기',
        priority: 2,
        steps: [
            {
                id: 'hud_overview',
                title: 'Your HUD',
                titleKo: 'HUD 개요',
                description: 'The HUD shows your active monster, gold, and quick access buttons.',
                descriptionKo: 'HUD는 활성 몬스터, 골드, 빠른 접근 버튼을 표시합니다.',
                targetElement: '.hud-container',
                position: 'bottom',
                nextTrigger: 'click'
            },
            {
                id: 'monster_info',
                title: 'Monster Information',
                titleKo: '몬스터 정보',
                description: 'Click on your monster to view detailed stats, skills, and evolution paths.',
                descriptionKo: '몬스터를 클릭하여 상세 스탯, 스킬, 진화 경로를 확인하세요.',
                targetElement: '[aria-label*="monster"]',
                position: 'right',
                nextTrigger: 'click'
            },
            {
                id: 'shop_intro',
                title: 'The Shop',
                titleKo: '상점',
                description: 'Visit the shop to buy items, equipment, and capture devices.',
                descriptionKo: '상점을 방문하여 아이템, 장비, 포획 장치를 구매하세요.',
                targetElement: '[aria-label*="Shop"]',
                position: 'left',
                nextTrigger: 'click'
            }
        ]
    },
    {
        id: 'battle_basics',
        name: 'Battle System',
        nameKo: '전투 시스템',
        priority: 3,
        steps: [
            {
                id: 'battle_start',
                title: 'Entering Battle',
                titleKo: '전투 시작',
                description: 'When you encounter a wild monster, battle begins! Use your skills wisely.',
                descriptionKo: '야생 몬스터를 만나면 전투가 시작됩니다! 스킬을 현명하게 사용하세요.',
                position: 'center',
                nextTrigger: 'click'
            },
            {
                id: 'skills',
                title: 'Using Skills',
                titleKo: '스킬 사용',
                description: 'Each skill has different power, cooldown, and effects. Choose the right skill for each situation!',
                descriptionKo: '각 스킬은 다른 위력, 쿨다운, 효과를 가지고 있습니다. 상황에 맞는 스킬을 선택하세요!',
                position: 'bottom',
                nextTrigger: 'click'
            },
            {
                id: 'capture',
                title: 'Capturing Monsters',
                titleKo: '몬스터 포획',
                description: 'Weaken wild monsters and use capture devices to add them to your team!',
                descriptionKo: '야생 몬스터를 약화시키고 포획 장치를 사용하여 팀에 추가하세요!',
                position: 'bottom',
                nextTrigger: 'click'
            }
        ]
    },
    {
        id: 'progression',
        name: 'Progression Systems',
        nameKo: '성장 시스템',
        priority: 4,
        steps: [
            {
                id: 'leveling',
                title: 'Leveling Up',
                titleKo: '레벨 업',
                description: 'Win battles to gain experience and level up your monsters!',
                descriptionKo: '전투에서 승리하여 경험치를 얻고 몬스터를 레벨업하세요!',
                position: 'center',
                nextTrigger: 'click'
            },
            {
                id: 'evolution',
                title: 'Evolution',
                titleKo: '진화',
                description: 'At certain levels, monsters can evolve into more powerful forms!',
                descriptionKo: '특정 레벨에서 몬스터는 더 강력한 형태로 진화할 수 있습니다!',
                position: 'center',
                nextTrigger: 'click'
            },
            {
                id: 'equipment',
                title: 'Equipment System',
                titleKo: '장비 시스템',
                description: 'Equip weapons, armor, and accessories to boost your stats!',
                descriptionKo: '무기, 방어구, 액세서리를 장착하여 스탯을 강화하세요!',
                targetElement: '[aria-label*="Equipment"]',
                position: 'left',
                nextTrigger: 'click'
            }
        ]
    }
];

export const HELP_TOPICS = [
    {
        id: 'combat',
        title: 'Combat Guide',
        titleKo: '전투 가이드',
        icon: '⚔️',
        sections: [
            {
                title: 'Basic Combat',
                titleKo: '기본 전투',
                content: 'Use skills to damage enemies. Each skill has a cooldown period.',
                contentKo: '스킬을 사용하여 적에게 데미지를 입히세요. 각 스킬은 쿨다운 시간이 있습니다.'
            },
            {
                title: 'Type Advantages',
                titleKo: '타입 상성',
                content: 'Fire > Grass > Water > Fire. Electric is strong against Water.',
                contentKo: '불 > 풀 > 물 > 불. 전기는 물에 강합니다.'
            },
            {
                title: 'Status Effects',
                titleKo: '상태이상',
                content: 'Burn, Freeze, Poison, and more can turn the tide of battle!',
                contentKo: '화상, 얼음, 중독 등이 전투의 흐름을 바꿀 수 있습니다!'
            }
        ]
    },
    {
        id: 'monsters',
        title: 'Monster Management',
        titleKo: '몬스터 관리',
        icon: '🐉',
        sections: [
            {
                title: 'Party System',
                titleKo: '파티 시스템',
                content: 'You can have up to 6 monsters in your active party.',
                contentKo: '활성 파티에 최대 6마리의 몬스터를 보유할 수 있습니다.'
            },
            {
                title: 'Evolution',
                titleKo: '진화',
                content: 'Monsters evolve at specific levels. Check their evolution paths!',
                contentKo: '몬스터는 특정 레벨에서 진화합니다. 진화 경로를 확인하세요!'
            },
            {
                title: 'Enhancement',
                titleKo: '강화',
                content: 'Use enhancement stones to permanently boost your monsters.',
                contentKo: '강화석을 사용하여 몬스터를 영구적으로 강화하세요.'
            }
        ]
    },
    {
        id: 'systems',
        title: 'Game Systems',
        titleKo: '게임 시스템',
        icon: '⚙️',
        sections: [
            {
                title: 'Save System',
                titleKo: '저장 시스템',
                content: 'Use the Save button (💾) to save your progress. Auto-save is enabled by default.',
                contentKo: '저장 버튼(💾)을 사용하여 진행 상황을 저장하세요. 자동 저장이 기본적으로 활성화되어 있습니다.'
            },
            {
                title: 'Expeditions',
                titleKo: '탐험',
                content: 'Send monsters on expeditions to gather resources while you play!',
                contentKo: '플레이하는 동안 몬스터를 탐험에 보내 자원을 수집하세요!'
            },
            {
                title: 'Achievements',
                titleKo: '업적',
                content: 'Complete achievements to earn rewards and show off your progress!',
                contentKo: '업적을 완료하여 보상을 받고 진행 상황을 자랑하세요!'
            }
        ]
    },
    {
        id: 'controls',
        title: 'Controls',
        titleKo: '조작법',
        icon: '🎮',
        sections: [
            {
                title: 'Movement',
                titleKo: '이동',
                content: 'Click on the map to move your character in exploration mode.',
                contentKo: '탐험 모드에서 맵을 클릭하여 캐릭터를 이동하세요.'
            },
            {
                title: 'Menus',
                titleKo: '메뉴',
                content: 'Use the HUD buttons to access Shop, Equipment, Quests, and more.',
                contentKo: 'HUD 버튼을 사용하여 상점, 장비, 퀘스트 등에 접근하세요.'
            },
            {
                title: 'Shortcuts',
                titleKo: '단축키',
                content: 'ESC - Close menus | Space - Confirm | Click - Select',
                contentKo: 'ESC - 메뉴 닫기 | Space - 확인 | 클릭 - 선택'
            }
        ]
    }
];
