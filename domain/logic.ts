
import { Stats, MonsterSpecies, MonsterInstance, Tamer, BattleRewards, InventoryItem, Rarity, EvolutionOption, GameState, SpawnCondition, ElementType } from './types';
import { MONSTER_DATA } from '../data/monsters';
import { ITEM_DATA } from '../data/items';
import { SKILL_TREES } from '../data/skills';
import { TAMER_MILESTONES } from '../data/tamer';
import { RNG } from './RNG';

export function calculateStats(base: Stats, level: number, unlockedNodes: string[], speciesId: string): Stats {
  const growthFactor = 1 + (level - 1) * 0.15;
  const stats = {
    hp: Math.floor(base.hp * growthFactor),
    maxHp: Math.floor(base.maxHp * growthFactor),
    attack: Math.floor(base.attack * growthFactor),
    defense: Math.floor(base.defense * growthFactor),
    specialAttack: Math.floor(base.specialAttack * growthFactor),
    skillResistance: Math.floor(base.skillResistance * growthFactor),
    speed: Math.floor(base.speed * growthFactor),
  };

  const tree = SKILL_TREES[speciesId];
  if (tree) {
    unlockedNodes.forEach(nodeId => {
      const node = tree.nodes.find(n => n.id === nodeId);
      if (node && node.effect.type === 'stat') {
        const mod = node.effect.value as Partial<Stats>;
        if (mod.attack) stats.attack += mod.attack;
        if (mod.defense) stats.defense += mod.defense;
        if (mod.specialAttack) stats.specialAttack += mod.specialAttack;
        if (mod.skillResistance) stats.skillResistance += mod.skillResistance;
        if (mod.speed) stats.speed += mod.speed;
        if (mod.maxHp) {
          stats.maxHp += mod.maxHp;
          stats.hp += mod.maxHp;
        }
      }
    });
  }

  return stats;
}

export function validateSpawn(species: MonsterSpecies | undefined, state: GameState): boolean {
  if (!species) return false;
  if (!species.spawnConditions) return true;

  return species.spawnConditions.every(cond => {
    switch (cond.type) {
      case 'LEVEL_MIN':
        return state.tamer.level >= (cond.value as number);
      case 'QUEST_FLAG':
        return !!state.flags[cond.value as string];
      case 'TIME_OF_DAY':
        const hour = state.gameTime / 100;
        if (cond.value === 'NIGHT') return hour < 6 || hour > 18;
        if (cond.value === 'DAY') return hour >= 6 && hour <= 18;
        return true;
      default:
        return true;
    }
  });
}

export function checkEvolution(monster: MonsterInstance, state: GameState): EvolutionOption[] {
  const species = MONSTER_DATA[monster.speciesId];
  if (!species || !species.evolutions) return [];

  return species.evolutions.filter(ev => {
    const levelMet = monster.level >= ev.levelThreshold;
    const nodeMet = ev.requiredNodeId ? monster.unlockedNodes.includes(ev.requiredNodeId) : true;
    const itemMet = ev.requiredItemId ? state.tamer.inventory.some(i => i.itemId === ev.requiredItemId && i.quantity > 0) : true;
    const flagMet = ev.requiredFlag ? !!state.flags[ev.requiredFlag] : true;

    return levelMet && nodeMet && itemMet && flagMet;
  });
}

export function transformMonster(monster: MonsterInstance, targetSpeciesId: string): MonsterInstance {
  const targetSpecies = MONSTER_DATA[targetSpeciesId];
  if (!targetSpecies) return monster;

  const partialMonster = {
    ...monster,
    speciesId: targetSpeciesId,
    evolutionHistory: [...monster.evolutionHistory, monster.speciesId],
    unlockedNodes: []
  };
  const newStats = recalculateMonsterStats(partialMonster);

  return {
    ...partialMonster,
    currentStats: newStats,
    currentHp: newStats.maxHp,
  };
}

