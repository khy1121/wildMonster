
import { GameState } from '../domain/types';

const SAVE_KEY = 'eontamers_save_v1';
const CURRENT_VERSION = 1;

// Type definitions for robust save/load
interface SaveEnvelope {
  version: number;
  savedAt: string; // ISO timestamp
  data: GameState;
}

export type SaveResult =
  | { ok: true }
  | { ok: false; reason: string; error?: unknown };

export type LoadResult =
  | { ok: true; state: GameState }
  | { ok: false; reason: string };

// Helper to check localStorage availability
function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

// Helper to detect quota exceeded errors
function isQuotaExceededError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      (error as any).code === 22 || // Legacy browsers
      (error as any).code === 1014 // Firefox
    );
  }
  return false;
}

export const SaveManager = {
  /**
   * Save game state to localStorage with error handling
   */
  save(state: GameState): SaveResult {
    // Check if localStorage is available
    if (!isStorageAvailable()) {
      console.warn('[SaveManager] localStorage is not available (privacy mode or disabled)');
      return { ok: false, reason: 'storage_unavailable' };
    }

    try {
      // Create envelope with metadata
      const envelope: SaveEnvelope = {
        version: CURRENT_VERSION,
        savedAt: new Date().toISOString(),
        data: state
      };

      const json = JSON.stringify(envelope);
      localStorage.setItem(SAVE_KEY, json);

      console.log('[SaveManager] Save successful');
      return { ok: true };
    } catch (error) {
      // Handle quota exceeded error
      if (isQuotaExceededError(error)) {
        console.warn('[SaveManager] Save failed: Storage quota exceeded. Please free up space in your browser.');
        return { ok: false, reason: 'quota_exceeded', error };
      }

      // Handle other errors
      console.warn('[SaveManager] Save failed:', error);
      return { ok: false, reason: 'unknown_error', error };
    }
  },

  /**
   * Load game state from localStorage with version validation
   */
  load(): LoadResult {
    // Check if localStorage is available
    if (!isStorageAvailable()) {
      console.warn('[SaveManager] localStorage is not available');
      return { ok: false, reason: 'storage_unavailable' };
    }

    try {
      const saved = localStorage.getItem(SAVE_KEY);

      if (!saved) {
        return { ok: false, reason: 'no_save' };
      }

      // Parse JSON
      let data: any;
      try {
        data = JSON.parse(saved);
      } catch (parseError) {
        console.warn('[SaveManager] Failed to parse save data (corrupted JSON):', parseError);
        return { ok: false, reason: 'corrupted_data' };
      }

      // Detect save format
      let state: GameState;

      if (data && typeof data === 'object' && 'version' in data && 'data' in data) {
        // New envelope format
        const envelope = data as SaveEnvelope;

        // Validate version
        if (envelope.version !== CURRENT_VERSION) {
          console.warn(`[SaveManager] Save version mismatch: expected ${CURRENT_VERSION}, got ${envelope.version}`);
          return { ok: false, reason: 'version_mismatch' };
        }

        state = envelope.data;
      } else if (data && typeof data === 'object' && 'version' in data) {
        // Legacy format (has version but no envelope)
        console.log('[SaveManager] Loading legacy save format (v1 without envelope)');
        state = this.migrate(data);
      } else {
        // Ancient format (no version field)
        console.log('[SaveManager] Loading ancient save format (pre-versioning)');
        state = this.migrate(data);
      }

      // Validate state has required fields
      if (!state || !state.tamer || !state.worldPosition) {
        console.warn('[SaveManager] Save data is missing required fields');
        return { ok: false, reason: 'invalid_data' };
      }

      console.log('[SaveManager] Load successful');
      return { ok: true, state };
    } catch (error) {
      console.warn('[SaveManager] Load failed:', error);
      return { ok: false, reason: 'unknown_error' };
    }
  },

  /**
   * Migrate legacy save data to current format
   */
  migrate(data: any): GameState {
    let state = data;

    // Future migrations would go here
    // if (state.version === 1) { ... upgrade to 2 ... }

    state.version = CURRENT_VERSION;
    return state as GameState;
  },

  /**
   * Clear save data
   */
  clear(): void {
    try {
      localStorage.removeItem(SAVE_KEY);
      console.log('[SaveManager] Save cleared');
    } catch (error) {
      console.warn('[SaveManager] Failed to clear save:', error);
    }
  },

  /**
   * Check if a save exists
   */
  hasSave(): boolean {
    if (!isStorageAvailable()) return false;
    return localStorage.getItem(SAVE_KEY) !== null;
  }
};
