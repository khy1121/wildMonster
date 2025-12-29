
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
