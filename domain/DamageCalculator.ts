
import { ElementType, Skill, MonsterSpecies } from './types';
import { CombatEntity } from './combat';
import { MONSTER_DATA } from '../data/monsters';

export type Weather = 'CLEAR' | 'RAIN' | 'SUNNY' | 'SANDSTORM' | 'HAIL' | 'FOG';
export type Terrain = 'NORMAL' | 'VOLCANIC' | 'AQUATIC' | 'FOREST' | 'ELECTRIC' | 'FROZEN';

type TypeChart = Partial<Record<ElementType, Partial<Record<ElementType, number>>>>;

/**
 * Standardized Damage Calculator for WildMonster
 * Implements the formula specification defined in Damage_Formula_Spec.md
 */
export class DamageCalculator {
    private static typeChart: TypeChart = {
        [ElementType.FIRE]: {
            [ElementType.FIRE]: 0.5, [ElementType.WATER]: 0.5, [ElementType.GRASS]: 2.0, [ElementType.ELECTRIC]: 1.0, [ElementType.DARK]: 1.0, [ElementType.LIGHT]: 1.0, [ElementType.ICE]: 2.0, [ElementType.NEUTRAL]: 1.0, [ElementType.VOID]: 1.0
        },
        [ElementType.WATER]: {
            [ElementType.FIRE]: 2.0, [ElementType.WATER]: 0.5, [ElementType.GRASS]: 0.5, [ElementType.ELECTRIC]: 0.5, [ElementType.DARK]: 1.0, [ElementType.LIGHT]: 1.0, [ElementType.ICE]: 0.5, [ElementType.NEUTRAL]: 1.0, [ElementType.VOID]: 1.0
        },
        [ElementType.GRASS]: {
            [ElementType.FIRE]: 0.5, [ElementType.WATER]: 2.0, [ElementType.GRASS]: 0.5, [ElementType.ELECTRIC]: 0.5, [ElementType.DARK]: 1.0, [ElementType.LIGHT]: 1.0, [ElementType.ICE]: 2.0, [ElementType.NEUTRAL]: 1.0, [ElementType.VOID]: 1.0
        },
        [ElementType.ELECTRIC]: {
            [ElementType.FIRE]: 1.0, [ElementType.WATER]: 2.0, [ElementType.GRASS]: 1.0, [ElementType.ELECTRIC]: 0.5, [ElementType.DARK]: 1.0, [ElementType.LIGHT]: 1.0, [ElementType.ICE]: 1.0, [ElementType.NEUTRAL]: 1.0, [ElementType.VOID]: 1.0
        },
        [ElementType.DARK]: {
            [ElementType.FIRE]: 1.0, [ElementType.WATER]: 1.0, [ElementType.GRASS]: 1.0, [ElementType.ELECTRIC]: 1.0, [ElementType.DARK]: 0.5, [ElementType.LIGHT]: 2.0, [ElementType.ICE]: 1.0, [ElementType.NEUTRAL]: 1.0, [ElementType.VOID]: 2.0
        },
        [ElementType.LIGHT]: {
            [ElementType.FIRE]: 1.0, [ElementType.WATER]: 1.0, [ElementType.GRASS]: 1.0, [ElementType.ELECTRIC]: 1.0, [ElementType.DARK]: 2.0, [ElementType.LIGHT]: 0.5, [ElementType.ICE]: 1.0, [ElementType.NEUTRAL]: 1.0, [ElementType.VOID]: 0.5
        },
        [ElementType.ICE]: {
            [ElementType.FIRE]: 0.5, [ElementType.WATER]: 1.0, [ElementType.GRASS]: 2.0, [ElementType.ELECTRIC]: 1.0, [ElementType.DARK]: 1.0, [ElementType.LIGHT]: 1.0, [ElementType.ICE]: 0.5, [ElementType.NEUTRAL]: 1.0, [ElementType.VOID]: 1.0
        },
        [ElementType.NEUTRAL]: {
            [ElementType.FIRE]: 1.0, [ElementType.WATER]: 1.0, [ElementType.GRASS]: 1.0, [ElementType.ELECTRIC]: 1.0, [ElementType.DARK]: 1.0, [ElementType.LIGHT]: 1.0, [ElementType.ICE]: 1.0, [ElementType.NEUTRAL]: 1.0, [ElementType.VOID]: 1.0
        },
        [ElementType.VOID]: {
            [ElementType.FIRE]: 1.0, [ElementType.WATER]: 1.0, [ElementType.GRASS]: 1.0, [ElementType.ELECTRIC]: 1.0, [ElementType.DARK]: 0.5, [ElementType.LIGHT]: 2.0, [ElementType.ICE]: 1.0, [ElementType.NEUTRAL]: 1.0, [ElementType.VOID]: 0.5
        }
    };