export function addExpToMonster(monster: MonsterInstance, amount: number, state: GameState): { monster: MonsterInstance; leveledUp: boolean } {
  let newExp = monster.exp + amount;
  let newLevel = monster.level;
  let leveledUp = false;
  let newSkillPoints = monster.skillPoints;
  const expToLevel = 100;

  while (newExp >= expToLevel && newLevel < 80) {
    newExp -= expToLevel;
    newLevel++;
    leveledUp = true;
    if (newLevel % 2 === 0) newSkillPoints++;
  }

  if (newLevel >= 80) {
    newLevel = 80;
    newExp = 0;
  }

  const species = MONSTER_DATA[monster.speciesId];
  // Create temporary updated monster to calc stats
  const tempMonster = {
    ...monster,
    level: newLevel,
    exp: newExp,
    skillPoints: newSkillPoints,
    // unlockedNodes same as monster
  };
  const newStats = recalculateMonsterStats(tempMonster);

  return {
    leveledUp,
    monster: {
      ...tempMonster,
      currentStats: newStats,
      currentHp: leveledUp ? newStats.maxHp : Math.min(monster.currentHp + (newStats.maxHp - monster.currentStats.maxHp), newStats.maxHp)
    }
  };
}

export function unlockNode(monster: MonsterInstance, nodeId: string): MonsterInstance {
  const tree = SKILL_TREES[monster.speciesId];
  if (!tree) return monster;

  const node = tree.nodes.find(n => n.id === nodeId);
  if (!node || monster.skillPoints < node.cost || monster.unlockedNodes.includes(nodeId)) return monster;

  const prereqsMet = node.prerequisites.every(p => monster.unlockedNodes.includes(p));
  if (!prereqsMet) return monster;

  const newUnlockedNodes = [...monster.unlockedNodes, nodeId];
  // Create partial updated monster
  const tempMonster = {
    ...monster,
    skillPoints: monster.skillPoints - node.cost,
    unlockedNodes: newUnlockedNodes
  };
  const newStats = recalculateMonsterStats(tempMonster);

  return {
    ...tempMonster,
    currentStats: newStats
  };
}

export function getTamerProgression(level: number, characterId?: string): { partySlots: number; supportSkills: string[] } {
  let partySlots = 1;
  const supportSkills: string[] = [];

  TAMER_MILESTONES.forEach(m => {
    if (level >= m.level) {
      if (m.partySlots) partySlots = m.partySlots;
      if (m.unlockSkill) {
        if (typeof m.unlockSkill === 'string') {
          supportSkills.push(m.unlockSkill);
        } else if (characterId && (m.unlockSkill as Record<string, string>)[characterId]) {
          supportSkills.push((m.unlockSkill as Record<string, string>)[characterId]);
        }
      }
    }
  });

  return { partySlots, supportSkills };
}

export function addExpToTamer(tamer: Tamer, amount: number): { tamer: Tamer; leveledUp: boolean } {
  let newExp = tamer.exp + amount;
  let newLevel = tamer.level;
  let leveledUp = false;
  const expToLevel = 500;

  while (newExp >= expToLevel && newLevel < 50) {
    newExp -= expToLevel;
    newLevel++;
    leveledUp = true;
  }

  if (newLevel >= 50) {
    newLevel = 50;
    newExp = 0;
  }

  const progression = getTamerProgression(newLevel, tamer.characterId);

  return {
    leveledUp,
    tamer: {
      ...tamer,
      level: newLevel,
      exp: newExp,
      unlockedPartySlots: progression.partySlots,
      unlockedSupportSkills: progression.supportSkills
    }
  };
}

export function calculateCaptureChance(speciesId: string, currentHp: number, maxHp: number): number {
  const species = MONSTER_DATA[speciesId];
  if (!species) return 0;
  const rarityMultipliers: Record<Rarity, number> = { 'Common': 1.0, 'Uncommon': 0.6, 'Rare': 0.3, 'Legendary': 0.1 };
  const hpFactor = 1 - (currentHp / maxHp);
  const rarityFactor = rarityMultipliers[species.rarity] || 0.5;
  const baseChance = species.isSpecial ? 0.1 : 0.2;
  return baseChance + (hpFactor * 0.7 * rarityFactor);
}

