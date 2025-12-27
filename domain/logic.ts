
import { Stats, MonsterSpecies, MonsterInstance, Tamer, BattleRewards, InventoryItem, Rarity, EvolutionOption, GameState, SpawnCondition } from './types';
import { MONSTER_DATA } from '../data/monsters';
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

  const newStats = calculateStats(targetSpecies.baseStats, monster.level, [], targetSpeciesId);

  return {
    ...monster,
    speciesId: targetSpeciesId,
    evolutionHistory: [...monster.evolutionHistory, monster.speciesId],
    currentStats: newStats,
    currentHp: newStats.maxHp,
    unlockedNodes: []
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
  const newStats = calculateStats(species.baseStats, newLevel, monster.unlockedNodes, monster.speciesId);

  return {
    leveledUp,
    monster: {
      ...monster,
      level: newLevel,
      exp: newExp,
      skillPoints: newSkillPoints,
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
  const species = MONSTER_DATA[monster.speciesId];
  const newStats = calculateStats(species.baseStats, monster.level, newUnlockedNodes, monster.speciesId);

  return {
    ...monster,
    skillPoints: monster.skillPoints - node.cost,
    unlockedNodes: newUnlockedNodes,
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
  if (species.lootTable) {
    for (const entry of species.lootTable) {
      if (rng.chance(entry.chance)) {
        rewards.items.push({ itemId: entry.itemId, quantity: rng.range(entry.minQuantity, entry.maxQuantity) });
      }
    }
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
    evolutionHistory: [],
    skillPoints: 0,
    unlockedNodes: []
  };
}

export function getAvailableSkillIds(
  monster: MonsterInstance | { level: number; unlockedNodes?: string[] },
  species: MonsterSpecies
): string[] {
  if (!species) return [];
  const level = (monster as any).level || 1;
  const unlocked = (monster as any).unlockedNodes || [];

  const learnables = species.learnableSkills || [];

  const baseSkills = learnables.filter(ls => ls.level === 1).map(ls => ls.skillId);
  const learnedSkills = learnables
    .filter(ls => ls.level > 1 && level >= ls.level)
    .sort((a, b) => a.level - b.level)
    .map(ls => ls.skillId);

  const tree = SKILL_TREES[species.id];
  const treeSkills = unlocked.flatMap(nodeId => {
    if (!tree) return [] as string[];
    const node = tree.nodes.find(n => n.id === nodeId);
    if (node && node.effect.type === 'skill') return [node.effect.value as string];
    return [] as string[];
  });

  // Preserve order: base, learned (by level), then tree-unlocked; remove duplicates
  const combined = [...baseSkills, ...learnedSkills, ...treeSkills];
  return Array.from(new Set(combined));
}
