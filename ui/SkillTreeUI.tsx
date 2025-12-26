
import React from 'react';
import { MonsterInstance, SkillNode } from '../domain/types';
import { SKILL_TREES, SKILL_DATA } from '../data/skills';
import { MONSTER_DATA } from '../data/monsters';

interface SkillTreeUIProps {
  monster: MonsterInstance;
  onUnlock: (nodeId: string) => void;
  onClose: () => void;
}

const SkillTreeUI: React.FC<SkillTreeUIProps> = ({ monster, onUnlock, onClose }) => {
  const tree = SKILL_TREES[monster.speciesId];
  const species = MONSTER_DATA[monster.speciesId];

  if (!tree) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/95 z-[150] flex flex-col items-center justify-center p-8 backdrop-blur-xl">
      <div className="w-full max-w-5xl h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-4">
              <span className="text-6xl">{species.icon}</span>
              <div>
                <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">
                  {species.name} <span className="text-slate-500 font-mono not-italic text-lg">SKILL TREE</span>
                </h2>
                <p className="text-indigo-400 font-bold">SPIRIT POINTS: {monster.skillPoints}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg border border-slate-700 transition uppercase tracking-widest text-xs"
          >
            Back to World
          </button>
        </div>

        {/* Tree Grid */}
        <div className="flex-1 relative bg-slate-900/50 rounded-3xl border border-slate-800 overflow-hidden shadow-inner">
          <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 pointer-events-none opacity-20">
            {Array.from({ length: 72 }).map((_, i) => (
              <div key={i} className="border-[0.5px] border-indigo-500/20" />
            ))}
          </div>

          <div className="relative w-full h-full p-12 overflow-auto">
            {tree.nodes.map(node => {
              const isUnlocked = monster.unlockedNodes.includes(node.id);
              const canAfford = monster.skillPoints >= node.cost;
              const prereqsMet = node.prerequisites.every(p => monster.unlockedNodes.includes(p));
              const isAvailable = !isUnlocked && canAfford && prereqsMet;

              return (
                <div 
                  key={node.id}
                  className="absolute"
                  style={{ 
                    left: `${node.position.x * 120}px`, 
                    top: `${node.position.y * 120}px` 
                  }}
                >
                  <div 
                    onClick={() => isAvailable && onUnlock(node.id)}
                    className={`
                      relative w-24 h-24 rounded-2xl flex flex-col items-center justify-center p-2 text-center transition-all duration-300
                      ${isUnlocked ? 'bg-indigo-600 border-2 border-indigo-300 shadow-[0_0_20px_rgba(129,140,248,0.5)] cursor-default' : 
                        isAvailable ? 'bg-slate-800 border-2 border-indigo-500 cursor-pointer hover:scale-110 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 
                        'bg-slate-950 border-2 border-slate-800 opacity-50 cursor-not-allowed grayscale'}
                    `}
                  >
                    {/* Node Visuals */}
                    <div className="text-2xl mb-1">
                      {node.effect.type === 'skill' ? '⚔️' : '⚡'}
                    </div>
                    <span className="text-[10px] font-bold leading-none text-white uppercase">{node.name}</span>
                    <span className="text-[8px] text-indigo-300 mt-1">{node.cost} SP</span>

                    {/* Tooltip on hover */}
                    <div className="absolute top-full mt-2 w-48 bg-black/90 p-3 rounded-xl border border-slate-700 opacity-0 group-hover:opacity-100 pointer-events-none transition z-50 shadow-2xl">
                      <p className="text-[10px] text-white font-bold mb-1">{node.description}</p>
                      <div className="h-px bg-slate-800 my-1" />
                      <p className="text-[8px] text-slate-400">
                        EFFECT: {node.effect.type === 'skill' ? `Unlocks ${SKILL_DATA[node.effect.value as string].name}` : `Permanent Stat Bonus`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillTreeUI;