export function rollLoot(speciesId: string, rng: RNG): BattleRewards {
  const species = MONSTER_DATA[speciesId];
  if (!species) return { exp: 25, gold: 10, items: [] };
  const rewards: BattleRewards = { exp: species.isSpecial ? 75 : 25, gold: rng.range(5, 15), items: [] };

  // Base loot table
  if (species.lootTable) {
    for (const entry of species.lootTable) {
      if (rng.chance(entry.chance)) {
        rewards.items.push({ itemId: entry.itemId, quantity: rng.range(entry.minQuantity, entry.maxQuantity) });
      }
    }
  }

  // RPG Expansion: Egg Drops
  const eggChance = species.isSpecial ? 0.05 : 0.01; // 5% for special, 1% for regular
  if (rng.chance(eggChance)) {
    const eggId = species.type === ElementType.FIRE ? 'wilder_egg_fire' :
      species.type === ElementType.WATER ? 'wilder_egg_water' :
        'wilder_egg_fire'; // Fallback
    rewards.items.push({ itemId: eggId, quantity: 1 });
  }

  return rewards;
}

export function addToInventory(inventory: InventoryItem[], itemId: string, quantity: number): InventoryItem[] {
  const existing = inventory.find(i => i.itemId === itemId);
  if (existing) return inventory.map(i => i.itemId === itemId ? { ...i, quantity: i.quantity + quantity } : i);
  return [...inventory, { itemId, quantity }];
}

export function consumeItem(inventory: InventoryItem[], itemId: string, quantity: number): InventoryItem[] {
  return inventory.map(i => i.itemId === itemId ? { ...i, quantity: i.quantity - quantity } : i).filter(i => i.quantity > 0);
}

export function createMonsterInstance(speciesId: string, level: number = 1): MonsterInstance {
  const species = MONSTER_DATA[speciesId];
  if (!species) throw new Error(`Unknown species: ${speciesId}`);
  const stats = calculateStats(species.baseStats, level, [], speciesId);
  return {
    uid: Math.random().toString(36).substr(2, 9),
    speciesId,
    level,
    exp: 0,
    currentHp: stats.maxHp,
    currentStats: stats,
    enhancementLevel: 0,
    evolutionHistory: [],
    skillPoints: 0,
    unlockedNodes: []
  };
}

export function validateEnhancement(monster: MonsterInstance, cloneItem: string): { valid: boolean; reason?: string } {
  // Check max level
  if (monster.enhancementLevel >= 15) return { valid: false, reason: 'Already at max enhancement level.' };

  // Check Clone Tier
  // D: 0->3 (Target 1-3)
  // C: 3->6
  // B: 6->9
  // A: 9->12
  // S: 12->15
  const level = monster.enhancementLevel;
  if (level < 3 && cloneItem !== 'power_clone_d') return { valid: false, reason: 'Requires Power Clone [D].' };
  if (level >= 3 && level < 6 && cloneItem !== 'power_clone_c') return { valid: false, reason: 'Requires Power Clone [C].' };
  // Add B, A, S checks later if items exist

  return { valid: true };
}

export function calculateEnhancementStats(monster: MonsterInstance, level: number): Stats {
  // Base stats are fixed (should store baseStats in instance? Or re-calculate from species?)
  // Currently MonsterInstance stores currentStats.
  // We'll just apply a multiplier to currentStats based on level?
  // Or better: Store `statsBonus` in MonsterInstance (which I didn't add yet, but I can assume enhancement adds to it).
  // Implicitly: Stats = Base * (1 + 0.03 * Level)
  // But we have `currentStats`.
  // Let's assume we boost `currentStats` by a flat % per level.
  // 3% per level is decent.
  // But re-calculating is hard without base stats.
  // Simplify: On success, increase stats by 3%. On fail (drop), decrease by 3%.
  // Wait, drift issues.
  // Better: Re-run `calculateStats` logic if we had it.
  // `calculateStats` uses species base stats.
  // `calculateStats(baseStats, level, ...)`
  // Let's just modify the `monster.currentStats` directly for now.
  const multiplier = 1.03;
  const boost = (val: number) => Math.floor(Math.max(val + 1, val * multiplier));

  return {
    ...monster.currentStats,
    hp: boost(monster.currentStats.hp),
    maxHp: boost(monster.currentStats.maxHp),
    attack: boost(monster.currentStats.attack),
    defense: boost(monster.currentStats.defense),
    specialAttack: boost(monster.currentStats.specialAttack),
    skillResistance: boost(monster.currentStats.skillResistance),
    speed: boost(monster.currentStats.speed),
  };
}

