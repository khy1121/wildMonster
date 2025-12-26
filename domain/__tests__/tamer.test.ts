
import { describe, it, expect } from 'vitest';
import { addExpToTamer, getTamerProgression } from '../logic';
import { Tamer } from '../types';

describe('Tamer Progression', () => {
  it('identifies correct milestones for level 1', () => {
    const prog = getTamerProgression(1);
    expect(prog.partySlots).toBe(1);
    expect(prog.supportSkills).toContain('cheer');
  });

  it('unlocks 2nd slot and first aid at level 5', () => {
    const prog = getTamerProgression(5);
    expect(prog.partySlots).toBe(2);
    expect(prog.supportSkills).toContain('cheer');
    expect(prog.supportSkills).toContain('first_aid');
  });

  it('unlocks 4th slot at level 12', () => {
    const prog = getTamerProgression(12);
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
      inventory: [],
      unlockedPartySlots: 1,
      unlockedSupportSkills: ['cheer'],
      // Fix: Added missing collection property
      collection: []
    };

    const { tamer, leveledUp } = addExpToTamer(initialTamer, 100);
    expect(leveledUp).toBe(true);
    expect(tamer.level).toBe(2);
    expect(tamer.exp).toBe(50);
  });
});