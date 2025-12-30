/**
 * DataValidator - Validates game data integrity
 * 
 * Checks:
 * - Skill references in monsters exist
 * - Evolution chains are valid
 * - Item references exist
 * - No circular dependencies
 * - Required fields present
 */

import { MonsterSpecies, Skill, Item, Quest, Equipment } from '../domain/types';

export interface ValidationError {
    type: 'ERROR' | 'WARNING';
    category: 'SKILL_REF' | 'EVOLUTION' | 'ITEM_REF' | 'MISSING_FIELD' | 'CIRCULAR_DEP';
    message: string;
    source: string; // ID of the problematic entity
    details?: any;
}

export interface ValidationReport {
    errors: ValidationError[];
    warnings: ValidationError[];
    stats: {
        monstersValidated: number;
        skillsValidated: number;
        itemsValidated: number;
        questsValidated: number;
    };
    timestamp: number;
}

export class DataValidator {
    private errors: ValidationError[] = [];
    private warnings: ValidationError[] = [];

    /**
     * Validate all skill references in monsters
     */
    validateSkillReferences(
        monsters: Record<string, MonsterSpecies>,
        skills: Record<string, Skill>
    ): ValidationError[] {
        const errors: ValidationError[] = [];
        const skillIds = new Set(Object.keys(skills));

        for (const [monsterId, monster] of Object.entries(monsters)) {
            // Check basic skill
            if (!skillIds.has(monster.skills.basic)) {
                errors.push({
                    type: 'ERROR',
                    category: 'SKILL_REF',
                    message: `Monster "${monster.name}" (${monsterId}) references non-existent basic skill "${monster.skills.basic}"`,
                    source: monsterId,
                    details: { skillId: monster.skills.basic, skillType: 'basic' }
                });
            }

            // Check special skill
            if (!skillIds.has(monster.skills.special)) {
                errors.push({
                    type: 'ERROR',
                    category: 'SKILL_REF',
                    message: `Monster "${monster.name}" (${monsterId}) references non-existent special skill "${monster.skills.special}"`,
                    source: monsterId,
                    details: { skillId: monster.skills.special, skillType: 'special' }
                });
            }

            // Check ultimate skill (optional)
            if (monster.skills.ultimate && !skillIds.has(monster.skills.ultimate)) {
                errors.push({
                    type: 'ERROR',
                    category: 'SKILL_REF',
                    message: `Monster "${monster.name}" (${monsterId}) references non-existent ultimate skill "${monster.skills.ultimate}"`,
                    source: monsterId,
                    details: { skillId: monster.skills.ultimate, skillType: 'ultimate' }
                });
            }

            // Check learnable skills
            if (monster.learnableSkills) {
                for (const learnable of monster.learnableSkills) {
                    if (!skillIds.has(learnable.skillId)) {
                        errors.push({
                            type: 'ERROR',
                            category: 'SKILL_REF',
                            message: `Monster "${monster.name}" (${monsterId}) has learnable skill "${learnable.skillId}" at level ${learnable.level} which doesn't exist`,
                            source: monsterId,
                            details: { skillId: learnable.skillId, level: learnable.level }
                        });
                    }
                }
            }
        }

        this.errors.push(...errors);
        return errors;
    }

    /**
     * Validate evolution chains
     */
    validateEvolutionChains(
        monsters: Record<string, MonsterSpecies>
    ): ValidationError[] {
        const errors: ValidationError[] = [];
        const monsterIds = new Set(Object.keys(monsters));

        for (const [monsterId, monster] of Object.entries(monsters)) {
            if (!monster.evolutions) continue;

            for (const evolution of monster.evolutions) {
                // Check if target exists
                if (!monsterIds.has(evolution.targetSpeciesId)) {
                    errors.push({
                        type: 'ERROR',
                        category: 'EVOLUTION',
                        message: `Monster "${monster.name}" (${monsterId}) evolves into non-existent species "${evolution.targetSpeciesId}"`,
                        source: monsterId,
                        details: { targetSpeciesId: evolution.targetSpeciesId }
                    });
                }

                // Check evolution stage progression
                const target = monsters[evolution.targetSpeciesId];
                if (target && target.evolutionStage <= monster.evolutionStage) {
                    errors.push({
                        type: 'WARNING',
                        category: 'EVOLUTION',
                        message: `Monster "${monster.name}" (stage ${monster.evolutionStage}) evolves into "${target.name}" (stage ${target.evolutionStage}). Evolution should increase stage.`,
                        source: monsterId,
                        details: {
                            currentStage: monster.evolutionStage,
                            targetStage: target.evolutionStage
                        }
                    });
                }
            }
        }

        // Check for circular evolution chains
        const circularErrors = this.detectCircularEvolutions(monsters);
        errors.push(...circularErrors);

        this.errors.push(...errors.filter(e => e.type === 'ERROR'));
        this.warnings.push(...errors.filter(e => e.type === 'WARNING'));
        return errors;
    }

    /**
     * Detect circular evolution dependencies
     */
    private detectCircularEvolutions(
        monsters: Record<string, MonsterSpecies>
    ): ValidationError[] {
        const errors: ValidationError[] = [];
        const visited = new Set<string>();
        const recursionStack = new Set<string>();

        const dfs = (monsterId: string, path: string[]): boolean => {
            if (recursionStack.has(monsterId)) {
                // Circular dependency found
                const cycle = [...path, monsterId];
                errors.push({
                    type: 'ERROR',
                    category: 'CIRCULAR_DEP',
                    message: `Circular evolution chain detected: ${cycle.join(' → ')}`,
                    source: monsterId,
                    details: { cycle }
                });
                return true;
            }

            if (visited.has(monsterId)) {
                return false;
            }

            visited.add(monsterId);
            recursionStack.add(monsterId);

            const monster = monsters[monsterId];
            if (monster?.evolutions) {
                for (const evolution of monster.evolutions) {
                    if (monsters[evolution.targetSpeciesId]) {
                        dfs(evolution.targetSpeciesId, [...path, monsterId]);
                    }
                }
            }

            recursionStack.delete(monsterId);
            return false;
        };

        for (const monsterId of Object.keys(monsters)) {
            if (!visited.has(monsterId)) {
                dfs(monsterId, []);
            }
        }

        return errors;
    }

