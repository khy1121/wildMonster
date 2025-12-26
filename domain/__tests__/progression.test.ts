
import { describe, it, expect } from 'vitest';
// Fixed: Using getTamerProgression instead of non-existent getTamerMaxPartySize
import { calculateStats, addExpToMonster, getTamerProgression, addExpToTamer } from '../logic';
import { Stats, MonsterInstance, ElementType, GameState, FactionType } from '../types';

describe('Progression Logic', () => {
  const baseStats: Stats = { hp: 10, maxHp: 10, attack: 5, defense: 5, speed: 5 };

  // Dummy state for functions requiring it
  const dummyState: GameState = {
    version: 1,
    tamer: {
      name: 'Test',
      level: 1,
      exp: 0,
      party: [],
      storage: [],
      gold: 0,
      inventory: [],
      unlockedPartySlots: 1,
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
    reputation: {
      [FactionType.EMBER_CLAN]: 0,
      [FactionType.TIDE_WATCHERS]: 0,
      [FactionType.STORM_HERDERS]: 0,
      [FactionType.GLOOM_STALKERS]: 0,
      [FactionType.GLADE_KEEPERS]: 0,
    }
  };

  it('calculates stats correctly based on level', () => {
    // Fixed: Passed required unlockedNodes and speciesId arguments
    const level1 = calculateStats(baseStats, 1, [], 'pyrocat');
    expect(level1.maxHp).toBe(10);

    // Fixed: Passed required unlockedNodes and speciesId arguments
    const level2 = calculateStats(baseStats, 2, [], 'pyrocat');
    // 1 + (2-1)*0.15 = 1.15. 10 * 1.15 = 11.5 -> floor 11
    expect(level2.maxHp).toBe(11);
  });

  it('levels up monster and resets HP', () => {
    // Fixed: Added missing 'skillPoints' and 'unlockedNodes' properties to satisfy MonsterInstance interface
    const monster: MonsterInstance = {
      uid: '1',
      speciesId: 'pyrocat',
      level: 1,
      exp: 50,
      currentHp: 5,
      // Fixed: Passed required unlockedNodes and speciesId arguments
      currentStats: calculateStats(baseStats, 1, [], 'pyrocat'),
      evolutionHistory: [],
      skillPoints: 0,
      unlockedNodes: []
    };

    // Fixed: Added dummyState argument to satisfy 3-argument signature
    const result = addExpToMonster(monster, 60, dummyState);
    expect(result.leveledUp).toBe(true);
    expect(result.monster.level).toBe(2);
    expect(result.monster.exp).toBe(10);
    // HP should heal to full on level up
    expect(result.monster.currentHp).toBe(result.monster.currentStats.maxHp);
  });

  it('unlocks party slots based on tamer level', () => {
    // Fixed: Using getTamerProgression(level).partySlots to fix missing export error
    expect(getTamerProgression(1).partySlots).toBe(1);
    expect(getTamerProgression(3).partySlots).toBe(2);
    expect(getTamerProgression(7).partySlots).toBe(3);
    expect(getTamerProgression(12).partySlots).toBe(4);
  });

  it('processes tamer experience and level up', () => {
    const tamer = { name: 'Test', level: 1, exp: 450, party: [], gold: 0 };
    const result = addExpToTamer(tamer as any, 100);
    expect(result.leveledUp).toBe(true);
    expect(result.tamer.level).toBe(2);
    expect(result.tamer.exp).toBe(50);
  });
});