    /**
     * Initialize the damage calculator with a custom type chart (optional)
     */
    static Initialize(typeChart: TypeChart): void {
        this.typeChart = typeChart;
    }

    /**
     * Calculate final damage for an attack.
     */
    static Calculate(
        attacker: CombatEntity,
        defender: CombatEntity,
        skill: Skill,
        weather: Weather = 'CLEAR',
        terrain: Terrain = 'NORMAL'
    ): number {

        // Step 1: Get effective stats
        const { attackStat, defenseStat } = this.getEffectiveStats(attacker, defender, skill);

        // Step 2: Calculate raw damage
        let damage = this.calculateRawDamage(attackStat, skill.power, defenseStat);

        // Step 3: Type effectiveness
        const typeMultiplier = this.ApplyTypeChart(skill.type, this.getDefenderType(defender));
        damage *= typeMultiplier;

        // Step 4: Weather modifier
        const weatherMultiplier = this.getWeatherModifier(skill, weather);
        damage *= weatherMultiplier;

        // Step 5: Terrain modifier
        const terrainMultiplier = this.getTerrainModifier(skill, terrain);
        damage *= terrainMultiplier;

        // Step 6: Critical hit
        const critMultiplier = this.calculateCritical(attacker, skill);
        damage *= critMultiplier;

        // Step 7: STAB
        const stabBonus = this.getSTABBonus(attacker, skill);
        damage *= stabBonus;

        // Step 8: Random variance
        const randomFactor = this.getRandomFactor();
        damage *= randomFactor;

        // Step 9: Finalize
        return this.finalizeDamage(damage);
    }

    static ApplyTypeChart(attackType: ElementType, defenderType: ElementType): number {
        if (!this.typeChart) return 1.0;
        return this.typeChart[attackType]?.[defenderType] ?? 1.0;
    }

    // --- Helper Methods ---

    private static getDefenderType(defender: CombatEntity): ElementType {
        const species = MONSTER_DATA[defender.speciesId];
        return species ? species.type : ElementType.NEUTRAL;
    }

    private static getEffectiveStats(
        attacker: CombatEntity,
        defender: CombatEntity,
        skill: Skill
    ): { attackStat: number; defenseStat: number } {

        const isSpecial = skill.category === 'SPECIAL' || skill.category === 'ULTIMATE';

        // Base stats
        let attackStat = isSpecial
            ? (attacker.stats.specialAttack ?? 10)
            : (attacker.stats.attack ?? 10);

        let defenseStat = isSpecial
            ? (defender.stats.skillResistance ?? 10)
            : (defender.stats.defense ?? 10);

        // Apply buffs/debuffs
        attacker.buffs.forEach(buff => {
            if (buff.effect === 'BUFF_ATK' && !isSpecial) {
                attackStat += buff.power;
            }
            // Note: Assuming 'BUFF_SPATK' exists or mapped appropriately if added later
        });

        defender.buffs.forEach(buff => {
            if (buff.effect === 'BUFF_DEF' && !isSpecial) {
                defenseStat += buff.power;
            }
            if (buff.effect === 'DEBUFF_DEF' && !isSpecial) {
                defenseStat -= buff.power;
            }
            // Note: Assuming 'BUFF_SPDEF' exists
        });

        // Apply status effects
        if (attacker.status && attacker.status.type === 'burn' && !isSpecial) {
            attackStat = Math.floor(attackStat * 0.5); // Burn halves physical attack
        }

        // Minimum stat floor
        attackStat = Math.max(1, attackStat);
        defenseStat = Math.max(1, defenseStat);

        return { attackStat, defenseStat };
    }

