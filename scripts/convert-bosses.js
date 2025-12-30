/**
 * Script to convert bosses.ts to bosses.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tsFilePath = path.join(__dirname, '../data/bosses.ts');
const jsonFilePath = path.join(__dirname, '../public/data/json/bosses.json');

// Mock content to execute the TS file logic
const fileContent = fs.readFileSync(tsFilePath, 'utf-8');

// We need to strip imports and types to make it executable as JS
const jsContent = fileContent
    .replace(/import .*/g, '')
    .replace(/: BossEncounter\[\]/g, '')
    .replace(/export const BOSS_DATA/g, 'const BOSS_DATA')
    .replace(/export const BOSSES/g, 'const BOSSES')
    .replace(/: Record<string, BossEncounter>/g, '');

const runnerCode = `
${jsContent}

// Convert array to object keyed by ID
const bossesObj = {};
BOSS_DATA.forEach(b => bossesObj[b.id] = b);

console.log(JSON.stringify(bossesObj, null, 2));
`;

const tempFile = path.join(__dirname, 'temp_boss_convert.js');
fs.writeFileSync(tempFile, runnerCode);

import { exec } from 'child_process';
exec(`node "${tempFile}"`, (error, stdout, stderr) => {
    if (error) {
        console.error('Error:', stderr);
    } else {
        fs.writeFileSync(jsonFilePath, stdout);
        console.log(`✅ Converted bosses.ts to bosses.json (${stdout.length} bytes)`);
    }
    fs.unlinkSync(tempFile);
});
