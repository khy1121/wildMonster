
import React, { useState, useEffect, useCallback } from 'react';
import { Position } from '../types';

interface WorldMapProps {
  pos: Position;
  onMove: (p: Position) => void;
  onEncounter: (speciesId: string) => void;
}

const GRID_SIZE = 15;
const TILE_SIZE = 64;

const WorldMap: React.FC<WorldMapProps> = ({ pos, onMove, onEncounter }) => {
  const [tiles, setTiles] = useState<string[][]>([]);

  useEffect(() => {
    // Basic Procedural Map
    const newTiles = Array.from({ length: GRID_SIZE }, (_, y) =>
      Array.from({ length: GRID_SIZE }, (_, x) => {
        const rand = Math.random();
        if (rand < 0.15) return 'bush';
        if (rand < 0.20) return 'rock';
        return 'grass';
      })
    );
    setTiles(newTiles);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    let newX = pos.x;
    let newY = pos.y;

    if (e.key === 'ArrowUp' || e.key === 'w') newY--;
    if (e.key === 'ArrowDown' || e.key === 's') newY++;
    if (e.key === 'ArrowLeft' || e.key === 'a') newX--;
    if (e.key === 'ArrowRight' || e.key === 'd') newX++;

    if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE) {
      const tile = tiles[newY][newX];
      if (tile === 'rock') return;

      onMove({ x: newX, y: newY });

      // Encounter Logic
      if (tile === 'bush' && Math.random() < 0.25) {
        const possible = ['pyrocat', 'droplet', 'sprout'];
        const randomMonster = possible[Math.floor(Math.random() * possible.length)];
        onEncounter(randomMonster);
      }
    }
  }, [pos, tiles, onMove, onEncounter]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-green-950 overflow-hidden">
      <div 
        className="relative transition-all duration-200 ease-out"
        style={{
          transform: `translate(${-pos.x * TILE_SIZE}px, ${-pos.y * TILE_SIZE}px)`,
          width: GRID_SIZE * TILE_SIZE,
          height: GRID_SIZE * TILE_SIZE,
        }}
      >
        {tiles.map((row, y) => row.map((tile, x) => (
          <div 
            key={`${x}-${y}`}
            className="absolute border border-black/5 flex items-center justify-center text-3xl"
            style={{
              left: x * TILE_SIZE,
              top: y * TILE_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE,
              backgroundColor: tile === 'grass' ? '#2d4a22' : tile === 'bush' ? '#1b2e15' : '#4a5568'
            }}
          >
            {tile === 'bush' && '🌿'}
            {tile === 'rock' && '🪨'}
          </div>
        )))}

        {/* Player Character */}
        <div 
          className="absolute z-10 transition-all duration-200 flex items-center justify-center text-4xl"
          style={{
            left: pos.x * TILE_SIZE,
            top: pos.y * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
          }}
        >
          🚶‍♂️
        </div>
      </div>
    </div>
  );
};

export default WorldMap;
