
import { Item, ElementType, FactionType } from '../domain/types';

export const ITEM_DATA: Record<string, Item> = {
  // --- Consumables ---
  'potion': {
    id: 'potion',
    name: 'Small Potion',
    description: 'Heals 20 HP.',
    icon: '🧪',
    category: 'Healing',
    power: 20,
    price: 50
  },
  'capture_orb': {
    id: 'capture_orb',
    name: 'Capture Orb',
    description: 'Used to capture wild monsters.',
    icon: '🧿',
    category: 'Capture',
    power: 1.0,
    price: 100
  },

  // --- Evolution Stones ---
  'sun_stone': {
    id: 'sun_stone',
    name: 'Sun Stone',
    description: 'Triggers solar evolutions.',
    icon: '☀️',
    category: 'Evolution',
    power: 0,
    price: 500,
    flavorText: 'A stone pulsing with the warmth of an eternal noon.'
  },
  'moon_stone': {
    id: 'moon_stone',
    name: 'Moon Stone',
    description: 'Triggers lunar evolutions.',
    icon: '🌙',
    category: 'Evolution',
    power: 0,
    price: 500,
    flavorText: 'Cold to the touch, it reflects a light that isn\'t there.'
  },

  // --- Weapons ---
  'blazing_fang': {
    id: 'blazing_fang',
    name: 'Blazing Fang',
    description: 'A dagger forged from Pyrocat embers.',
    icon: '🗡️',
    category: 'Weapon',
    tier: 'S',
    power: 0,
    price: 2000,
    stats: { attack: 25, speed: 10 },
    allowedTypes: [ElementType.FIRE],
    requiredMaterials: [
      { itemId: 'monster_core', quantity: 3 },
      { itemId: 'hardened_bone', quantity: 5 }
    ],
    flavorText: 'The blade still flickers with the spirit of a thousand hunts.'
  },
  'tidal_blade': {
    id: 'tidal_blade',
    name: 'Tidal Blade',
    description: 'A sword that flows like water.',
    icon: '⚔️',
    category: 'Weapon',
    tier: 'A',
    power: 0,
    price: 1200,
    stats: { attack: 18, defense: 5 },
    allowedTypes: [ElementType.WATER],
    requiredMaterials: [
      { itemId: 'monster_core', quantity: 2 },
      { itemId: 'mystic_powder', quantity: 4 }
    ],
    flavorText: 'Forged in the deepest trenches, it never dulls.'
  },
  'storm_scepter': {
    id: 'storm_scepter',
    name: 'Storm Scepter',
    description: 'Channels static energy.',
    icon: '🪄',
    category: 'Weapon',
    tier: 'B',
    power: 0,
    price: 800,
    stats: { attack: 12, speed: 15 },
    allowedTypes: [ElementType.ELECTRIC, ElementType.LIGHT],
    requiredMaterials: [
      { itemId: 'mystic_powder', quantity: 6 }
    ],
    flavorText: 'Handle with care. Or better yet, don\'t handle the tip.'
  },

  // --- Armor ---
  'iron_shell': {
    id: 'iron_shell',
    name: 'Iron Shell',
    description: 'Boasting incredible durability.',
    icon: '🛡️',
    category: 'Armor',
    tier: 'C',
    power: 0,
    price: 400,
    stats: { defense: 15, speed: -5 },
    flavorText: 'Heavy, clunky, but it gets the job done.'
  },
  'ember_plate': {
    id: 'ember_plate',
    name: 'Ember Plate',
    description: 'Hardened lava scales.',
    icon: '👕',
    category: 'Armor',
    tier: 'B',
    power: 0,
    price: 900,
    stats: { defense: 20, hp: 50 },
    allowedTypes: [ElementType.FIRE],
    requiredMaterials: [
      { itemId: 'hardened_bone', quantity: 8 }
    ],
    flavorText: 'Still warm to the touch. Improves circulation... maybe.'
  },
  'void_armor': {
    id: 'void_armor',
    name: 'Void Armor',
    description: 'Armor that swallows light.',
    icon: '🥋',
    category: 'Armor',
    tier: 'S',
    power: 0,
    price: 3000,
    stats: { defense: 35, hp: 100, speed: 5 },
    allowedTypes: [ElementType.DARK],
    requiredMaterials: [
      { itemId: 'monster_core', quantity: 5 },
      { itemId: 'spirit_essence', quantity: 2 }
    ],
    factionLock: FactionType.GLOOM_STALKERS,
    flavorText: 'Wearing it feels like being hugged by the abyss. A very protective hug.'
  },

  // --- Accessories ---
  'wind_pendant': {
    id: 'wind_pendant',
    name: 'Wind Pendant',
    description: 'Makes the wearer feel lighter.',
    icon: '📿',
    category: 'Accessory',
    tier: 'B',
    power: 0,
    price: 600,
    stats: { speed: 12 },
    flavorText: 'It hums a gentle tune whenever a breeze catches it.'
  },
  'heart_stone': {
    id: 'heart_stone',
    name: 'Heart Stone',
    description: 'Boosts vitality.',
    icon: '💎',
    category: 'Accessory',
    tier: 'C',
    power: 0,
    price: 350,
    stats: { hp: 40 },
    flavorText: 'A simple charm, popular among traveling tamers.'
  },

  // --- Materials (Drops) ---
  'monster_core': {
    id: 'monster_core',
    name: 'Monster Core',
    description: 'A dense sphere of elemental energy.',
    icon: '🔮',
    category: 'Material',
    power: 0,
    price: 250,
    flavorText: 'The beating heart of a fallen beast.'
  },
  'mystic_powder': {
    id: 'mystic_powder',
    name: 'Mystic Powder',
    description: 'Finely ground magical residue.',
    icon: '✨',
    category: 'Material',
    power: 0,
    price: 80,
    flavorText: 'Used in almost every high-end enchantment.'
  },
  'hardened_bone': {
    id: 'hardened_bone',
    name: 'Hardened Bone',
    description: 'Tougher than steel.',
    icon: '🦴',
    category: 'Material',
    power: 0,
    price: 40,
    flavorText: 'Perfect for structural reinforcement in gear.'
  },
  'spirit_essence': {
    id: 'spirit_essence',
    name: 'Spirit Essence',
    description: 'Ethereal mist trapped in a vial.',
    icon: '🌫️',
    category: 'Material',
    power: 0,
    price: 600,
    tier: 'S',
    flavorText: 'Extremely rare. You can hear whispers if you listen closely.'
  },
  'ancient_scrap': {
    id: 'ancient_scrap',
    name: 'Ancient Scrap',
    description: 'Metal from a bygone era.',
    icon: '🔩',
    category: 'Material',
    power: 0,
    price: 120,
    flavorText: 'The rust hides a strength that modern forges can\'t replicate.'
  },

  // --- RPG Expansion Items ---
  'wilder_egg_fire': {
    id: 'wilder_egg_fire',
    name: 'Fire Wilder Egg',
    description: 'A warm egg that pulses with heat.',
    icon: '🥚🔥',
    category: 'Egg',
    power: 0,
    price: 1000
  },
  'wilder_egg_water': {
    id: 'wilder_egg_water',
    name: 'Water Wilder Egg',
    description: 'A blue egg that feels cool to the touch.',
    icon: '🥚💧',
    category: 'Egg',
    power: 0,
    price: 1000
  },
  'basic_incubator': {
    id: 'basic_incubator',
    name: 'Portable Incubator',
    description: 'A device used to hatch Wilder eggs.',
    icon: '📟',
    category: 'Incubator',
    power: 0,
    price: 2000
  },
  'storage_license': {
    id: 'storage_license',
    name: 'Storage Expansion License',
    description: 'Increas Wilder storage by 10 slots.',
    icon: '📜',
    category: 'Misc',
    power: 0,
    price: 5000
  },
  'hatch_catalyst': {
    id: 'hatch_catalyst',
    name: 'Hatch Catalyst',
    description: 'Special item to accelerate hatching.',
    icon: '🧪',
    category: 'Material',
    power: 0,
    price: 300
  },
  // --- Phase 2: Data Chips ---
  'data_fire': {
    id: 'data_fire',
    name: 'Fire Data',
    description: 'Data extracted from fire monsters. Used for incubation.',
    icon: '🔥💾',
    category: 'Material',
    power: 0,
    price: 100
  },
  'data_water': {
    id: 'data_water',
    name: 'Water Data',
    description: 'Data extracted from water monsters. Used for incubation.',
    icon: '💧💾',
    category: 'Material',
    power: 0,
    price: 100
  },
  'data_grass': {
    id: 'data_grass',
    name: 'Grass Data',
    description: 'Data extracted from grass monsters. Used for incubation.',
    icon: '🌱💾',
    category: 'Material',
    power: 0,
    price: 100
  },
  // --- Phase 2: Mercenary Eggs ---
  'mercenary_egg_fire': {
    id: 'mercenary_egg_fire',
    name: 'Mercenary Fire Egg',
    description: 'A glowing egg containing a powerful Fire Wilder. Requires Fire Data.',
    icon: '🥚🔥✨',
    category: 'Egg',
    power: 0,
    price: 5000
  },
  'mercenary_egg_water': {
    id: 'mercenary_egg_water',
    name: 'Mercenary Water Egg',
    description: 'A shimmering egg containing a powerful Water Wilder. Requires Water Data.',
    icon: '🥚💧✨',
    category: 'Egg',
    power: 0,
    price: 5000
  },
  // --- Phase 3: Enhancement Items (Clones) ---
  'power_clone_d': {
    id: 'power_clone_d',
    name: 'Power Clone [D]',
    description: 'Enhances stats for levels 1-3. Success rate: High.',
    icon: '💾D',
    category: 'Material',
    power: 0,
    price: 500
  },
  'power_clone_c': {
    id: 'power_clone_c',
    name: 'Power Clone [C]',
    description: 'Enhances stats for levels 4-6. Success rate: Medium.',
    icon: '💾C',
    category: 'Material',
    power: 0,
    price: 1500
  },
  'backup_disk': {
    id: 'backup_disk',
    name: 'Backup Disk',
    description: 'Prevents stat decrease upon enhancement failure.',
    icon: '💿',
    category: 'Material',
    power: 0,
    price: 1000
  },
  // --- Phase 3: Equipment ---
  'attack_ring': {
    id: 'attack_ring',
    name: 'Attack Ring',
    description: 'Increases Attack power.',
    icon: '💍',
    category: 'Equipment',
    power: 10, // ATK Bonus
    stats: { attack: 10 },
    price: 2000
  },
  'health_necklace': {
    id: 'health_necklace',
    name: 'Health Necklace',
    description: 'Increases Max HP.',
    icon: '📿',
    category: 'Equipment',
    power: 0,
    stats: { hp: 500 },
    price: 2000
  },
  'speed_boots': {
    id: 'speed_boots',
    name: 'Speed Boots',
    description: 'Increases Speed.',
    icon: '👢',
    category: 'Equipment',
    power: 0,
    stats: { speed: 10 },
    price: 2000
  }
};
