
import { describe, it, expect } from 'vitest';
// Fixed: Using getTamerProgression instead of non-existent getTamerMaxPartySize
import { calculateStats, addExpToMonster, getTamerProgression, addExpToTamer, validateSpawn } from '../logic';
import { Stats, MonsterInstance, ElementType, GameState, FactionType } from '../types';

describe('Progression Logic', () => {
  const baseStats: Stats = { hp: 10, maxHp: 10, attack: 5, defense: 5, specialAttack: 5, skillResistance: 5, speed: 5 };

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
      maxSpiritPoints: 100,
      currentSpiritPoints: 100,
      inventory: [],
      unlockedPartySlots: 1,
      unlockedStorageSlots: 20,
      unlockedSupportSkills: [],
      collection: [],
      // Phase 4
      achievementProgress: {},
      unlockedAchievements: [],
      activeExpeditions: [],
      expeditionSlots: 1
    },
    worldPosition: { x: 0, y: 0 },
    currentScene: 'BootScene',
    flags: {},
    gameTime: 1200,
    completedQuests: [],
    language: 'en',
    reputation: {},
    activeQuests: [],
    pendingRewards: [],
    lastQuestRefresh: 0,
    incubators: [],
    // Phase 4
    dailyLogin: {
      lastLoginDate: '',
      consecutiveDays: 0,
      claimedToday: false
    },
    currentRegion: 'chronos_plaza',
    unlockedRegions: ['chronos_plaza'],
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
      unlockedNodes: [],
      enhancementLevel: 0
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
    expect(getTamerProgression(1).partySlots).toBe(1);
    expect(getTamerProgression(5).partySlots).toBe(2);
    expect(getTamerProgression(10).partySlots).toBe(3);
    expect(getTamerProgression(20).partySlots).toBe(4);
  });

  it('processes tamer experience and level up', () => {
    const tamer = { name: 'Test', level: 1, exp: 450, characterId: 'leo', party: [], gold: 0 };
    const result = addExpToTamer(tamer as any, 100);
    expect(result.leveledUp).toBe(true);
    expect(result.tamer.level).toBe(2);
    expect(result.tamer.exp).toBe(50);
  });

  it('validates monster spawn conditions', () => {
    const nightMonster = {
      spawnConditions: [{ type: 'TIME_OF_DAY', value: 'NIGHT' }]
    } as any;

    const dayState = { ...dummyState, gameTime: 1200 }; // 12:00
    const nightState = { ...dummyState, gameTime: 2200 }; // 22:00

    expect(validateSpawn(nightMonster, dayState)).toBe(false);
    expect(validateSpawn(nightMonster, nightState)).toBe(true);

    const levelMonster = {
      spawnConditions: [{ type: 'LEVEL_MIN', value: 10 }]
    } as any;

    expect(validateSpawn(levelMonster, dummyState)).toBe(false);
    const highLevelState = {
      ...dummyState,
      tamer: { ...dummyState.tamer, level: 15 }
    };
    expect(validateSpawn(levelMonster, highLevelState)).toBe(true);
  });
});
