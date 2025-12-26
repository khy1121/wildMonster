
import React from 'react';
import { EvolutionOption, MonsterInstance, Language } from '../domain/types';
import { MONSTER_DATA } from '../data/monsters';
import { ITEM_DATA } from '../data/items';
import { getTranslation } from '../localization/strings';
import { Modal } from './components/Modal';
import { Button } from './components/Button';

interface EvolutionChoiceProps {
  monster: MonsterInstance;
  options: EvolutionOption[];
  onChoose: (targetSpeciesId: string) => void;
  onCancel: () => void;
  language: Language;
}

const EvolutionChoice: React.FC<EvolutionChoiceProps> = ({ monster, options, onChoose, onCancel, language }) => {
  const t = getTranslation(language);
  const currentSpecies = MONSTER_DATA[monster.speciesId];

  return (
    <Modal
      title={<span className="text-indigo-400 animate-pulse">{t.ui.evolution_triggered}</span>}
      onClose={onCancel}
      footer={
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={onCancel}>{t.ui.not_now}</Button>
        </div>
      }
    >
      <div className="p-4 md:p-8">
        <div className="text-center mb-8 bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
          <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Current Form</p>
          <div className="flex items-center justify-center gap-4">
             <span className="text-5xl">{currentSpecies.icon}</span>
             <div className="text-left">
                <h3 className="text-2xl font-bold text-white leading-none mb-1">
                  {t.species[monster.speciesId as keyof typeof t.species] || currentSpecies.name}
                </h3>
                <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">LV. {monster.level} • {currentSpecies.type}</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {options.map((opt) => {
            const target = MONSTER_DATA[opt.targetSpeciesId];
            // Calculate actual percentage growth for stats
            const hpGrowth = Math.round(((target.baseStats.hp - currentSpecies.baseStats.hp) / currentSpecies.baseStats.hp) * 100);
            const atkGrowth = Math.round(((target.baseStats.attack - currentSpecies.baseStats.attack) / currentSpecies.baseStats.attack) * 100);
            const requiredItem = opt.requiredItemId ? ITEM_DATA[opt.requiredItemId] : null;
            const hasItem = opt.requiredItemId ? monster.unlockedNodes.includes(opt.requiredNodeId || '') : true; // Assuming node check for simplicity or context

            return (
              <div 
                key={opt.targetSpeciesId}
                className="group relative bg-slate-800 border-2 border-slate-700 hover:border-indigo-500 p-6 rounded-3xl transition-all flex flex-col cursor-pointer active:bg-indigo-950/20 overflow-hidden"
                onClick={() => onChoose(opt.targetSpeciesId)}
              >
                {/* Glow Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-center gap-5 mb-6 relative z-10">
                  <div className="text-6xl md:text-7xl bg-slate-900 p-4 rounded-3xl border border-slate-700 group-hover:bg-indigo-950 group-hover:border-indigo-500 transition-all duration-500 shadow-xl group-hover:scale-110">
                    {target.icon}
                  </div>
                  <div className="min-w-0 text-left">
                    <h3 className="text-2xl md:text-3xl font-black italic text-white truncate uppercase tracking-tighter">
                      {t.species[opt.targetSpeciesId as keyof typeof t.species] || target.name}
                    </h3>
                    <p className="text-indigo-400 text-xs font-mono uppercase tracking-widest font-bold">Evolution Path</p>
                  </div>
                </div>

                <div className="flex-1 relative z-10">
                  <p className="text-slate-300 text-sm mb-6 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-700/50">
                    {opt.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-700 text-left">
                      <span className="block text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">{t.ui.hp} Growth</span>
                      <div className="flex items-end gap-1">
                        <span className="text-green-400 font-black text-xl">+{hpGrowth}%</span>
                        <span className="text-[10px] text-slate-600 mb-1 font-mono">Potential</span>
                      </div>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-700 text-left">
                      <span className="block text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">{t.ui.atk} Growth</span>
                      <div className="flex items-end gap-1">
                        <span className="text-green-400 font-black text-xl">+{atkGrowth}%</span>
                        <span className="text-[10px] text-slate-600 mb-1 font-mono">Potential</span>
                      </div>
                    </div>
                  </div>

                  {requiredItem && (
                      <div className="mb-6 p-3 bg-indigo-950/30 rounded-2xl border border-indigo-500/40 flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-2xl border border-indigo-500/20">
                            {requiredItem.icon}
                          </div>
                          <div className="text-left flex-1 min-w-0">
                              <span className="text-indigo-300 font-black text-[9px] block uppercase tracking-widest">{t.ui.required_item}</span>
                              <span className="text-white font-bold text-sm truncate block">{t.items[requiredItem.id as keyof typeof t.items] || requiredItem.name}</span>
                          </div>
                          <i className="fa-solid fa-check text-green-500 ml-2"></i>
                      </div>
                  )}
                </div>

                <Button variant="primary" size="lg" className="w-full relative z-10 shadow-xl group-hover:scale-[1.02]">
                  {t.ui.select_path}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

export default EvolutionChoice;
