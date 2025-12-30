import { describe, it, expect, beforeEach, vi } from 'vitest';

// Fix: Mock phaser to avoid DOM dependency in Node environment
vi.mock('phaser', () => {
    return {
        default: {
            Events: {
                EventEmitter: class {
                    emit() { }
                    on() { }
                    off() { }
                }
            }
        }
    };
});

// Mock SaveManager to avoid localStorage dependency
vi.mock('../../save/SaveManager', () => {
    return {
        SaveManager: {
            load: () => ({ ok: false, reason: 'no_save' }),
            save: () => ({ ok: true }),
            clear: () => { }
        }
    };
});

// Mock Navigator for language detection
vi.stubGlobal('navigator', { language: 'en-US' });

import { GameStateManager } from '../../engine/GameStateManager';
import { MONSTER_DATA } from '../../data/monsters';
import { gameRNG } from '../RNG';

describe('GameStateManager', () => {
    let gsm: GameStateManager;

    beforeEach(() => {
        // Clear localStorage or mock SaveManager if needed
        gsm = new GameStateManager();
        // Initialize with a clean state
        gsm.startNewGame('leo', 'pyrocat');
    });

    it('attempts capture and succeeds based on RNG', () => {
        // Mock RNG to always succeed
        vi.spyOn(gameRNG, 'chance').mockReturnValue(true);

        const initialPartyCount = gsm.getState().tamer.party.length;
        const success = gsm.attemptCapture('droplet', 5, 10, 100);

        expect(success).toBe(true);
        expect(gsm.getState().tamer.party.length).toBe(initialPartyCount + 1);
        expect(gsm.getState().tamer.collection).toContain('droplet');
        expect(gsm.getState().flags['first_capture_done']).toBe(true);
    });

    it('fails capture when RNG returns false', () => {
        vi.spyOn(gameRNG, 'chance').mockReturnValue(false);

        const initialPartyCount = gsm.getState().tamer.party.length;
        const success = gsm.attemptCapture('droplet', 5, 10, 100);

        expect(success).toBe(false);
        expect(gsm.getState().tamer.party.length).toBe(initialPartyCount);
    });

    it('grants rewards correctly after battle', () => {
        const initialGold = gsm.getState().tamer.gold;
        const initialExp = gsm.getState().tamer.exp;

        // rollLoot for droplet gives gold/exp. We mock RNG to get predictable values.
        vi.spyOn(gameRNG, 'range').mockReturnValue(10); // gold
        vi.spyOn(gameRNG, 'chance').mockReturnValue(false); // items

        // grantRewards(enemySpeciesId, enemyLevel, isBoss)
        // level 1: mult = 1. rewards.gold = 10 * 1 = 10. rewards.exp = 25 * 1 = 25.
        gsm.grantRewards('droplet', 1, false);

        expect(gsm.getState().tamer.gold).toBe(initialGold + 10);
        expect(gsm.getState().tamer.exp).toBeGreaterThan(initialExp);
    });

    it('tracks quest progress for captures', () => {
        vi.spyOn(gameRNG, 'chance').mockReturnValue(true);

        // reset or ensure flag is 0
        gsm.getState().flags['quest_progress_daily_capture_1'] = 0;

        gsm.attemptCapture('droplet', 5, 50, 100);

        expect(gsm.getState().flags['quest_progress_daily_capture_1']).toBe(1);
    });

    it('resets win streak on battle defeat', () => {
        gsm.getState().flags['quest_progress_win_streak_10'] = 5;

        // handleBattleEnd(winner, enemySpeciesId, enemyLevel, isBoss)
        gsm.handleBattleEnd('ENEMY', 'droplet', 5, false);

        expect(gsm.getState().flags['quest_progress_win_streak_10']).toBe(0);
    });
});
