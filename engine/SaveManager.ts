import { GameState } from '../domain/types';

export interface SaveMetadata {
    slotId: number;
    timestamp: number;
    playtime: number; // in seconds
    tamerName: string;
    tamerLevel: number;
    currentLocation: string;
    partySize: number;
    gold: number;
    version: string;
    checksum?: string;
}

export interface SaveSlot {
    metadata: SaveMetadata | null;
    data: GameState | null;
}

export interface SaveData {
    slots: SaveSlot[];
    lastPlayedSlot: number | null;
    autoSaveEnabled: boolean;
    autoSaveInterval: number; // in seconds
}

const SAVE_VERSION = '1.0.0';
const MAX_SLOTS = 3;
const AUTO_SAVE_INTERVAL = 300; // 5 minutes

export class SaveManager {
    private saveData: SaveData;
    private autoSaveTimer: NodeJS.Timeout | null = null;
    private playtimeStart: number = Date.now();

    constructor() {
        this.saveData = this.loadSaveData();
    }

    private loadSaveData(): SaveData {
        try {
            const saved = localStorage.getItem('wildMonster_saves');
            if (saved) {
                const parsed = JSON.parse(saved);
                return this.migrateSaveData(parsed);
            }
        } catch (error) {
            console.error('Failed to load save data:', error);
        }

        // Initialize empty save data
        return {
            slots: Array(MAX_SLOTS).fill(null).map(() => ({
                metadata: null,
                data: null
            })),
            lastPlayedSlot: null,
            autoSaveEnabled: true,
            autoSaveInterval: AUTO_SAVE_INTERVAL
        };
    }

    private migrateSaveData(data: any): SaveData {
        // Handle migration from old save format
        if (!data.slots) {
            // Old format - single save
            const oldState = localStorage.getItem('wildMonster_gameState');
            if (oldState) {
                try {
                    const state = JSON.parse(oldState);
                    return {
                        slots: [
                            {
                                metadata: this.createMetadata(0, state),
                                data: state
                            },
                            { metadata: null, data: null },
                            { metadata: null, data: null }
                        ],
                        lastPlayedSlot: 0,
                        autoSaveEnabled: true,
                        autoSaveInterval: AUTO_SAVE_INTERVAL
                    };
                } catch (e) {
                    console.error('Migration failed:', e);
                }
            }
        }
        return data;
    }

    private createMetadata(slotId: number, state: GameState): SaveMetadata {
        return {
            slotId,
            timestamp: Date.now(),
            playtime: Math.floor((Date.now() - this.playtimeStart) / 1000),
            tamerName: state.tamer.name,
            tamerLevel: state.tamer.level,
            currentLocation: state.currentRegion || 'Unknown',
            partySize: state.tamer.party.length,
            gold: state.tamer.gold,
            version: SAVE_VERSION,
            checksum: this.calculateChecksum(state)
        };
    }

    private calculateChecksum(state: GameState): string {
        // Simple checksum - hash of critical data
        const criticalData = {
            tamer: state.tamer.name,
            level: state.tamer.level,
            gold: state.tamer.gold,
            party: state.tamer.party.map(m => m.uid)
        };
        return btoa(JSON.stringify(criticalData));
    }

    private verifyChecksum(metadata: SaveMetadata, state: GameState): boolean {
        if (!metadata.checksum) return true; // Old saves without checksum
        const calculated = this.calculateChecksum(state);
        return calculated === metadata.checksum;
    }

    saveToSlot(slotId: number, state: GameState): boolean {
        if (slotId < 0 || slotId >= MAX_SLOTS) {
            console.error('Invalid slot ID:', slotId);
            return false;
        }

        try {
            const metadata = this.createMetadata(slotId, state);
            this.saveData.slots[slotId] = { metadata, data: state };
            this.saveData.lastPlayedSlot = slotId;

            localStorage.setItem('wildMonster_saves', JSON.stringify(this.saveData));
            console.log(`Saved to slot ${slotId}`);
            return true;
        } catch (error) {
            console.error('Save failed:', error);
            return false;
        }
    }

    loadFromSlot(slotId: number): GameState | null {
        if (slotId < 0 || slotId >= MAX_SLOTS) {
            console.error('Invalid slot ID:', slotId);
            return null;
        }

        const slot = this.saveData.slots[slotId];
        if (!slot.data || !slot.metadata) {
            return null;
        }

        // Verify checksum
        if (!this.verifyChecksum(slot.metadata, slot.data)) {
            console.error('Save data corrupted - checksum mismatch');
            return null;
        }

        this.saveData.lastPlayedSlot = slotId;
        this.playtimeStart = Date.now() - (slot.metadata.playtime * 1000);

        return slot.data;
    }

    deleteSlot(slotId: number): boolean {
        if (slotId < 0 || slotId >= MAX_SLOTS) {
            return false;
        }

        this.saveData.slots[slotId] = { metadata: null, data: null };

        if (this.saveData.lastPlayedSlot === slotId) {
            this.saveData.lastPlayedSlot = null;
        }

        localStorage.setItem('wildMonster_saves', JSON.stringify(this.saveData));
        return true;
    }

    getAllSlots(): SaveSlot[] {
        return this.saveData.slots;
    }

    getSlotMetadata(slotId: number): SaveMetadata | null {
        if (slotId < 0 || slotId >= MAX_SLOTS) {
            return null;
        }
        return this.saveData.slots[slotId].metadata;
    }

    // Auto-save functionality
    enableAutoSave(enabled: boolean) {
        this.saveData.autoSaveEnabled = enabled;
        localStorage.setItem('wildMonster_saves', JSON.stringify(this.saveData));

        if (enabled) {
            this.startAutoSave();
        } else {
            this.stopAutoSave();
        }
    }

    private startAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }

        this.autoSaveTimer = setInterval(() => {
            if (this.saveData.lastPlayedSlot !== null) {
                // Trigger auto-save event
                window.dispatchEvent(new CustomEvent('autoSave', {
                    detail: { slotId: this.saveData.lastPlayedSlot }
                }));
            }
        }, this.saveData.autoSaveInterval * 1000);
    }

    private stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    // Import/Export
    exportSlot(slotId: number): string | null {
        const slot = this.saveData.slots[slotId];
        if (!slot.data || !slot.metadata) {
            return null;
        }

        const exportData = {
            version: SAVE_VERSION,
            metadata: slot.metadata,
            data: slot.data
        };

        return btoa(JSON.stringify(exportData));
    }

    importSlot(slotId: number, encodedData: string): boolean {
        try {
            const decoded = JSON.parse(atob(encodedData));

            // Verify version compatibility
            if (decoded.version !== SAVE_VERSION) {
                console.warn('Save version mismatch');
                // Could add migration logic here
            }

            // Verify checksum
            if (!this.verifyChecksum(decoded.metadata, decoded.data)) {
                console.error('Imported save corrupted');
                return false;
            }

            this.saveData.slots[slotId] = {
                metadata: decoded.metadata,
                data: decoded.data
            };

            localStorage.setItem('wildMonster_saves', JSON.stringify(this.saveData));
            return true;
        } catch (error) {
            console.error('Import failed:', error);
            return false;
        }
    }

    getLastPlayedSlot(): number | null {
        return this.saveData.lastPlayedSlot;
    }

    isAutoSaveEnabled(): boolean {
        return this.saveData.autoSaveEnabled;
    }
}

// Singleton instance
export const saveManager = new SaveManager();