// Helper to recalculate all stats (Base + Skills + Enhancement + Equipment)
export function recalculateMonsterStats(monster: MonsterInstance): Stats {
  const species = MONSTER_DATA[monster.speciesId];
  if (!species) return monster.currentStats;

  // 1. Base Stats + Skill Nodes
  let stats = calculateStats(species.baseStats, monster.level, monster.unlockedNodes, monster.speciesId);

  // 2. Enhancement
  if (monster.enhancementLevel > 0) {
    // We reuse the valid logic from calculateEnhancementStats but applied to 'stats'
    const multiplier = 1.03;
    const boost = (val: number) => Math.floor(Math.max(val + 1, val * multiplier));
    // Apply boost repeatedly for each level? 
    // No, calculateEnhancementStats assumes linear or cumulative?
    // My previous implementation was: val * multiplier.
    // Ideally it should be compounding: val * (1.03 ^ level).
    // Or flat: val * (1 + 0.03 * level).
    // Let's stick to the previous simple logic but correctly applied.
    // Since previous logic was just `boost(val)`, it implies a single application.
    // Wait, if I enhance 0->1, I apply boost.
    // If I enhance 1->2, I apply boost again.
    // So for level N, I should apply boost N times?
    // Or just use formula: val * Math.pow(1.03, level).

    const scale = Math.pow(1.03, monster.enhancementLevel);
    const applyScale = (val: number) => Math.floor(Math.max(val + monster.enhancementLevel, val * scale)); // Ensure at least +level

    stats = {
      ...stats,
      hp: applyScale(stats.hp),
      maxHp: applyScale(stats.maxHp),
      attack: applyScale(stats.attack),
      defense: applyScale(stats.defense),
      specialAttack: applyScale(stats.specialAttack),
      skillResistance: applyScale(stats.skillResistance),
      speed: applyScale(stats.speed)
    };
  }

  // 3. Equipment
  if (monster.heldItemId) {
    const item = ITEM_DATA[monster.heldItemId];
    if (item && item.stats) {
      if (item.stats.hp) { stats.hp += item.stats.hp; stats.maxHp += item.stats.hp; }
      if (item.stats.attack) stats.attack += item.stats.attack;
      if (item.stats.defense) stats.defense += item.stats.defense;
      if (item.stats.specialAttack) stats.specialAttack += item.stats.specialAttack;
      if (item.stats.skillResistance) stats.skillResistance += item.stats.skillResistance;
      if (item.stats.speed) stats.speed += item.stats.speed;
    }
  }

  return stats;
}

export function getAvailableSkillIds(
  monster: MonsterInstance | { level: number; unlockedNodes?: string[] },
  species: MonsterSpecies
): string[] {
  if (!species) return [];
  const level = (monster as any).level || 1;
  const unlocked = (monster as any).unlockedNodes || [];

  const skills: string[] = [];

  // 1. Add skills from the 'skills' object with default thresholds
  if (species.skills.basic) skills.push(species.skills.basic);
  if (species.skills.special && level >= 5) skills.push(species.skills.special);
  if (species.skills.ultimate && level >= 15) skills.push(species.skills.ultimate);

  // 2. Add skills from 'learnableSkills' if any
  if (species.learnableSkills) {
    species.learnableSkills.forEach(ls => {
      if (level >= ls.level) skills.push(ls.skillId);
    });
  }

  // 3. Add skills from the Skill Tree
  const tree = SKILL_TREES[species.id];
  if (tree) {
    unlocked.forEach(nodeId => {
      const node = tree.nodes.find(n => n.id === nodeId);
      if (node && node.effect.type === 'skill') {
        skills.push(node.effect.value as string);
      }
    });
  }

  // Deduplicate and return
  return Array.from(new Set(skills));
}
