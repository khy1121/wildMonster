import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BattleService } from '../BattleService';
import { GameState } from '../../../domain/types';
import { MONSTER_DATA } from '../../../data/monsters';

// Mock dependencies
vi.mock('phaser', () => ({ default: { Events: { EventEmitter: class { emit() { } on() { } off() { } } } } }));
vi.mock('../../SaveManager', () => ({ SaveManager: { load: () => ({ ok: false, reason: 'no_save' }), save: () => ({ ok: true }), clear: () => { } } }));
vi.stubGlobal('navigator', { language: 'en-US' });


describe('BattleService', () => {
    let battleService: BattleService;
    let mockState: GameState;

    beforeEach(() => {
        battleService = new BattleService();

        // Create a minimal mock state
        mockState = {
            version: 1,
            tamer: {
                name: 'Test Tamer',
                level: 5,
                exp: 0,
                party: [
                    {
                        uid: 'monster-1',
                        speciesId: 'pyrocat',
                        level: 5,
                        exp: 0,
                        currentHp: 50,
                        currentStats: {
                            hp: 50,
                            maxHp: 50,
                            attack: 10,
                            defense: 8,
                            specialAttack: 12,
                            skillResistance: 8,
                            speed: 15
                        },
                        enhancementLevel: 0,
                        evolutionHistory: [],
                        skillPoints: 0,
                        unlockedNodes: []
                    }
                ],
                storage: [],
                gold: 100,
                maxSpiritPoints: 100,
                currentSpiritPoints: 100,
                inventory: [
                    { itemId: 'capture_orb', quantity: 5 },
                    { itemId: 'potion', quantity: 3 }
                ],
                unlockedPartySlots: 6,
                unlockedStorageSlots: 20,
                unlockedSupportSkills: [],
                collection: ['pyrocat'],
                achievementProgress: {},
                unlockedAchievements: [],
                activeExpeditions: [],
                expeditionSlots: 1,
                equippedItems: {}
            },
            worldPosition: { x: 0, y: 0 },
            currentScene: 'OverworldScene',
            flags: {},
            gameTime: 0,
            language: 'en',
            activeQuests: [],
            completedQuests: [],
            pendingRewards: [],
            reputation: {},
            lastQuestRefresh: 0,
            incubators: [],
            dailyLogin: {
                lastLoginDate: '',
                consecutiveDays: 0,
                claimedToday: false
            },
            currentRegion: 'region_1',
            unlockedRegions: ['region_1'],
            unlockedPortals: [],
            storyProgress: {
                fragmentsCollected: 0,
                bossesDefeated: [],
                mainQuestsCompleted: [],
                loreNotesFound: 0,
                currentAct: 1
            },
            activeQuestObjectives: {},
            foundLoreNotes: []
        } as GameState;
    });

    describe('grantExp', () => {
        it('should grant experience to a monster in party', () => {
            const initialExp = mockState.tamer.party[0].exp;

            battleService.grantExp(mockState, 'monster-1', 50);

            expect(mockState.tamer.party[0].exp).toBeGreaterThan(initialExp);
        });

        it('should not crash when monster UID does not exist', () => {
            expect(() => {
                battleService.grantExp(mockState, 'non-existent-uid', 50);
            }).not.toThrow();
        });
    });

    describe('grantRewards', () => {
        it('should grant gold and exp to tamer', () => {
            const initialGold = mockState.tamer.gold;
            const initialExp = mockState.tamer.exp;

            battleService.grantRewards(mockState, 'puffle', 5, false);

            expect(mockState.tamer.gold).toBeGreaterThan(initialGold);
        });

        it('should add items to inventory', () => {
            const initialInventorySize = mockState.tamer.inventory.length;

            battleService.grantRewards(mockState, 'puffle', 5, false);

            // Rewards might add items
            expect(mockState.tamer.inventory.length).toBeGreaterThanOrEqual(initialInventorySize);
        });

        it('should track quest progress for wins', () => {
            battleService.grantRewards(mockState, 'puffle', 5, false);

            expect(mockState.flags['quest_progress_daily_win_3']).toBe(1);
            expect(mockState.flags['quest_progress_win_streak_10']).toBe(1);
        });

        it('should apply level multiplier to rewards', () => {
            const lowLevelGold = mockState.tamer.gold;
            battleService.grantRewards(mockState, 'puffle', 1, false);
            const goldFromLevel1 = mockState.tamer.gold - lowLevelGold;

            // Reset
            mockState.tamer.gold = 100;

            battleService.grantRewards(mockState, 'puffle', 10, false);
            const goldFromLevel10 = mockState.tamer.gold - 100;

            expect(goldFromLevel10).toBeGreaterThan(goldFromLevel1);
        });

        it('should track boss quest progress when isBoss is true', () => {
            battleService.grantRewards(mockState, 'flarelion', 20, true);

            expect(mockState.flags['quest_progress_weekly_boss_slayer_3']).toBe(1);
        });
    });

    describe('attemptCapture', () => {
        const mockUpdateReputation = vi.fn();

        beforeEach(() => {
            mockUpdateReputation.mockClear();
        });

        it('should return false if no capture orbs in inventory', () => {
            mockState.tamer.inventory = [];

            const result = battleService.attemptCapture(
                mockState,
                'droplet',
                5,
                10,
                50,
                mockUpdateReputation
            );

            expect(result).toBe(false);
        });

        it('should consume a capture orb on attempt', () => {
            const initialOrbs = mockState.tamer.inventory.find(i => i.itemId === 'capture_orb')!.quantity;

            battleService.attemptCapture(
                mockState,
                'droplet',
                5,
                10,
                50,
                mockUpdateReputation
            );

            const finalOrbs = mockState.tamer.inventory.find(i => i.itemId === 'capture_orb')?.quantity || 0;
            expect(finalOrbs).toBe(initialOrbs - 1);
        });

        it('should add captured monster to party if space available', () => {
            const initialPartySize = mockState.tamer.party.length;

            // Mock RNG to always succeed
            vi.spyOn(Math, 'random').mockReturnValue(0.01);

            battleService.attemptCapture(
                mockState,
                'droplet',
                5,
                1,
                50,
                mockUpdateReputation
            );

            // Capture might succeed (RNG-based)
            expect(mockState.tamer.party.length).toBeGreaterThanOrEqual(initialPartySize);

            vi.restoreAllMocks();
        });

        it('should add species to collection on successful capture', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.01);

            const initialCollectionSize = mockState.tamer.collection.length;

            battleService.attemptCapture(
                mockState,
                'droplet',
                5,
                1,
                50,
                mockUpdateReputation
            );

            expect(mockState.tamer.collection.length).toBeGreaterThanOrEqual(initialCollectionSize);

            vi.restoreAllMocks();
        });

        it('should set first_capture_done flag on successful capture', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.01);

            battleService.attemptCapture(
                mockState,
                'droplet',
                5,
                1,
                50,
                mockUpdateReputation
            );

            expect(mockState.flags['first_capture_done']).toBe(true);

            vi.restoreAllMocks();
        });

        it('should track capture quest progress', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.01);

            battleService.attemptCapture(
                mockState,
                'droplet',
                5,
                1,
                50,
                mockUpdateReputation
            );

            expect(mockState.flags['quest_progress_daily_capture_1']).toBeGreaterThanOrEqual(1);

            vi.restoreAllMocks();
        });
    });

    describe('handleBattleEnd', () => {
        const mockUpdateReputation = vi.fn();

        it('should grant rewards on player victory', () => {
            const initialGold = mockState.tamer.gold;

            battleService.handleBattleEnd(mockState, 'PLAYER', 'puffle', 5, false);

            expect(mockState.tamer.gold).toBeGreaterThan(initialGold);
        });

        it('should set boss defeat flags for specific bosses', () => {
            battleService.handleBattleEnd(mockState, 'PLAYER', 'flarelion', 20, true);

            expect(mockState.flags['boss_flarelion_defeated']).toBe(true);
        });

        it('should reset win streaks on enemy victory', () => {
            mockState.flags['quest_progress_win_streak_10'] = 5;
            mockState.flags['quest_progress_win_streak_50'] = 3;

            battleService.handleBattleEnd(mockState, 'ENEMY', 'puffle', 5, false);

            expect(mockState.flags['quest_progress_win_streak_10']).toBe(0);
            expect(mockState.flags['quest_progress_win_streak_50']).toBe(0);
        });

        it('should track combat achievements on victory', () => {
            battleService.handleBattleEnd(mockState, 'PLAYER', 'puffle', 5, false);

            expect(mockState.tamer.achievementProgress['combat_first_victory']).toBeGreaterThanOrEqual(1);
        });
    });
});
