
import { describe, it, expect } from 'vitest';
import { transformMonster, checkEvolution, createMonsterInstance } from '../logic';
import { MONSTER_DATA } from '../../data/monsters';
import { GameState } from '../types';

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
      inventory: [
        { itemId: 'sun_stone', quantity: 1 },
        { itemId: 'moon_stone', quantity: 1 }
      ],
      unlockedPartySlots: 1,
      unlockedSupportSkills: [],
      // Fix: Added missing collection property
      collection: []
    },
    worldPosition: { x: 0, y: 0 },
    currentScene: 'BootScene',
    flags: {},
    gameTime: 1200
  };

  it('correctly identifies evolution readiness', () => {
    const pyro = createMonsterInstance('pyrocat', 5);
    // Fixed: Passed mockState to satisfy signature
    expect(checkEvolution(pyro, mockState).length).toBe(0);

    // Fixed: Satisfied requiredNodeId for pyrocat evolutions (p_fire_special and p_dark_special)
    const readyPyro = { 
      ...pyro, 
      level: 10, 
      unlockedNodes: ['p_fire_special', 'p_dark_special'] 
    };
    // Fixed: Passed mockState to satisfy signature
    const options = checkEvolution(readyPyro, mockState);
    expect(options.length).toBe(2);
    expect(options[0].targetSpeciesId).toBe('flarelion');
    expect(options[1].targetSpeciesId).toBe('shadowcat');
  });

  it('transforms monster and retains stats/level scaling', () => {
    const pyro = createMonsterInstance('pyrocat', 10);
    const flarelion = transformMonster(pyro, 'flarelion');

    expect(flarelion.speciesId).toBe('flarelion');
    expect(flarelion.level).toBe(10);
    expect(flarelion.evolutionHistory).toContain('pyrocat');
    // Flarelion base HP is 100, Pyro is 50.
    expect(flarelion.currentStats.maxHp).toBeGreaterThan(pyro.currentStats.maxHp);
    expect(flarelion.currentHp).toBe(flarelion.currentStats.maxHp);
  });
});