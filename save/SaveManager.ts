
import { GameState } from '../domain/types';

const SAVE_KEY = 'eontamers_save_v1';
const CURRENT_VERSION = 1;

export const SaveManager = {
  save(state: GameState) {
    const saveData = {
      ...state,
      version: CURRENT_VERSION
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  },

  load(): GameState | null {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return null;
    try {
      const data = JSON.parse(saved);
      return this.migrate(data);
    } catch (e) {
      console.error("Failed to load save", e);
      return null;
    }
  },

  migrate(data: any): GameState {
    let state = data;
    
    // Future migrations would go here
    // if (state.version === 1) { ... upgrade to 2 ... }
    
    state.version = CURRENT_VERSION;
    return state as GameState;
  },

  clear() {
    localStorage.removeItem(SAVE_KEY);
  }
};
