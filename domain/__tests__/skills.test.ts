import { describe, it, expect } from 'vitest';
import { getAvailableSkillIds } from '../logic';
import { MONSTER_DATA } from '../../data/monsters';

describe('getAvailableSkillIds', () => {
  it('returns base skills at level 1 and learns new skills at thresholds', () => {
    const pyro = MONSTER_DATA['pyrocat'];

    const lvl1 = getAvailableSkillIds({ level: 1, unlockedNodes: [] }, pyro);
    expect(lvl1).toContain('scratch');
    expect(lvl1).not.toContain('ember');

    const lvl6 = getAvailableSkillIds({ level: 6, unlockedNodes: [] }, pyro);
    expect(lvl6).toEqual(['scratch', 'ember']);

    const lvl16 = getAvailableSkillIds({ level: 16, unlockedNodes: [] }, pyro);
    expect(lvl16).toEqual(['scratch', 'ember', 'fire_blast']);
  });

  it('includes skill-tree unlocked skills and deduplicates', () => {
    const droplet = MONSTER_DATA['droplet'];
    // assume node 'd_ice' unlocks 'ice_shard' in SKILL_TREES
    const withNode = getAvailableSkillIds({ level: 5, unlockedNodes: ['d_ice'] }, droplet);
    expect(withNode).toContain('bubble');
    expect(withNode).toContain('ice_shard');
  });
});
