import { LoreNote } from '../domain/types';

// Phase 5: Lore Notes for World Building

export const LORE_DATA: LoreNote[] = [
    // ===== CHRONOS PLAZA (Hub) Lore =====
    {
        id: 'hub_lore_1',
        title: 'The Great Rift',
        titleKo: '대균열',
        content: 'Thousands of years ago, humanity\'s greed led to the abuse of the World Tree\'s power. The backlash created the Great Rift, shattering Aetheria into eight fragments scattered across space and time.',
        contentKo: '수천 년 전, 인간의 욕심은 세계수의 힘을 남용하게 했습니다. 그 역효과로 대균열이 발생하여 아이테리아가 시공간에 흩어진 8개의 파편으로 분열되었습니다.',
        region: 'chronos_plaza',
        category: 'history',
        found: false
    },
    {
        id: 'hub_lore_2',
        title: 'Elder Chronos',
        titleKo: '크로노스 장로',
        content: 'Elder Chronos is one of the last survivors of the ancient civilization. He has dedicated his life to maintaining the portal network and seeking tamers worthy of restoring the world.',
        contentKo: '크로노스 장로는 고대 문명의 마지막 생존자 중 한 명입니다. 그는 포털 네트워크를 유지하고 세계를 복원할 가치 있는 테이머를 찾는 데 평생을 바쳤습니다.',
        region: 'chronos_plaza',
        category: 'character',
        found: false
    },

    // ===== EMBERFALL GROVE Lore =====
    {
        id: 'emberfall_lore_1',
        title: 'Volcanic Awakening',
        titleKo: '화산의 각성',
        content: 'Emberfall Grove was once a peaceful forest. After the Rift, volcanic vents opened, transforming it into a land of eternal fire. The fire monsters thrived, but the forest\'s original inhabitants fled.',
        contentKo: '엠버폴 숲은 한때 평화로운 숲이었습니다. 균열 후 화산 분출구가 열리면서 영원한 불의 땅으로 변했습니다. 불 몬스터들은 번성했지만 숲의 원래 주민들은 도망쳤습니다.',
        region: 'emberfall_grove',
        category: 'world',
        found: false
    },
    {
        id: 'emberfall_lore_2',
        title: 'Flame Keeper Oath',
        titleKo: '불의 수호자의 맹세',
        content: 'Ignar swore to protect Emberfall Grove, even as it burns. He believes the flames can be tamed, and the forest reborn. His unwavering dedication inspires all who meet him.',
        contentKo: '이그나르는 엠버폴 숲이 불타는 중에도 이를 지키겠다고 맹세했습니다. 그는 불길을 길들이고 숲을 재생시킬 수 있다고 믿습니다. 그의 흔들리지 않는 헌신은 만나는 모든 이들에게 영감을 줍니다.',
        region: 'emberfall_grove',
        category: 'character',
        found: false
    },
    {
        id: 'emberfall_lore_3',
        title: 'The Pyroclast Titan',
        titleKo: '화산 타이탄',
        content: 'Born from the heart of the volcano, the Pyroclast Titan is a manifestation of pure fire energy. It guards the Fire Fragment, unaware that its existence maintains the volcanic activity.',
        contentKo: '화산의 심장에서 태어난 화산 타이탄은 순수한 불 에너지의 현현입니다. 불의 파편을 지키며 자신의 존재가 화산 활동을 유지한다는 것을 모릅니다.',
        region: 'emberfall_grove',
        category: 'fragment',
        found: false
    },
    {
        id: 'emberfall_lore_4',
        title: 'First Tamers',
        titleKo: '최초의 테이머들',
        content: 'Emberfall Grove is where the first tamers discovered their bond with wild monsters. The tradition continues, with every new tamer beginning their journey here.',
        contentKo: '엠버폴 숲은 최초의 테이머들이 야생 몬스터와의 유대를 발견한 곳입니다. 그 전통은 계속되어 모든 새로운 테이머가 여기서 여정을 시작합니다.',
        region: 'emberfall_grove',
        category: 'history',
        found: false
    },

    // ===== TIDECREST SHORE Lore =====
    {
        id: 'tidecrest_lore_1',
        title: 'Ocean Temple Origins',
        titleKo: '바다 신전의 기원',
        content: 'The Ocean Temple predates the Great Rift. It was built by ancient sea-worshippers who revered the power of water. After the Rift, it became the home of the Water Fragment.',
        contentKo: '바다 신전은 대균열보다 먼저 출현했습니다. 물의 힘을 숭배하는 고대 바다 숭배자들이 지었습니다. 균열 후 물의 파편의 거처가 되었습니다.',
        region: 'tidecrest_shore',
        category: 'world',
        found: false
    },
    {
        id: 'tidecrest_lore_2',
        title: 'Tide Priestess Lineage',
        titleKo: '조수 여사제 혈통',
        content: 'Nereia is the latest in a long line of Tide Priestesses. Each generation guards the Ocean Temple, communicating with the sea and its creatures. They alone can interpret the ocean\'s will.',
        contentKo: '네레이아는 긴 조수 여사제 혈통의 최신 세대입니다. 각 세대는 바다 신전을 지키며 바다와 그 생물들과 소통합니다. 그들만이 바다의 의지를 해석할 수 있습니다.',
        region: 'tidecrest_shore',
        category: 'character',
        found: false
    },
    {
        id: 'tidecrest_lore_3',
        title: "Leviathan's Echo",
        titleKo: '리바이어던의 메아리',
        content: 'Not the true Leviathan, but a powerful echo of its essence. The real Leviathan vanished during the Rift. This Echo guards the Water Fragment in its stead.',
        contentKo: '진정한 리바이어던이 아니라 그 본질의 강력한 메아리입니다. 진짜 리바이어던은 균열 중에 사라졌습니다. 이 메아리가 대신 물의 파편을 지킵니다.',
        region: 'tidecrest_shore',
        category: 'fragment',
        found: false
    },
    {
        id: 'tidecrest_lore_4',
        title: 'Sunken Ruins Mystery',
        titleKo: '수몰된 유적의 미스터리',
        content: 'The Sunken Ruins were once a thriving coastal city. The Great Rift caused catastrophic flooding, preserving the city underwater. Ancient artifacts hint at advanced technology.',
        contentKo: '수몰된 유적은 한때 번영하는 해안 도시였습니다. 대균열이 재앙적 홍수를 일으켜 도시를 수중에 보존했습니다. 고대 유물들은 진보된 기술을 암시합니다.',
        region: 'tidecrest_shore',
        category: 'history',
        found: false
    },
    {
        id: 'tidecrest_lore_5',
        title: 'Fisher Kael\'s Tale',
        titleKo: '어부 카엘의 이야기',
        content: 'Kael claims to have seen the true Leviathan once, deep in the fog. No one believes him, but he swears it spoke to him in a language older than words.',
        contentKo: '카엘은 한때 안개 깊은 곳에서 진정한 리바이어던을 봤다고 주장합니다. 아무도 믿지 않지만 그는 말보다 오래된 언어로 자신에게 말했다고 맹세합니다.',
        region: 'tidecrest_shore',
        category: 'character',
        found: false
    },

    // ===== STORMWATCH PEAKS Lore (Partial) =====
    {
        id: 'stormwatch_lore_1',
        title: 'Eternal Storms',
        titleKo: '영원한 폭풍',
        content: 'Lightning never stops in Stormwatch Peaks. The ancient ruins act as lightning rods, channeling electric energy. Some believe this was intentional - a power source for the old civilization.',
        contentKo: '스톰워치 봉우리에서는 번개가 멈추지 않습니다. 고대 유적들이 피뢰침 역할을 하며 전기 에너지를 전달합니다. 일부는 이것이 의도적이었다고 믿습니다 - 고대 문명의 전력원.',
        region: 'stormwatch_peaks',
        category: 'world',
        found: false
    },
    {
        id: 'stormwatch_lore_2',
        title: 'Thunder Sage Sleep',
        titleKo: '천둥 현자의 잠',
        content: 'Zephyr has been asleep for centuries, waiting for the "Chosen One" to awaken him. Many have tried. Few have succeeded. Those who wake him must prove their worthiness.',
        contentKo: '제피로스는 수 세기 동안 잠들어 있으며 "선택받은 자"가 자신을 깨우기를 기다립니다. 많은 이들이 시도했습니다. 성공한 이는 적습니다. 깨우는 자는 자격을 증명해야 합니다.',
        region: 'stormwatch_peaks',
        category: 'character',
        found: false
    }
];

// Quick lookup by ID
export const LORE_NOTES: Record<string, LoreNote> = {};
LORE_DATA.forEach(l => LORE_NOTES[l.id] = l);
