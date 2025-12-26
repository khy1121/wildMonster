
import React from 'react';
import { MonsterInstance } from '../types';
import { MONSTERS } from '../constants';

interface EvolutionOverlayProps {
  monster: MonsterInstance;
  onEvolve: (targetSpeciesId: string) => void;
  onCancel: () => void;
}

const EvolutionOverlay: React.FC<EvolutionOverlayProps> = ({ monster, onEvolve, onCancel }) => {
  const species = MONSTERS[monster.speciesId];
  const possibleEvolutions = species.evolutions.filter(ev => monster.level >= ev.levelThreshold);

  return (
    <div className="fixed inset-0 bg-indigo-950/90 z-[200] flex flex-col items-center justify-center text-white text-center p-8">
      <h1 className="text-4xl font-black italic tracking-tighter mb-8 animate-bounce">EVOLUTION TRIGGERED!</h1>
      
      <div className="flex items-center gap-12 mb-12">
        <div className="flex flex-col items-center">
          <div className="text-9xl mb-4 bg-white/10 rounded-full w-48 h-48 flex items-center justify-center shadow-2xl animate-pulse">
            {species.icon}
          </div>
          <p className="text-2xl font-bold">{species.name}</p>
          <p className="text-slate-400">LVL {monster.level}</p>
        </div>

        <div className="text-4xl text-slate-500 animate-pulse">
          <i className="fa-solid fa-arrow-right"></i>
        </div>

        <div className="flex flex-col items-center gap-4">
          {possibleEvolutions.map(ev => {
            const target = MONSTERS[ev.targetSpeciesId];
            return (
              <button 
                key={ev.targetSpeciesId}
                onClick={() => onEvolve(ev.targetSpeciesId)}
                className="group relative bg-white/10 hover:bg-white/20 border-2 border-white/20 p-6 rounded-2xl transition-all hover:scale-105"
              >
                <div className="text-6xl mb-2">{target.icon}</div>
                <p className="font-bold">{target.name}</p>
                <p className="text-xs text-indigo-300">{ev.description}</p>
                
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 blur transition -z-10"></div>
              </button>
            );
          })}
        </div>
      </div>

      <button onClick={onCancel} className="text-slate-400 hover:text-white mt-4 underline">Wait, maybe later...</button>
    </div>
  );
};

export default EvolutionOverlay;
