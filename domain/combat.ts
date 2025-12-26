
import { MonsterInstance, Stats } from './types';
import { SKILL_DATA } from '../data/skills';

export interface CombatEntity {
  uid: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  stats: Stats;
  skills: string[];
  cooldowns: Record<string, number>; // skillId -> remainingMs
}

export function calculateDamage(attacker: CombatEntity, defender: CombatEntity, skillId: string): number {
  const skill = SKILL_DATA[skillId];
  if (!skill) return 0;

  // Simple damage formula: ((Attack * Power) / Defense) * RandomFactor
  const rawDamage = (attacker.stats.attack * skill.power) / (defender.stats.defense || 1);
  const randomFactor = 0.85 + Math.random() * 0.3; // 0.85 to 1.15
  
  return Math.max(1, Math.floor(rawDamage * randomFactor));
}

export function updateCooldowns(entity: CombatEntity, deltaMs: number): CombatEntity {
  const newCooldowns = { ...entity.cooldowns };
  for (const id in newCooldowns) {
    newCooldowns[id] = Math.max(0, newCooldowns[id] - deltaMs);
  }
  return { ...entity, cooldowns: newCooldowns };
}
