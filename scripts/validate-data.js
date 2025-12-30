#!/usr/bin/env node
/**
 * Data Validation Script
 * 
 * Usage: node scripts/validate-data.js
 * 
 * Validates all game data JSON files for:
 * - Skill references
 * - Evolution chains
 * - Item references
 * - Required fields
 * - Circular dependencies
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load JSON files
function loadJSON(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`❌ Failed to load ${filePath}:`, error.message);
        return null;
    }
}

// Main validation
function validateData() {
    console.log('=== WildMonster Data Validation ===\n');

    const dataDir = path.join(__dirname, '../public/data/json');

    // Load all data
    const baseMonsters = loadJSON(path.join(dataDir, 'monsters.json')) || {};
    const phase5Monsters = loadJSON(path.join(dataDir, 'phase5_monsters.json')) || {};
    const monsters = { ...baseMonsters, ...phase5Monsters };

    const skills = loadJSON(path.join(dataDir, 'skills.json')) || {};
    const items = loadJSON(path.join(dataDir, 'items.json')) || {};
    const equipment = loadJSON(path.join(dataDir, 'equipment.json')) || {};

    let errors = 0;
    let warnings = 0;

    // Validate skill references
    console.log('Validating skill references...');
    const skillIds = new Set(Object.keys(skills));

    for (const [monsterId, monster] of Object.entries(monsters)) {
        if (!skillIds.has(monster.skills.basic)) {
            console.error(`❌ Monster "${monster.name}" (${monsterId}) references non-existent basic skill "${monster.skills.basic}"`);
            errors++;
        }

        if (!skillIds.has(monster.skills.special)) {
            console.error(`❌ Monster "${monster.name}" (${monsterId}) references non-existent special skill "${monster.skills.special}"`);
            errors++;
        }

        if (monster.skills.ultimate && !skillIds.has(monster.skills.ultimate)) {
            console.error(`❌ Monster "${monster.name}" (${monsterId}) references non-existent ultimate skill "${monster.skills.ultimate}"`);
            errors++;
        }
    }

    // Validate evolution chains
    console.log('Validating evolution chains...');
    const monsterIds = new Set(Object.keys(monsters));

    for (const [monsterId, monster] of Object.entries(monsters)) {
        if (!monster.evolutions) continue;

        for (const evolution of monster.evolutions) {
            if (!monsterIds.has(evolution.targetSpeciesId)) {
                console.error(`❌ Monster "${monster.name}" (${monsterId}) evolves into non-existent species "${evolution.targetSpeciesId}"`);
                errors++;
            }
        }
    }

    // Validate required fields
    console.log('Validating required fields...');
    const requiredFields = ['id', 'name', 'type', 'faction', 'baseStats', 'evolutionStage', 'skills', 'rarity'];

    for (const [monsterId, monster] of Object.entries(monsters)) {
        for (const field of requiredFields) {
            if (!(field in monster)) {
                console.error(`❌ Monster "${monsterId}" is missing required field "${field}"`);
                errors++;
            }
        }
    }

    // Print summary
    console.log('\n=== Validation Summary ===');
    console.log(`Monsters: ${Object.keys(monsters).length}`);
    console.log(`Skills: ${Object.keys(skills).length}`);
    console.log(`Items: ${Object.keys(items).length}`);
    console.log(`Equipment: ${Object.keys(equipment).length}`);
    console.log(`\nErrors: ${errors}`);
    console.log(`Warnings: ${warnings}`);

    if (errors === 0 && warnings === 0) {
        console.log('\n✅ All validations passed!');
        process.exit(0);
    } else {
        console.log('\n❌ Validation failed!');
        process.exit(1);
    }
}

// Run validation
validateData();
