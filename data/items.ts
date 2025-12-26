
import { Item } from '../domain/types';

export const ITEM_DATA: Record<string, Item> = {
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
  'sun_stone': {
    id: 'sun_stone',
    name: 'Sun Stone',
    description: 'A glowing stone that triggers solar evolutions.',
    icon: '☀️',
    category: 'Evolution',
    power: 0,
    price: 500
  },
  'moon_stone': {
    id: 'moon_stone',
    name: 'Moon Stone',
    description: 'A cold stone that triggers lunar evolutions.',
    icon: '🌙',
    category: 'Evolution',
    power: 0,
    price: 500
  }
};
