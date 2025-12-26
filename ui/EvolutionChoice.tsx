
import React from 'react';
import { EvolutionOption, MonsterInstance } from '../domain/types';
import { MONSTER_DATA } from '../data/monsters';
import { ITEM_DATA } from '../data/items';

interface EvolutionChoiceProps {
  monster: MonsterInstance;
  options: EvolutionOption[];
  onChoose: (targetSpeciesId: string) => void;
  onCancel: () => void;
}

const EvolutionChoice: React.FC<EvolutionChoiceProps> = ({ monster, options, onChoose, onCancel }) => {
  const currentSpecies = MONSTER_DATA[monster.speciesId];

  return (
    <div className="fixed inset-0 bg-slate-950/90 z-[100] flex items-center justify-center p-8 backdrop-blur-md">
      <div className="bg-slate-900 border-2 border-indigo-500 w-full max-w-4xl rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(79,70,229,0.3)] flex flex-col">
        <div className="p-6 border-b border-slate-800 text-center">
          <h2 className="text-3xl font-black italic text-indigo-400 tracking-tighter uppercase animate-pulse">
            Evolution Triggered!
          </h2>
          <p className="text-slate-400 mt-2">
            {currentSpecies.name} (Lvl {monster.level}) is ready to transcend its current form.
          </p>
        </div>

        <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
          {options.map((opt) => {
            const target = MONSTER_DATA[opt.targetSpeciesId];
            const hpDiff = target.baseStats.hp - currentSpecies.baseStats.hp;
            const atkDiff = target.baseStats.attack - currentSpecies.baseStats.attack;
            const requiredItem = opt.requiredItemId ? ITEM_DATA[opt.requiredItemId] : null;

            return (
              <div 
                key={opt.targetSpeciesId}
                className="group bg-slate-800 border-2 border-slate-700 hover:border-indigo-500 p-6 rounded-xl transition-all hover:scale-[1.02] flex flex-col cursor-pointer"
                onClick={() => onChoose(opt.targetSpeciesId)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-6xl bg-slate-900 p-4 rounded-full border border-slate-700 group-hover:bg-indigo-950 transition">
                    {target.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{target.name}</h3>
                    <p className="text-indigo-400 text-sm font-mono uppercase">{target.type}</p>
                  </div>
                </div>

                <p className="text-slate-300 text-sm mb-4 italic">"{opt.description}"</p>

                {requiredItem && (
                    <div className="mb-4 p-2 bg-indigo-950/50 rounded-lg border border-indigo-500/30 flex items-center gap-2">
                        <span className="text-xl">{requiredItem.icon}</span>
                        <div className="text-[10px]">
                            <span className="text-indigo-300 font-bold block">REQUIRED ITEM</span>
                            <span className="text-white">{requiredItem.name}</span>
                        </div>
                    </div>
                )}

                <div className="space-y-2 mb-6 flex-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">HP GROWTH</span>
                    <span className="text-green-400">+{hpDiff}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">ATK GROWTH</span>
                    <span className="text-green-400">+{atkDiff}%</span>
                  </div>
                  <div className="mt-4">
                    <span className="text-[10px] text-slate-500 block mb-1 uppercase tracking-widest font-bold">New Skills Preview</span>
                    <div className="flex gap-2">
                      {opt.previewSkills.map(s => (
                        <span key={s} className="bg-slate-900 px-2 py-1 rounded text-[10px] text-indigo-300 border border-indigo-900">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors uppercase tracking-widest text-sm shadow-lg group-hover:shadow-indigo-500/20">
                  Select Path
                </button>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-center">
          <button onClick={onCancel} className="text-slate-500 hover:text-slate-300 text-xs uppercase tracking-widest font-bold transition">
            Not right now
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvolutionChoice;
