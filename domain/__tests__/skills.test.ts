import { describe, it, expect } from 'vitest';
import { getAvailableSkillIds } from '../logic';
import { MONSTER_DATA } from '../../data/monsters';

describe('getAvailableSkillIds', () => {
  it('returns base skills at level 1 and learns new skills at thresholds', () => {
    const pyro = MONSTER_DATA['pyrocat'];

    const lvl1 = getAvailableSkillIds({ level: 1, unlockedNodes: [] }, pyro);
    expect(lvl1).toContain('scratch');
    expect(lvl1).not.toContain('ember');

    const lvl5 = getAvailableSkillIds({ level: 5, unlockedNodes: [] }, pyro);
    expect(lvl5).toEqual(['scratch', 'ember']);

    const flarelion = MONSTER_DATA['flarelion'];
    const lvl15 = getAvailableSkillIds({ level: 15, unlockedNodes: [] }, flarelion);
    expect(lvl15).toEqual(['scratch', 'fire_blast']);
  });

  it('includes skill-tree unlocked skills and deduplicates', () => {
    const droplet = MONSTER_DATA['droplet'];
    // assume node 'd_ice' unlocks 'ice_shard' in SKILL_TREES
    const withNode = getAvailableSkillIds({ level: 5, unlockedNodes: ['d_ice'] }, droplet);
    expect(withNode).toContain('bubble');
    expect(withNode).toContain('ice_shard');
  });
});
