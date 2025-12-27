
import { MonsterInstance, Stats } from './types';
import { SKILL_DATA } from '../data/skills';

export interface BattleBuff {
  id: string;
  source: string;
  effect: 'BUFF_ATK' | 'BUFF_DEF' | 'BUFF_SPD' | 'DEBUFF_DEF' | 'REGEN';
  power: number;
  duration: number; // ms remaining
}

export interface CombatEntity {
  uid: string;
  name: string;
  speciesId: string;
  level: number;
  hp: number;
  maxHp: number;
  stats: Stats;
  skills: string[];
  cooldowns: Record<string, number>; // skillId -> remainingMs
  buffs: BattleBuff[];
}

export function calculateDamage(attacker: CombatEntity, defender: CombatEntity, skillId: string): number {
  const skill = SKILL_DATA[skillId];
  if (!skill) return 0;

  const isSpecial = skill.category === 'SPECIAL' || skill.category === 'ULTIMATE';

  // Calculate effective stats including buffs
  // Fallback to physical stats if special stats are missing (for legacy or partially initialized instances)
  let attackerStat = isSpecial
    ? (attacker.stats.specialAttack ?? attacker.stats.attack ?? 10)
    : (attacker.stats.attack ?? 10);

  attacker.buffs.forEach(b => {
    if (b.effect === 'BUFF_ATK' && !isSpecial) attackerStat += b.power;
  });

  let defenderStat = isSpecial
    ? (defender.stats.skillResistance ?? defender.stats.defense ?? 10)
    : (defender.stats.defense ?? 10);

  defender.buffs.forEach(b => {
    if (b.effect === 'BUFF_DEF' && !isSpecial) defenderStat += b.power;
    if (b.effect === 'DEBUFF_DEF' && !isSpecial) defenderStat -= b.power;
  });

  defenderStat = Math.max(1, defenderStat);

  // Damage formula: ((Stat * Power) / EnemyStat) * RandomFactor
  const rawDamage = (attackerStat * skill.power) / defenderStat;
  const randomFactor = 0.85 + Math.random() * 0.3; // 0.85 to 1.15

  const finalDamage = Math.floor(rawDamage * randomFactor);

  // Final safety check for NaN or Infinity
  if (isNaN(finalDamage) || !isFinite(finalDamage)) return 1;
  return Math.max(1, finalDamage);
}

export function updateCombatState(entity: CombatEntity, deltaMs: number): CombatEntity {
  // Update Cooldowns
  const newCooldowns = { ...entity.cooldowns };
  for (const id in newCooldowns) {
    newCooldowns[id] = Math.max(0, newCooldowns[id] - deltaMs);
  }

  // Update Buffs
  const newBuffs = entity.buffs
    .map(b => ({ ...b, duration: b.duration - deltaMs }))
    .filter(b => b.duration > 0);

  return { ...entity, cooldowns: newCooldowns, buffs: newBuffs };
}