    /**
     * Validate item references in quests and loot tables
     */
    validateItemReferences(
        monsters: Record<string, MonsterSpecies>,
        quests: Record<string, Quest>,
        items: Record<string, Item>,
        equipment: Record<string, Equipment>
    ): ValidationError[] {
        const errors: ValidationError[] = [];
        const allItemIds = new Set([
            ...Object.keys(items),
            ...Object.keys(equipment)
        ]);

        // Check monster loot tables
        for (const [monsterId, monster] of Object.entries(monsters)) {
            if (!monster.lootTable) continue;

            for (const loot of monster.lootTable) {
                if (!allItemIds.has(loot.itemId)) {
                    errors.push({
                        type: 'ERROR',
                        category: 'ITEM_REF',
                        message: `Monster "${monster.name}" (${monsterId}) drops non-existent item "${loot.itemId}"`,
                        source: monsterId,
                        details: { itemId: loot.itemId }
                    });
                }
            }
        }

        // Check quest rewards
        for (const [questId, quest] of Object.entries(quests)) {
            if (!quest.rewards.items) continue;

            for (const reward of quest.rewards.items) {
                if (!allItemIds.has(reward.itemId)) {
                    errors.push({
                        type: 'ERROR',
                        category: 'ITEM_REF',
                        message: `Quest "${quest.name}" (${questId}) rewards non-existent item "${reward.itemId}"`,
                        source: questId,
                        details: { itemId: reward.itemId }
                    });
                }
            }
        }

        this.errors.push(...errors);
        return errors;
    }

    /**
     * Validate required fields
     */
    validateRequiredFields(
        monsters: Record<string, MonsterSpecies>
    ): ValidationError[] {
        const errors: ValidationError[] = [];

        for (const [monsterId, monster] of Object.entries(monsters)) {
            const required = ['id', 'name', 'type', 'faction', 'baseStats', 'evolutionStage', 'skills', 'rarity'];

            for (const field of required) {
                if (!(field in monster)) {
                    errors.push({
                        type: 'ERROR',
                        category: 'MISSING_FIELD',
                        message: `Monster "${monsterId}" is missing required field "${field}"`,
                        source: monsterId,
                        details: { field }
                    });
                }
            }

            // Validate baseStats completeness
            if (monster.baseStats) {
                const requiredStats = ['hp', 'maxHp', 'attack', 'defense', 'specialAttack', 'skillResistance', 'speed'];
                for (const stat of requiredStats) {
                    if (!(stat in monster.baseStats)) {
                        errors.push({
                            type: 'ERROR',
                            category: 'MISSING_FIELD',
                            message: `Monster "${monster.name}" (${monsterId}) is missing baseStats.${stat}`,
                            source: monsterId,
                            details: { field: `baseStats.${stat}` }
                        });
                    }
                }
            }
        }

        this.errors.push(...errors);
        return errors;
    }

    /**
     * Generate comprehensive validation report
     */
    generateReport(
        monsters: Record<string, MonsterSpecies>,
        skills: Record<string, Skill>,
        items: Record<string, Item>,
        equipment: Record<string, Equipment>,
        quests: Record<string, Quest>
    ): ValidationReport {
        // Reset
        this.errors = [];
        this.warnings = [];

        // Run all validations
        this.validateRequiredFields(monsters);
        this.validateSkillReferences(monsters, skills);
        this.validateEvolutionChains(monsters);
        this.validateItemReferences(monsters, quests, items, equipment);

        return {
            errors: this.errors,
            warnings: this.warnings,
            stats: {
                monstersValidated: Object.keys(monsters).length,
                skillsValidated: Object.keys(skills).length,
                itemsValidated: Object.keys(items).length + Object.keys(equipment).length,
                questsValidated: Object.keys(quests).length
            },
            timestamp: Date.now()
        };
    }

    /**
     * Print report to console
     */
    printReport(report: ValidationReport): void {
        console.log('\n=== Data Validation Report ===');
        console.log(`Timestamp: ${new Date(report.timestamp).toISOString()}`);
        console.log(`\nStats:`);
        console.log(`  - Monsters: ${report.stats.monstersValidated}`);
        console.log(`  - Skills: ${report.stats.skillsValidated}`);
        console.log(`  - Items: ${report.stats.itemsValidated}`);
        console.log(`  - Quests: ${report.stats.questsValidated}`);

        if (report.errors.length === 0 && report.warnings.length === 0) {
            console.log('\n✅ No errors or warnings found!');
            return;
        }

        if (report.errors.length > 0) {
            console.log(`\n❌ Errors (${report.errors.length}):`);
            for (const error of report.errors) {
                console.log(`  [${error.category}] ${error.message}`);
            }
        }

        if (report.warnings.length > 0) {
            console.log(`\n⚠️  Warnings (${report.warnings.length}):`);
            for (const warning of report.warnings) {
                console.log(`  [${warning.category}] ${warning.message}`);
            }
        }
    }
}

// Singleton instance
export const dataValidator = new DataValidator();