    private static calculateRawDamage(
        attackStat: number,
        skillPower: number,
        defenseStat: number
    ): number {
        return (attackStat * skillPower) / defenseStat;
    }

    private static getWeatherModifier(skill: Skill, weather: Weather): number {
        switch (weather) {
            case 'RAIN':
                if (skill.type === ElementType.WATER) return 1.5;
                if (skill.type === ElementType.FIRE) return 0.5;
                break;

            case 'SUNNY':
                if (skill.type === ElementType.FIRE) return 1.5;
                if (skill.type === ElementType.WATER) return 0.5;
                break;

            case 'HAIL':
                if (skill.type === ElementType.ICE) return 1.5;
                break;

            case 'FOG':
                if (skill.type === ElementType.DARK) return 1.2;
                break;
        }
        return 1.0;
    }

    private static getTerrainModifier(skill: Skill, terrain: Terrain): number {
        switch (terrain) {
            case 'VOLCANIC':
                if (skill.type === ElementType.FIRE) return 1.3;
                if (skill.type === ElementType.WATER) return 0.7;
                break;

            case 'AQUATIC':
                if (skill.type === ElementType.WATER) return 1.3;
                if (skill.type === ElementType.ELECTRIC) return 1.5;
                if (skill.type === ElementType.FIRE) return 0.5;
                break;

            case 'FOREST':
                if (skill.type === ElementType.GRASS) return 1.3;
                if (skill.type === ElementType.FIRE) return 1.2;
                break;

            case 'ELECTRIC':
                if (skill.type === ElementType.ELECTRIC) return 1.3;
                break;

            case 'FROZEN':
                if (skill.type === ElementType.ICE) return 1.3;
                if (skill.type === ElementType.FIRE) return 0.8;
                break;
        }
        return 1.0;
    }

    private static calculateCritical(attacker: CombatEntity, skill: Skill): number {
        // Base critical rate: 6.25% (1/16)
        let critRate = 0.0625;

        // High crit skills
        // Assuming 'highCritRatio' property exists on Skill or checked via ID
        // but Skill interface doesn't strictly have highCritRatio in types.ts yet. 
        // We'll check if it's implicitly there or add it later. For now, basic check.

        // Speed-based crit bonus
        if ((attacker.stats.speed ?? 0) > 100) {
            critRate += 0.05;
        }

        // Crit buffs
        attacker.buffs.forEach(buff => {
            // Assuming 'BUFF_CRIT' might be added.
            // Current BattleBuff effect type is limited, but this is future proofing.
            if (buff.effect === ('BUFF_CRIT' as any)) {
                critRate += 0.1;
            }
        });

        const isCrit = Math.random() < critRate;
        return isCrit ? 1.5 : 1.0;
    }

    private static getSTABBonus(attacker: CombatEntity, skill: Skill): number {
        const attackerSpecies = MONSTER_DATA[attacker.speciesId];
        if (attackerSpecies && attackerSpecies.type === skill.type) {
            return 1.5;
        }
        return 1.0;
    }

    private static getRandomFactor(): number {
        return 0.85 + Math.random() * 0.3;
    }

    private static finalizeDamage(rawDamage: number): number {
        let damage = Math.floor(rawDamage);
        damage = Math.max(1, damage);
        damage = Math.min(9999, damage);
        return damage;
    }
}
