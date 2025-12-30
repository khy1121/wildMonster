
import { MonsterSpecies, ElementType, FactionType } from '../domain/types';
import { PHASE5_MONSTERS } from './phase5Monsters';

export const MONSTER_DATA: Record<string, MonsterSpecies> = {
  // --- 스타터: 이그니스 계열 (FIRE) ---
  ignis: {
    id: 'ignis',
    name: 'Ignis',
    type: ElementType.FIRE,
    faction: FactionType.EMBER_CLAN,
    evolutionStage: 1,
    baseStats: { hp: 50, maxHp: 50, attack: 14, specialAttack: 16, defense: 10, skillResistance: 8, speed: 12 },
    icon: '🦖',
    rarity: 'Rare',
    skills: { basic: 'scratch', special: 'ember' },
    spriteKey: 'ignis',
    evolutions: [
      { targetSpeciesId: 'flarehide', levelThreshold: 15, description: '성장한 불꽃의 피부', previewSkills: ['tackle'] }
    ]
  },
  flarehide: {
    id: 'flarehide',
    name: 'Flarehide',
    type: ElementType.FIRE,
    faction: FactionType.EMBER_CLAN,
    evolutionStage: 2,
    baseStats: { hp: 120, maxHp: 120, attack: 35, specialAttack: 40, defense: 25, skillResistance: 20, speed: 30 },
    icon: '🐉',
    rarity: 'Uncommon',
    skills: { basic: 'tackle', special: 'ember', ultimate: 'fire_blast' },
    spriteKey: 'flarehide',
    evolutions: [
      { targetSpeciesId: 'volcadragon', levelThreshold: 35, description: '화염의 지배자', previewSkills: ['fire_blast'] }
    ]
  },
  volcadragon: {
    id: 'volcadragon',
    name: 'Volcadragon',
    type: ElementType.FIRE,
    faction: FactionType.EMBER_CLAN,
    evolutionStage: 3,
    baseStats: { hp: 350, maxHp: 350, attack: 95, specialAttack: 110, defense: 75, skillResistance: 65, speed: 80 },
    icon: '🔥🐉',
    rarity: 'Legendary',
    skills: { basic: 'tackle', special: 'fire_blast', ultimate: 'magma_surge' },
    evolutions: [
      { targetSpeciesId: 'inferno_tyrant', levelThreshold: 60, description: '심연의 지배자', previewSkills: ['inferno_doom'] }
    ]
  },
  inferno_tyrant: {
    id: 'inferno_tyrant',
    name: 'Inferno Tyrant',
    type: ElementType.FIRE,
    faction: FactionType.EMBER_CLAN,
    evolutionStage: 4,
    baseStats: { hp: 650, maxHp: 650, attack: 180, specialAttack: 220, defense: 140, skillResistance: 120, speed: 160 },
    icon: '⚔️🐉',
    rarity: 'Legendary',
    skills: { basic: 'blazing_strike', special: 'inferno_doom', ultimate: 'world_on_fire' }
  },

  // --- 스타터: 아쿠알로 계열 (WATER) ---
  aqualo: {
    id: 'aqualo',
    name: 'Aqualo',
    type: ElementType.WATER,
    faction: FactionType.TIDE_WATCHERS,
    evolutionStage: 1,
    baseStats: { hp: 60, maxHp: 60, attack: 10, specialAttack: 14, defense: 12, skillResistance: 12, speed: 10 },
    icon: '🐡',
    rarity: 'Rare',
    skills: { basic: 'tackle', special: 'bubble' },
    spriteKey: 'aqualo',
    evolutions: [
      { targetSpeciesId: 'serpentform', levelThreshold: 15, description: '우아한 바다 뱀', previewSkills: ['ice_shard'] }
    ]
  },
  serpentform: {
    id: 'serpentform',
    name: 'Serpentform',
    type: ElementType.WATER,
    faction: FactionType.TIDE_WATCHERS,
    evolutionStage: 2,
    baseStats: { hp: 140, maxHp: 140, attack: 32, specialAttack: 38, defense: 28, skillResistance: 28, speed: 35 },
    icon: '🐍',
    rarity: 'Uncommon',
    skills: { basic: 'tackle', special: 'bubble', ultimate: 'ice_shard' },
    evolutions: [
      { targetSpeciesId: 'krakenwhale', levelThreshold: 35, description: '대양의 거인', previewSkills: ['tidal_wave'] }
    ]
  },
  krakenwhale: {
    id: 'krakenwhale',
    name: 'Krakenwhale',
    type: ElementType.WATER,
    faction: FactionType.TIDE_WATCHERS,
    evolutionStage: 3,
    baseStats: { hp: 450, maxHp: 450, attack: 85, specialAttack: 105, defense: 95, skillResistance: 95, speed: 65 },
    icon: '🐋',
    rarity: 'Legendary',
    skills: { basic: 'tackle', special: 'tidal_wave', ultimate: 'kraken_wrath' },
    evolutions: [
      { targetSpeciesId: 'leviathan_lord', levelThreshold: 60, description: '심해의 황제', previewSkills: ['abyssal_surge'] }
    ]
  },
  leviathan_lord: {
    id: 'leviathan_lord',
    name: 'Leviathan Lord',
    type: ElementType.WATER,
    faction: FactionType.TIDE_WATCHERS,
    evolutionStage: 4,
    baseStats: { hp: 800, maxHp: 800, attack: 160, specialAttack: 210, defense: 180, skillResistance: 180, speed: 140 },
    icon: '🔱🐋',
    rarity: 'Legendary',
    skills: { basic: 'ocean_slash', special: 'abyssal_surge', ultimate: 'deluge_end' }
  },

  // --- 스타터: 볼트윙 계열 (ELECTRIC) ---
  voltwing: {
    id: 'voltwing',
    name: 'Voltwing',
    type: ElementType.ELECTRIC,
    faction: FactionType.STORM_HERDERS,
    evolutionStage: 1,
    baseStats: { hp: 45, maxHp: 45, attack: 12, specialAttack: 14, defense: 8, skillResistance: 6, speed: 16 },
    icon: '🐥',
    rarity: 'Rare',
    skills: { basic: 'scratch', special: 'spark' },
    spriteKey: 'voltwing',
    evolutions: [
      { targetSpeciesId: 'stormhawk', levelThreshold: 15, description: '번개만큼 빠른 매', previewSkills: ['tackle'] }
    ]
  },
  stormhawk: {
    id: 'stormhawk',
    name: 'Stormhawk',
    type: ElementType.ELECTRIC,
    faction: FactionType.STORM_HERDERS,
    evolutionStage: 2,
    baseStats: { hp: 110, maxHp: 110, attack: 40, specialAttack: 45, defense: 20, skillResistance: 15, speed: 45 },
    icon: '🦅',
    rarity: 'Uncommon',
    skills: { basic: 'scratch', special: 'spark', ultimate: 'thunderbolt' },
    evolutions: [
      { targetSpeciesId: 'thundernebula', levelThreshold: 35, description: '폭풍의 화신', previewSkills: ['lightning_storm'] }
    ]
  },
  thundernebula: {
    id: 'thundernebula',
    name: 'Thundernebula',
    type: ElementType.ELECTRIC,
    faction: FactionType.STORM_HERDERS,
    evolutionStage: 3,
    baseStats: { hp: 320, maxHp: 320, attack: 105, specialAttack: 120, defense: 60, skillResistance: 50, speed: 110 },
    icon: '🌩️🦅',
    rarity: 'Legendary',
    skills: { basic: 'scratch', special: 'lightning_storm', ultimate: 'volt_overload' },
    evolutions: [
      { targetSpeciesId: 'rarestrike_phoenix', levelThreshold: 60, description: '불멸의 전격조', previewSkills: ['divine_thunder'] }
    ]
  },
  rarestrike_phoenix: {
    id: 'rarestrike_phoenix',
    name: 'Rare-Strike Phoenix',
    type: ElementType.ELECTRIC,
    faction: FactionType.STORM_HERDERS,
    evolutionStage: 4,
    baseStats: { hp: 600, maxHp: 600, attack: 200, specialAttack: 240, defense: 120, skillResistance: 100, speed: 220 },
    icon: '⚡🦚',
    rarity: 'Legendary',
    skills: { basic: 'sonic_blade', special: 'divine_thunder', ultimate: 'eternal_spark' }
  },

  // --- 기존 몬스터 업데이트 ---
  'pyrocat': {
    id: 'pyrocat',
    name: 'Pyrocat',
    type: ElementType.FIRE,
    faction: FactionType.EMBER_CLAN,
    evolutionStage: 1,
    icon: '🔥',
    rarity: 'Common',
    baseStats: { hp: 50, maxHp: 50, attack: 12, specialAttack: 14, defense: 8, skillResistance: 6, speed: 10 },
    skills: { basic: 'scratch', special: 'ember' },
    spriteKey: 'pyrocat',
    evolutions: [
      { targetSpeciesId: 'flarelion', levelThreshold: 12, description: '용맹한 사자로 진화', previewSkills: ['fire_blast'] }
    ]
  },
  'flarelion': {
    id: 'flarelion',
    name: 'Flarelion',
    type: ElementType.FIRE,
    faction: FactionType.EMBER_CLAN,
    evolutionStage: 2,
    icon: '🦁',
    rarity: 'Uncommon',
    baseStats: { hp: 100, maxHp: 100, attack: 28, specialAttack: 32, defense: 15, skillResistance: 12, speed: 18 },
    skills: { basic: 'scratch', special: 'fire_blast' },
    spriteKey: 'flarelion'
  },
  'lunacat': {
    id: 'lunacat',
    name: 'Lunacat',
    type: ElementType.DARK,
    faction: FactionType.GLOOM_STALKERS,
    evolutionStage: 1,
    icon: '🐈',
    rarity: 'Rare',
    isSpecial: true,
    spawnConditions: [{ type: 'TIME_OF_DAY', value: 'NIGHT' }],
    baseStats: { hp: 70, maxHp: 70, attack: 18, specialAttack: 22, defense: 10, skillResistance: 12, speed: 25 },
    skills: { basic: 'scratch', special: 'dark_pulse' },
    spriteKey: 'lunacat'
  },
  'thunderhoof': {
    id: 'thunderhoof',
    name: 'Thunderhoof',
    type: ElementType.ELECTRIC,
    faction: FactionType.STORM_HERDERS,
    evolutionStage: 1,
    icon: '🦌',
    rarity: 'Legendary',
    isSpecial: true,
    spawnConditions: [{ type: 'TIME_OF_DAY', value: 'NIGHT' }],
    baseStats: { hp: 150, maxHp: 150, attack: 35, specialAttack: 40, defense: 20, skillResistance: 18, speed: 30 },
    skills: { basic: 'scratch', special: 'spark' },
    spriteKey: 'thunderhoof'
  },
  'droplet': {
    id: 'droplet',
    name: 'Droplet',
    type: ElementType.WATER,
    faction: FactionType.TIDE_WATCHERS,
    evolutionStage: 1,
    icon: '💧',
    rarity: 'Common',
    baseStats: { hp: 60, maxHp: 60, attack: 8, specialAttack: 12, defense: 12, skillResistance: 10, speed: 8 },
    skills: { basic: 'tackle', special: 'bubble' },
    evolutions: [
      { targetSpeciesId: 'mistlynx', levelThreshold: 14, description: '안개의 추적자로 진화', previewSkills: ['ice_shard'] }
    ]
  },
  'mistlynx': {
    id: 'mistlynx',
    name: 'Mistlynx',
    type: ElementType.WATER,
    faction: FactionType.TIDE_WATCHERS,
    evolutionStage: 2,
    icon: ' leopards',
    rarity: 'Uncommon',
    baseStats: { hp: 95, maxHp: 95, attack: 24, specialAttack: 28, defense: 18, skillResistance: 15, speed: 22 },
    skills: { basic: 'scratch', special: 'ice_shard' }
  },
  'puffle': {
    id: 'puffle',
    name: 'Puffle',
    type: ElementType.GRASS,
    faction: FactionType.GLADE_KEEPERS,
    evolutionStage: 1,
    icon: '🌿',
    rarity: 'Common',
    baseStats: { hp: 55, maxHp: 55, attack: 9, specialAttack: 11, defense: 14, skillResistance: 12, speed: 7 },
    skills: { basic: 'tackle', special: 'bubble' }
  }
};

// Merge Phase 5 Monsters
Object.assign(MONSTER_DATA, PHASE5_MONSTERS);

console.log(`Total monsters loaded: ${Object.keys(MONSTER_DATA).length}`);

