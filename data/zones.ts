
import { MonsterSpecies } from '../domain/types';

export interface ZoneConfig {
  id: string;
  name: string;
  levelRange: [number, number];
  spawnPool: string[]; // speciesIds
  spawnRate: number; // 0 to 1
}

export const WORLD_ZONES: Record<string, ZoneConfig> = {
  'starter_fields': {
    id: 'starter_fields',
    name: 'Starter Fields',
    levelRange: [3, 6],
    spawnPool: ['pyrocat', 'droplet', 'lunacat'], // Lunacat is conditional
    spawnRate: 0.05
  },
  'scorched_path': {
    id: 'scorched_path',
    name: 'Scorched Path',
    levelRange: [8, 12],
    spawnPool: ['pyrocat', 'thunderhoof'], // Thunderhoof is conditional
    spawnRate: 0.08
  }
};
