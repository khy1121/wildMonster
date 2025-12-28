
import { describe, it, expect } from 'vitest';
import { transformMonster, checkEvolution, createMonsterInstance } from '../logic';
import { MONSTER_DATA } from '../../data/monsters';
import { GameState, FactionType } from '../types';

describe('Evolution System', () => {
  // Mock state with required items for Pyrocat evolutions
  const mockState: GameState = {
    version: 1,
    tamer: {
      name: 'Test',
      level: 1,
      exp: 0,
      party: [],
      storage: [],
      gold: 0,
      maxSpiritPoints: 100,
      currentSpiritPoints: 100,
      inventory: [
        { itemId: 'sun_stone', quantity: 1 },
        { itemId: 'moon_stone', quantity: 1 }
      ],
      unlockedPartySlots: 1,
      unlockedStorageSlots: 20,
      unlockedSupportSkills: [],
      // Fix: Added missing collection property
      collection: []
    },
    worldPosition: { x: 0, y: 0 },
    currentScene: 'BootScene',
    flags: {},
    gameTime: 1200,
    // Fix: Added missing completedQuests property
    completedQuests: [],
    // Fix: Added missing language property
    language: 'en',
    // Fix: Added missing reputation property to satisfy GameState interface
    reputation: {},
    activeQuests: [],
    pendingRewards: [],
    lastQuestRefresh: 0,
    incubators: []
  };

  it('correctly identifies evolution readiness', () => {
    const pyro = createMonsterInstance('pyrocat', 5);
    // Fixed: Passed mockState to satisfy signature
    expect(checkEvolution(pyro, mockState).length).toBe(0);

    // Fixed: Satisfied requiredNodeId for pyrocat evolutions (p_fire_special and p_dark_special)
    const readyPyro = {
      ...pyro,
      level: 12,
      unlockedNodes: ['p_fire_special']
    };
    // Fixed: Passed mockState to satisfy signature
    const options = checkEvolution(readyPyro, mockState);
    expect(options.length).toBe(1);
    expect(options[0].targetSpeciesId).toBe('flarelion');
  });

  it('fails evolution if missing required item', () => {
    const pyro = createMonsterInstance('pyrocat', 10);
    pyro.unlockedNodes = ['p_fire_special', 'p_dark_special'];

    // Create state with NO items
    const poorState = {
      ...mockState,
      tamer: { ...mockState.tamer, inventory: [] }
    };

    expect(checkEvolution(pyro, poorState).length).toBe(0);
  });

  it('fails evolution if missing required skill node', () => {
    const pyro = createMonsterInstance('pyrocat', 10);
    // Missing 'p_fire_special'
    pyro.unlockedNodes = [];

    expect(checkEvolution(pyro, mockState).length).toBe(0);
  });
});
