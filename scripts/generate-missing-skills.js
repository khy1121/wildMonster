/**
 * Helper script to auto-generate missing skills based on monsters data
 * usage: node scripts/generate-missing-skills.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonDir = path.join(__dirname, '../public/data/json');

// Helper to deduce type from skill id or name
function deduceType(id) {
    if (id.includes('fire') || id.includes('flame') || id.includes('burn') || id.includes('magma') || id.includes('inferno') || id.includes('solar') || id.includes('ember')) return 'FIRE';
    if (id.includes('water') || id.includes('aqua') || id.includes('bubble') || id.includes('ocean') || id.includes('tide') || id.includes('hydro')) return 'WATER';
    if (id.includes('ice') || id.includes('frost') || id.includes('snow') || id.includes('cold') || id.includes('blizzard') || id.includes('freeze')) return 'ICE';
    if (id.includes('electric') || id.includes('spark') || id.includes('thunder') || id.includes('bolt') || id.includes('volt') || id.includes('storm')) return 'ELECTRIC';
    if (id.includes('leaf') || id.includes('vine') || id.includes('grass') || id.includes('plant') || id.includes('forest') || id.includes('bloom') || id.includes('petal') || id.includes('nature') || id.includes('wood')) return 'GRASS';
    if (id.includes('rock') || id.includes('stone') || id.includes('earth') || id.includes('ground') || id.includes('sand')) return 'EARTH';
    if (id.includes('wind') || id.includes('air') || id.includes('sky') || id.includes('gust') || id.includes('wing') || id.includes('tornado')) return 'WIND';
    if (id.includes('light') || id.includes('flash') || id.includes('holy') || id.includes('shine') || id.includes('angel') || id.includes('divine') || id.includes('radiant')) return 'LIGHT';
    if (id.includes('dark') || id.includes('shadow') || id.includes('night') || id.includes('gloom') || id.includes('abyss') || id.includes('void') || id.includes('phantom')) return 'DARK';
    return 'NEUTRAL';
}

function toTitleCase(str) {
    return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

try {
    // Load data
    const monsters = JSON.parse(fs.readFileSync(path.join(jsonDir, 'monsters.json'), 'utf-8'));
    const phase5 = JSON.parse(fs.readFileSync(path.join(jsonDir, 'phase5_monsters.json'), 'utf-8'));
    const skills = JSON.parse(fs.readFileSync(path.join(jsonDir, 'skills.json'), 'utf-8'));

    // Merge monsters
    const allMonsters = { ...monsters, ...phase5 };

    // Find missing skills
    const missing = new Set();
    const existing = new Set(Object.keys(skills));

    for (const [id, m] of Object.entries(allMonsters)) {
        if (m.skills.basic && !existing.has(m.skills.basic)) missing.add(m.skills.basic);
        if (m.skills.special && !existing.has(m.skills.special)) missing.add(m.skills.special);
        if (m.skills.ultimate && !existing.has(m.skills.ultimate)) missing.add(m.skills.ultimate);
    }

    console.log(`Found ${missing.size} missing skills.`);

    // Generate skill templates
    for (const id of missing) {
        const type = deduceType(id);
        const name = toTitleCase(id);

        let category = 'SPECIAL';
        let power = 60;
        let cooldown = 4000;

        // Simple heuristic for category
        if (id.includes('ultimate') || id.includes('doom') || id.includes('wrath') || id.includes('apocalypse') || id.includes('god') || id.includes('nova') || id.includes('meteor') || id.includes('storm_call')) {
            category = 'ULTIMATE';
            power = 150;
            cooldown = 15000;
        } else if (id.includes('scratch') || id.includes('tackle') || id.includes('peck') || id.includes('bite') || id.includes('claw') || id.includes('hit') || id.includes('kick') || id.includes('punch') || id.includes('slash')) {
            category = 'BASIC';
            power = 20;
            cooldown = 1000;
        }

        skills[id] = {
            id,
            name,
            nameKo: name, // Placeholder
            type,
            category,
            power,
            cooldown,
            description: `A powerful ${type.toLowerCase()} move.`,
            descriptionKo: `강력한 ${type.toLowerCase()} 공격.`
        };

        console.log(`Generated: ${name} (${type} ${category})`);
    }

    // Save updated skills
    fs.writeFileSync(path.join(jsonDir, 'skills.json'), JSON.stringify(skills, null, 2));
    console.log('✅ Updated skills.json');

} catch (error) {
    console.error('Error:', error);
}
