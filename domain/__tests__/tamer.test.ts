
import { describe, it, expect } from 'vitest';
import { addExpToTamer, getTamerProgression } from '../logic';
import { Tamer } from '../types';

describe('Tamer Progression', () => {
  it('identifies correct milestones for level 1', () => {
    const prog = getTamerProgression(1);
    expect(prog.partySlots).toBe(1);
    expect(prog.supportSkills.length).toBe(0);
  });

  it('unlocks 2nd slot at level 5', () => {
    const prog = getTamerProgression(5, 'leo');
    expect(prog.partySlots).toBe(2);
    expect(prog.supportSkills).toContain('leo_rage'); // Unlocks at level 3
  });

  it('unlocks 4th slot at level 20', () => {
    const prog = getTamerProgression(20);
    expect(prog.partySlots).toBe(4);
  });

  it('processes tamer exp and levels up correctly', () => {
    const initialTamer: Tamer = {
      name: 'Test',
      level: 1,
      exp: 450,
      party: [],
      storage: [],
      gold: 0,
      maxSpiritPoints: 100,
      currentSpiritPoints: 100,
      inventory: [],
      unlockedPartySlots: 1,
      unlockedStorageSlots: 20,
      unlockedSupportSkills: ['cheer'],
      collection: [],
      // Phase 4
      achievementProgress: {},
      unlockedAchievements: [],
      activeExpeditions: [],
      expeditionSlots: 1
    };

    const { tamer, leveledUp } = addExpToTamer(initialTamer, 100);
    expect(leveledUp).toBe(true);
    expect(tamer.level).toBe(2);
    expect(tamer.exp).toBe(50);
  });
});