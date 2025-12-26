
import React from 'react';
import { GameState } from '../domain/types';
import { MONSTER_DATA } from '../data/monsters';

interface HUDProps {
  state: GameState;
  onOpenSkills: (uid: string) => void;
  onOpenMenu: () => void;
}

const HUD: React.FC<HUDProps> = ({ state, onOpenSkills, onOpenMenu }) => {
  const { tamer } = state;
  const activeMonster = tamer.party[0];
  const species = activeMonster ? MONSTER_DATA[activeMonster.speciesId] : null;

  return (
    <div className="absolute top-0 left-0 w-full p-4 pointer-events-none">
      <div className="flex justify-between items-start">
        {/* Tamer Info */}
        <div className="flex flex-col gap-2">
            <div className="bg-slate-900/90 border border-slate-700 p-3 rounded-xl pointer-events-auto flex items-center gap-4 shadow-2xl">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-2xl border-2 border-indigo-400">
                👤
              </div>
              <div>
                <h2 className="text-white font-bold leading-none">{tamer.name}</h2>
                <p className="text-slate-400 text-[10px] mt-1 uppercase tracking-wider font-mono">
                  LVL {tamer.level} • <span className="text-yellow-500">{tamer.gold}G</span>
                </p>
              </div>
            </div>
            
            <button 
                onClick={onOpenMenu}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-lg pointer-events-auto shadow-lg transition uppercase tracking-widest text-[10px] flex items-center gap-2"
            >
                <i className="fa-solid fa-bars"></i> Main Menu
            </button>
        </div>

        {/* Active Monster Info */}
        {activeMonster && species && (
          <div 
            className="bg-slate-900/90 border border-slate-700 p-3 rounded-xl pointer-events-auto flex items-center gap-4 shadow-2xl cursor-pointer hover:border-indigo-500 group transition"
            onClick={() => onOpenSkills(activeMonster.uid)}
          >
            <div className="text-3xl relative">
              {species.icon}
              {activeMonster.skillPoints > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-ping" />
              )}
            </div>
            <div className="w-32">
              <div className="flex justify-between text-[10px] text-white font-bold mb-1">
                <span className="group-hover:text-indigo-400 transition">{species.name}</span>
                <span>LVL {activeMonster.level}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div 
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${(activeMonster.currentHp / activeMonster.currentStats.maxHp) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="text-[8px] text-indigo-500 font-bold">{activeMonster.skillPoints} SP</span>
                <p className="text-[8px] text-slate-500 font-mono">
                  HP {activeMonster.currentHp}/{activeMonster.currentStats.maxHp}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HUD;
