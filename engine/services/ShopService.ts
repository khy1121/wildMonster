import { GameState, InventoryItem } from '../../domain/types';
import { addToInventory, consumeItem } from '../../domain/logic';
import { ITEM_DATA } from '../../data/items';
import { EQUIPMENT, EQUIPMENT_DATA } from '../../data/equipment';
import { getFactionDiscount } from '../../localization/strings';

/**
 * ShopService
 * 
 * Handles all shop-related logic including:
 * - Shop stock management and refresh
 * - Price calculations with faction discounts
 * - Item purchasing with validation
 * - Quest progress tracking for purchases
 * 
 * Extracted from GameStateManager to follow Single Responsibility Principle.
 */
export class ShopService {
    /**
     * Refresh the shop stock with random items
     * @param state Current game state (will be mutated)
     */
    refreshShopStock(state: GameState): void {
        const allItems = Object.keys(ITEM_DATA).filter(id => {
            const item = ITEM_DATA[id];
            return item.category !== 'Material';
        });

        // Add equipment items to shop pool
        const equipmentIds = EQUIPMENT_DATA.map(eq => eq.id);
        const shopPool = [...allItems, ...equipmentIds];

        const shuffled = [...shopPool].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 6);  // Increased from 4 to 6 to accommodate equipment

        // RPG Expansion: Ensure specialty items are in stock
        if (!selected.includes('storage_license')) selected.push('storage_license');
        if (!selected.includes('basic_incubator')) selected.push('basic_incubator');

        // Ensure at least 1-2 equipment items in stock
        const hasEquipment = selected.some(id => equipmentIds.includes(id));
        if (!hasEquipment && equipmentIds.length > 0) {
            // Replace a random item with equipment
            const randomEquipment = equipmentIds[Math.floor(Math.random() * equipmentIds.length)];
            selected[0] = randomEquipment;
        }

        const refreshInterval = 4 * 60 * 60 * 1000;
        state.shopStock = selected;
        state.shopNextRefresh = Date.now() + refreshInterval;
    }

    /**
     * Check if shop needs refresh and refresh if needed
     * @param state Current game state (will be mutated)
     * @returns true if shop was refreshed
     */
    checkShopRefresh(state: GameState): boolean {
        if (state.shopNextRefresh && Date.now() > state.shopNextRefresh) {
            this.refreshShopStock(state);
            return true;
        }
        return false;
    }

    /**
     * Calculate effective price with faction discounts
     * @param state Current game state
     * @param itemId Item ID
     * @returns Discounted price
     */
    getEffectivePrice(state: GameState, itemId: string): number {
        const item = ITEM_DATA[itemId] || EQUIPMENT[itemId];
        if (!item) return 0;

        let maxDiscount = 0;
        Object.values(state.reputation).forEach(val => {
            maxDiscount = Math.max(maxDiscount, getFactionDiscount(val));
        });
        return Math.floor(item.price * (1 - maxDiscount));
    }

    /**
     * Attempt to buy an item
     * @param state Current game state (will be mutated)
     * @param itemId Item ID to purchase
     * @param quantity Quantity to purchase
     * @returns true if purchase was successful
     */
    buyItem(state: GameState, itemId: string, quantity: number): boolean {
        const item = ITEM_DATA[itemId] || EQUIPMENT[itemId];
        if (!item) return false;

        // Check faction lock
        if (item.factionLock) {
            const rep = state.reputation[item.factionLock] || 0;
            if (rep < 100) return false;
        }

        // Check required materials
        if ('requiredMaterials' in item && item.requiredMaterials) {
            for (const mat of item.requiredMaterials) {
                const invMat = state.tamer.inventory.find(i => i.itemId === mat.itemId);
                if (!invMat || invMat.quantity < mat.quantity * quantity) return false;
            }
        }

        // Check gold
        const totalCost = this.getEffectivePrice(state, itemId) * quantity;
        if (state.tamer.gold < totalCost) return false;

        // Deduct gold
        state.tamer.gold -= totalCost;

        // Consume materials if needed
        if ('requiredMaterials' in item && item.requiredMaterials) {
            item.requiredMaterials.forEach(mat => {
                state.tamer.inventory = consumeItem(state.tamer.inventory, mat.itemId, mat.quantity * quantity);
            });
        }

        // Add item to inventory
        state.tamer.inventory = addToInventory(state.tamer.inventory, itemId, quantity);

        // Special handling for Storage Expansion
        if (itemId === 'storage_license') {
            state.tamer.unlockedStorageSlots += 10 * quantity;
            state.tamer.inventory = consumeItem(state.tamer.inventory, itemId, quantity);
        }

        // Track spend progress
        ['daily_spend_100', 'daily_spend_500', 'weekly_spend_5000'].forEach(qid => {
            const key = `quest_progress_${qid}`;
            state.flags[key] = ((state.flags[key] as number) || 0) + totalCost;
        });

        return true;
    }
}

// Export singleton instance for backward compatibility
export const shopService = new ShopService();
