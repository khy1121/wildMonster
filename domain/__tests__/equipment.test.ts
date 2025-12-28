
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameStateManager } from '../../engine/GameStateManager';
import { MonsterInstance } from '../types';

// Mock dependencies
vi.mock('phaser', () => ({ default: { Events: { EventEmitter: class { emit() { } on() { } off() { } } } } }));
vi.mock('../../save/SaveManager', () => ({ SaveManager: { load: () => ({ ok: false, reason: 'no_save' }), save: () => ({ ok: true }), clear: () => { } } }));
vi.stubGlobal('navigator', { language: 'en-US' });

describe('Held Item System', () => {
    let gsm: GameStateManager;
    let monster: MonsterInstance;

    beforeEach(() => {
        gsm = new GameStateManager();
        gsm.startNewGame('leo', 'pyrocat'); // using valid char ID
        monster = gsm.getState().tamer.party[0];
        // Give items
        gsm.getState().tamer.inventory.push({ itemId: 'attack_ring', quantity: 2 });
        gsm.getState().tamer.inventory.push({ itemId: 'health_necklace', quantity: 1 });
        gsm.getState().tamer.inventory.push({ itemId: 'potion', quantity: 5 }); // Not equipment
    });

    it('equips an item and boosts stats', () => {
        const initialAtk = monster.currentStats.attack;
        const result = gsm.equipItem(monster.uid, 'attack_ring'); // +10 ATK

        expect(result.success).toBe(true);
        expect(monster.heldItemId).toBe('attack_ring');
        expect(monster.currentStats.attack).toBe(initialAtk + 10);

        // Inventory check
        const ring = gsm.getState().tamer.inventory.find(i => i.itemId === 'attack_ring');
        expect(ring?.quantity).toBe(1);
    });

    it('unequips an item and reverts stats', () => {
        const initialAtk = monster.currentStats.attack;
        gsm.equipItem(monster.uid, 'attack_ring');

        const result = gsm.unequipItem(monster.uid);
        expect(result.success).toBe(true);
        expect(monster.heldItemId).toBeUndefined();
        expect(monster.currentStats.attack).toBe(initialAtk);

        // Inventory check
        const ring = gsm.getState().tamer.inventory.find(i => i.itemId === 'attack_ring');
        expect(ring?.quantity).toBe(2);
    });

    it('swaps items automatically', () => {
        const initialHp = monster.currentStats.hp;
        gsm.equipItem(monster.uid, 'attack_ring');

        // Swap to Health Necklace (+500 HP)
        const result = gsm.equipItem(monster.uid, 'health_necklace');
        expect(result.success).toBe(true);
        expect(monster.heldItemId).toBe('health_necklace');
        expect(monster.currentStats.hp).toBe(initialHp + 500);

        // Check Inventory: Ring should be back (2), Necklace used (0)
        const ring = gsm.getState().tamer.inventory.find(i => i.itemId === 'attack_ring');
        const necklace = gsm.getState().tamer.inventory.find(i => i.itemId === 'health_necklace');
        expect(ring?.quantity).toBe(2);
        expect(necklace).toBeUndefined(); // or quantity 0 if filtered?
    });

    it('fails if item is not equipment', () => {
        const result = gsm.equipItem(monster.uid, 'potion');
        expect(result.success).toBe(false);
        expect(result.message).toContain('Not an equipment');
    });
});
