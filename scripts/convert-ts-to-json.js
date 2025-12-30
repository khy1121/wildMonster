// Script to convert TypeScript data to JSON
// Run with: node scripts/convert-ts-to-json.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read phase5Monsters.ts and extract the data
const phase5Path = path.join(__dirname, '../data/phase5Monsters.ts');
const outputPath = path.join(__dirname, '../public/data/json/phase5_monsters.json');

console.log('Converting phase5Monsters.ts to JSON...');

// This is a manual conversion helper
// Since we can't directly import .ts files in Node, we'll create the JSON manually
// based on the structure we saw

const instructions = `
To convert phase5Monsters.ts to JSON:

1. Copy the PHASE5_MONSTERS object from data/phase5Monsters.ts
2. Remove all TypeScript type annotations (ElementType.FIRE -> "FIRE", etc.)
3. Remove the 'export const PHASE5_MONSTERS: Record<string, MonsterSpecies> = ' part
4. Save as phase5_monsters.json

Or use this script after building the TypeScript:
npm run build
node -e "import('./dist/data/phase5Monsters.js').then(m => fs.writeFileSync('./public/data/json/phase5_monsters.json', JSON.stringify(m.PHASE5_MONSTERS, null, 2)))"
`;

console.log(instructions);
