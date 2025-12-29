import { Portal } from '../domain/types';

// Phase 5: Portal Network connecting all regions

export const PORTAL_DATA: Portal[] = [
    // ===== Hub Portals (Connect to all regions) =====
    {
        id: 'portal_hub_to_emberfall',
        name: 'Portal to Emberfall Grove',
        nameKo: '엠버폴 숲 포털',
        fromRegion: 'chronos_plaza',
        toRegion: 'emberfall_grove',
        unlockLevel: 1,
        icon: '🔥'
    },
    {
        id: 'portal_hub_to_tidecrest',
        name: 'Portal to Tidecrest Shore',
        nameKo: '타이드크레스트 해안 포털',
        fromRegion: 'chronos_plaza',
        toRegion: 'tidecrest_shore',
        unlockLevel: 8,
        unlockQuest: 'titans_fall',  // Unlocks after beating first boss
        icon: '🌊'
    },
    {
        id: 'portal_hub_to_stormwatch',
        name: 'Portal to Stormwatch Peaks',
        nameKo: '스톰워치 봉우리 포털',
        fromRegion: 'chronos_plaza',
        toRegion: 'stormwatch_peaks',
        unlockLevel: 16,
        unlockQuest: 'leviathans_wrath',
        icon: '⚡'
    },
    {
        id: 'portal_hub_to_gloomveil',
        name: 'Portal to Gloomveil Hollow',
        nameKo: '글룸베일 공동 포털',
        fromRegion: 'chronos_plaza',
        toRegion: 'gloomveil_hollow',
        unlockLevel: 24,
        icon: '🌑'
    },
    {
        id: 'portal_hub_to_verdant',
        name: 'Portal to Verdant Realm',
        nameKo: '버던트 영역 포털',
        fromRegion: 'chronos_plaza',
        toRegion: 'verdant_realm',
        unlockLevel: 32,
        icon: '🌿'
    },
    {
        id: 'portal_hub_to_frozen',
        name: 'Portal to Frozen Wastelands',
        nameKo: '얼음 황무지 포털',
        fromRegion: 'chronos_plaza',
        toRegion: 'frozen_wastelands',
        unlockLevel: 40,
        icon: '❄️'
    },
    {
        id: 'portal_hub_to_celestial',
        name: 'Portal to Celestial Summit',
        nameKo: '천공의 정상 포털',
        fromRegion: 'chronos_plaza',
        toRegion: 'celestial_summit',
        unlockLevel: 46,
        icon: '✨'
    },

    // ===== Return Portals (Back to Hub) =====
    {
        id: 'portal_emberfall_to_hub',
        name: 'Return to Chronos Plaza',
        nameKo: '크로노스 광장으로 돌아가기',
        fromRegion: 'emberfall_grove',
        toRegion: 'chronos_plaza',
        unlockLevel: 1,
        icon: '🏛️'
    },
    {
        id: 'portal_tidecrest_to_hub',
        name: 'Return to Chronos Plaza',
        nameKo: '크로노스 광장으로 돌아가기',
        fromRegion: 'tidecrest_shore',
        toRegion: 'chronos_plaza',
        unlockLevel: 8,
        icon: '🏛️'
    },
    {
        id: 'portal_stormwatch_to_hub',
        name: 'Return to Chronos Plaza',
        nameKo: '크로노스 광장으로 돌아가기',
        fromRegion: 'stormwatch_peaks',
        toRegion: 'chronos_plaza',
        unlockLevel: 16,
        icon: '🏛️'
    },

    // ===== Region-to-Region Portals (Adjacent connections) =====
    {
        id: 'portal_emberfall_to_tidecrest',
        name: 'Portal to Tidecrest Shore',
        nameKo: '타이드크레스트 해안 포털',
        fromRegion: 'emberfall_grove',
        toRegion: 'tidecrest_shore',
        unlockLevel: 8,
        unlockQuest: 'titans_fall',
        icon: '🌊'
    },
    {
        id: 'portal_tidecrest_to_emberfall',
        name: 'Portal to Emberfall Grove',
        nameKo: '엠버폴 숲 포털',
        fromRegion: 'tidecrest_shore',
        toRegion: 'emberfall_grove',
        unlockLevel: 8,
        icon: '🔥'
    },
    {
        id: 'portal_tidecrest_to_stormwatch',
        name: 'Portal to Stormwatch Peaks',
        nameKo: '스톰워치 봉우리 포털',
        fromRegion: 'tidecrest_shore',
        toRegion: 'stormwatch_peaks',
        unlockLevel: 16,
        unlockQuest: 'leviathans_wrath',
        icon: '⚡'
    },
    {
        id: 'portal_stormwatch_to_tidecrest',
        name: 'Portal to Tidecrest Shore',
        nameKo: '타이드크레스트 해안 포털',
        fromRegion: 'stormwatch_peaks',
        toRegion: 'tidecrest_shore',
        unlockLevel: 16,
        icon: '🌊'
    },
    {
        id: 'portal_stormwatch_to_gloomveil',
        name: 'Portal to Gloomveil Hollow',
        nameKo: '글룸베일 공동 포털',
        fromRegion: 'stormwatch_peaks',
        toRegion: 'gloomveil_hollow',
        unlockLevel: 24,
        icon: '🌑'
    }
];

// Quick lookup by ID
export const PORTALS: Record<string, Portal> = {};
PORTAL_DATA.forEach(p => PORTALS[p.id] = p);
