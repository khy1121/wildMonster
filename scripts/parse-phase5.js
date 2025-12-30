/**
 * Script to parse phase5Monsters.ts and convert to JSON
 * Usage: node scripts/parse-phase5.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tsFilePath = path.join(__dirname, '../data/phase5Monsters.ts');
const jsonFilePath = path.join(__dirname, '../public/data/json/phase5_monsters.json');

try {
    const tsContent = fs.readFileSync(tsFilePath, 'utf-8');

    // Extract the object content
    const match = tsContent.match(/export const PHASE5_MONSTERS: Record<string, MonsterSpecies> = ({[\s\S]*?});/);

    if (match && match[1]) {
        let jsonString = match[1];

        // Clean up to make valid JSON

        // 1. Remove comments
        jsonString = jsonString.replace(/\/\/.*$/gm, '');

        // 2. Quote keys (id: -> "id":)
        jsonString = jsonString.replace(/([a-zA-Z0-9_]+):/g, '"$1":');

        // 3. Fix ElementType enums
        jsonString = jsonString.replace(/ElementType\.([A-Z]+)/g, '"$1"');

        // 4. Fix FactionType enums
        jsonString = jsonString.replace(/FactionType\.([A-Z_]+)/g, '"$1"');

        // 5. Fix trailing commas (simple approach)
        jsonString = jsonString.replace(/,(\s*[\}\]])/g, '$1');

        // 6. Fix single quotes to double quotes
        jsonString = jsonString.replace(/'/g, '"');

        // Try to parse to verify
        try {
            // Use Function constructor to handle loose JSON-like object
            // This is safe here because we're running it locally on known files
            // But purely for parsing, let's try strict JSON if possible, otherwise eval-like approach

            // Let's use a safer approach: write a temporary JS file that exports the object
            // checking the content, it's almost valid JS object except for imports

            console.log('Parsing extracted content...');
            // Since it's complex, let's simplistic parsing
            const monsters = {};

            // We will parse block by block
            // This is a simplified parser for this specific file structure

        } catch (e) {
            console.error('Failed to parse JSON directly');
        }
    }
} catch (error) {
    console.error('Error:', error);
}

// Alternative: Create a JS file that mocks imports and exports the data
const tempJsContent = `
const ElementType = {
  FIRE: 'FIRE', WATER: 'WATER', GRASS: 'GRASS', ELECTRIC: 'ELECTRIC', 
  ICE: 'ICE', LIGHT: 'LIGHT', DARK: 'DARK', VOID: 'VOID', NEUTRAL: 'NEUTRAL',
  EARTH: 'EARTH', WIND: 'WIND' 
};

const FactionType = {
  EMBER_CLAN: 'EMBER_CLAN', TIDE_WATCHERS: 'TIDE_WATCHERS', 
  STORM_HERDERS: 'STORM_HERDERS', GLOOM_STALKERS: 'GLOOM_STALKERS',
  GLADE_KEEPERS: 'GLADE_KEEPERS'
};

${fs.readFileSync(tsFilePath, 'utf-8')
        .replace(/import .*/g, '')
        .replace(/export const PHASE5_MONSTERS: Record<string, MonsterSpecies> =/, 'const PHASE5_MONSTERS =')
        .replace(/BaseStats/g, '') // remove types if any
    }

console.log(JSON.stringify(PHASE5_MONSTERS, null, 2));
`;

const tempFilePath = path.join(__dirname, 'temp_converter.js');
fs.writeFileSync(tempFilePath, tempJsContent);

console.log('Created temp converter script. Running it...');
import { exec } from 'child_process';

exec(`node "${tempFilePath}"`, (err, stdout, stderr) => {
    if (err) {
        console.error('Error executing converter:', stderr);
        return;
    }

    if (stdout) {
        fs.writeFileSync(jsonFilePath, stdout);
        console.log(`✅ Successfully converted phase5Monsters.ts to ${jsonFilePath}`);
        console.log(`File size: ${stdout.length} bytes`);

        // Clean up
        fs.unlinkSync(tempFilePath);
    }
});
