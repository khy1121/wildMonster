
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameStateManager } from '../../engine/GameStateManager';
import { gameRNG } from '../RNG';
import { MonsterInstance } from '../types';

// Mock dependencies
vi.mock('phaser', () => ({ default: { Events: { EventEmitter: class { emit() { } on() { } off() { } } } } }));
vi.mock('../../save/SaveManager', () => ({ SaveManager: { load: () => ({ ok: false, reason: 'no_save' }), save: () => ({ ok: true }), clear: () => { } } }));
vi.stubGlobal('navigator', { language: 'en-US' });

describe('Enhancement System', () => {
    let gsm: GameStateManager;
    let monster: MonsterInstance;

    beforeEach(() => {
        gsm = new GameStateManager();
        gsm.startNewGame('leo', 'pyrocat');
        monster = gsm.getState().tamer.party[0];
        // Give items
        gsm.getState().tamer.inventory.push({ itemId: 'power_clone_d', quantity: 5 });
        gsm.getState().tamer.inventory.push({ itemId: 'power_clone_c', quantity: 5 });
        gsm.getState().tamer.inventory.push({ itemId: 'backup_disk', quantity: 5 });
    });

    it('successfully enhances a monster with Power Clone D (Level 0->1)', () => {
        // Mock RNG success
        vi.spyOn(gameRNG, 'chance').mockReturnValue(true);

        const initialStats = { ...monster.currentStats };
        const result = gsm.enhanceMonster(monster.uid, 'power_clone_d', false);

        expect(result.success).toBe(true);
        expect(monster.enhancementLevel).toBe(1);
        expect(monster.currentStats.attack).toBeGreaterThan(initialStats.attack);
        // Verify consumption
        const clone = gsm.getState().tamer.inventory.find(i => i.itemId === 'power_clone_d');
        expect(clone?.quantity).toBe(4);
    });

    it('fails to enhance if wrong Clone Tier is used', () => {
        monster.enhancementLevel = 4; // Requires Clone C
        const result = gsm.enhanceMonster(monster.uid, 'power_clone_d', false);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Requires Power Clone [C]');
    });

    it('handles failure with Backup Disk', () => {
        monster.enhancementLevel = 1;
        vi.spyOn(gameRNG, 'chance').mockReturnValue(false);

        const result = gsm.enhanceMonster(monster.uid, 'power_clone_d', true);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Protected by Backup Disk');
        expect(monster.enhancementLevel).toBe(1); // Unchanged

        // Verify consumption
        const backup = gsm.getState().tamer.inventory.find(i => i.itemId === 'backup_disk');
        expect(backup?.quantity).toBe(4);
    });
});
