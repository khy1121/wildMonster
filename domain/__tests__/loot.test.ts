
import { describe, it, expect } from 'vitest';
import { rollLoot, addToInventory } from '../logic';
import { RNG } from '../RNG';
import { InventoryItem } from '../types';

describe('Loot System', () => {
  it('rolls loot deterministically with a seeded RNG', () => {
    const rng1 = new RNG(12345);
    const loot1 = rollLoot('pyrocat', rng1);

    const rng2 = new RNG(12345);
    const loot2 = rollLoot('pyrocat', rng2);

    expect(loot1).toEqual(loot2);
  });

  it('adds items to inventory correctly', () => {
    let inventory: InventoryItem[] = [];
    inventory = addToInventory(inventory, 'potion', 1);
    expect(inventory.length).toBe(1);
    expect(inventory[0].quantity).toBe(1);

    inventory = addToInventory(inventory, 'potion', 2);
    expect(inventory[0].quantity).toBe(3);

    inventory = addToInventory(inventory, 'orb', 1);
    expect(inventory.length).toBe(2);
  });
});
