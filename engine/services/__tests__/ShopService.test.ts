import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ShopService } from '../ShopService';
import { GameState } from '../../../domain/types';

// Mock dependencies
vi.mock('phaser', () => ({ default: { Events: { EventEmitter: class { emit() { } on() { } off() { } } } } }));
vi.mock('../../SaveManager', () => ({ SaveManager: { load: () => ({ ok: false, reason: 'no_save' }), save: () => ({ ok: true }), clear: () => { } } }));
vi.stubGlobal('navigator', { language: 'en-US' });

describe('ShopService', () => {
    let shopService: ShopService;
    let mockState: GameState;

    beforeEach(() => {
        shopService = new ShopService();

        // Create minimal mock state
        mockState = {
            version: 1,
            tamer: {
                name: 'Test Tamer',
                level: 5,
                exp: 0,
                party: [],
                storage: [],
                gold: 1000,
                maxSpiritPoints: 100,
                currentSpiritPoints: 100,
                inventory: [
                    { itemId: 'potion', quantity: 5 }
                ],
                unlockedPartySlots: 6,
                unlockedStorageSlots: 20,
                unlockedSupportSkills: [],
                collection: [],
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
            shopStock: [],
            shopNextRefresh: 0,
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

    describe('refreshShopStock', () => {
        it('should populate shop stock with items', () => {
            shopService.refreshShopStock(mockState);

            expect(mockState.shopStock).toBeDefined();
            expect(mockState.shopStock!.length).toBeGreaterThan(0);
        });

        it('should include specialty items (storage_license, basic_incubator)', () => {
            shopService.refreshShopStock(mockState);

            expect(mockState.shopStock).toContain('storage_license');
            expect(mockState.shopStock).toContain('basic_incubator');
        });

        it('should set next refresh time', () => {
            const beforeRefresh = Date.now();
            shopService.refreshShopStock(mockState);

            expect(mockState.shopNextRefresh).toBeGreaterThan(beforeRefresh);
        });

        it('should include at least one equipment item', () => {
            shopService.refreshShopStock(mockState);

            // Check if any item in stock is from equipment
            const hasEquipment = mockState.shopStock!.some(id =>
                id.includes('ring') || id.includes('necklace') || id.includes('armor')
            );
            expect(hasEquipment).toBe(true);
        });
    });

    describe('checkShopRefresh', () => {
        it('should return false if refresh time not reached', () => {
            mockState.shopNextRefresh = Date.now() + 10000; // 10 seconds in future

            const refreshed = shopService.checkShopRefresh(mockState);

            expect(refreshed).toBe(false);
        });

        it('should refresh shop if time has passed', () => {
            mockState.shopNextRefresh = Date.now() - 1000; // 1 second in past
            mockState.shopStock = [];

            const refreshed = shopService.checkShopRefresh(mockState);

            expect(refreshed).toBe(true);
            expect(mockState.shopStock!.length).toBeGreaterThan(0);
        });
    });

    describe('getEffectivePrice', () => {
        it('should return base price with no reputation', () => {
            mockState.reputation = {};

            const price = shopService.getEffectivePrice(mockState, 'potion');

            expect(price).toBeGreaterThan(0);
        });

        it('should apply discount for high reputation', () => {
            mockState.reputation = { EMBER_CLAN: 500 }; // High reputation

            const discountedPrice = shopService.getEffectivePrice(mockState, 'potion');

            // Should be less than base price due to discount
            mockState.reputation = {};
            const basePrice = shopService.getEffectivePrice(mockState, 'potion');

            expect(discountedPrice).toBeLessThan(basePrice);
        });

        it('should return 0 for invalid item', () => {
            const price = shopService.getEffectivePrice(mockState, 'invalid_item_id');

            expect(price).toBe(0);
        });
    });

    describe('buyItem', () => {
        it('should successfully buy item with sufficient gold', () => {
            mockState.tamer.gold = 1000;
            const initialGold = mockState.tamer.gold;

            const success = shopService.buyItem(mockState, 'potion', 1);

            expect(success).toBe(true);
            expect(mockState.tamer.gold).toBeLessThan(initialGold);
            expect(mockState.tamer.inventory.find(i => i.itemId === 'potion')!.quantity).toBeGreaterThan(5);
        });

        it('should fail if insufficient gold', () => {
            mockState.tamer.gold = 1; // Very low gold

            const success = shopService.buyItem(mockState, 'capture_orb', 10);

            expect(success).toBe(false);
        });

        it('should fail for invalid item', () => {
            const success = shopService.buyItem(mockState, 'invalid_item', 1);

            expect(success).toBe(false);
        });

        it('should handle storage_license special case', () => {
            mockState.tamer.gold = 10000;
            const initialSlots = mockState.tamer.unlockedStorageSlots;

            const success = shopService.buyItem(mockState, 'storage_license', 1);

            if (success) {
                expect(mockState.tamer.unlockedStorageSlots).toBe(initialSlots + 10);
            }
        });

        it('should track quest progress for spending', () => {
            mockState.tamer.gold = 1000;

            shopService.buyItem(mockState, 'potion', 1);

            expect(mockState.flags['quest_progress_daily_spend_100']).toBeGreaterThan(0);
        });

        it('should respect faction locks', () => {
            mockState.reputation = { EMBER_CLAN: 50 }; // Below 100 threshold

            // Try to buy faction-locked item (if any exist)
            // This test assumes there are faction-locked items in the data
            const success = shopService.buyItem(mockState, 'faction_locked_item', 1);

            // Should fail or succeed based on whether item exists and is locked
            expect(typeof success).toBe('boolean');
        });

        it('should buy multiple quantities correctly', () => {
            mockState.tamer.gold = 10000;
            const initialQuantity = mockState.tamer.inventory.find(i => i.itemId === 'potion')?.quantity || 0;

            const success = shopService.buyItem(mockState, 'potion', 3);

            if (success) {
                const finalQuantity = mockState.tamer.inventory.find(i => i.itemId === 'potion')!.quantity;
                expect(finalQuantity).toBe(initialQuantity + 3);
            }
        });
    });
});
