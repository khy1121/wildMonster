
import React, { useState } from 'react';
import { MonsterInstance, SkillNode, Language } from '../domain/types';
import { SKILL_TREES, SKILL_DATA } from '../data/skills';
import { MONSTER_DATA } from '../data/monsters';
import { getTranslation } from '../localization/strings';
import { Button } from './components/Button';

interface SkillTreeUIProps {
  monster: MonsterInstance;
  onUnlock: (nodeId: string) => void;
  onClose: () => void;
  language: Language;
}

const SkillTreeUI: React.FC<SkillTreeUIProps> = ({ monster, onUnlock, onClose, language }) => {
  const t = getTranslation(language);
  const tree = SKILL_TREES[monster.speciesId];
  const species = MONSTER_DATA[monster.speciesId];
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  if (!tree) return null;

  const selectedNode = tree.nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="fixed inset-0 bg-slate-950/95 z-[150] flex flex-col items-center justify-center p-0 md:p-8 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full h-full flex flex-col max-w-6xl">
        {/* Header */}
        <div className="p-4 md:px-0 md:pt-0 md:pb-6 flex justify-between items-center bg-slate-900 md:bg-transparent shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-900 border-2 border-slate-700 rounded-3xl flex items-center justify-center text-4xl md:text-5xl shadow-xl">
              {species.icon}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl md:text-4xl font-black italic text-white uppercase tracking-tighter truncate">
                {t.species[monster.speciesId as keyof typeof t.species] || species.name} 
                <span className="text-indigo-500 font-mono not-italic text-sm md:text-lg ml-2">{t.ui.skills}</span>
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-indigo-400 font-bold text-xs md:text-base bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {t.ui.spirit_points}: {monster.skillPoints}
                </p>
                <p className="text-slate-500 font-mono text-xs">LV.{monster.level}</p>
              </div>
            </div>
          </div>
          <Button variant="outline" size="md" onClick={onClose} icon={<i className="fa-solid fa-arrow-left"></i>}>
            {t.ui.back}
          </Button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 gap-6 min-h-0">
          {/* Tree Visualization */}
          <div className="flex-1 relative bg-slate-900/50 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 pointer-events-none opacity-10">
              {Array.from({ length: 72 }).map((_, i) => (
                <div key={i} className="border-[0.5px] border-indigo-500/30" />
              ))}
            </div>

            <div className="relative w-full h-full p-4 md:p-12 overflow-auto custom-scrollbar">
              <div className="relative min-w-[600px] min-h-[500px]">
                {/* SVG Connections (Simple straight lines) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {tree.nodes.map(node => node.prerequisites.map(preId => {
                    const preNode = tree.nodes.find(n => n.id === preId);
                    if (!preNode) return null;
                    const isUnlocked = monster.unlockedNodes.includes(node.id) && monster.unlockedNodes.includes(preId);
                    return (
                      <line 
                        key={`${preId}-${node.id}`}
                        x1={preNode.position.x * 120 + 48} 
                        y1={preNode.position.y * 120 + 48}
                        x2={node.position.x * 120 + 48} 
                        y2={node.position.y * 120 + 48}
                        stroke={isUnlocked ? "#6366f1" : "#1e293b"}
                        strokeWidth="3"
                        strokeDasharray={isUnlocked ? "0" : "4"}
                      />
                    );
                  }))}
                </svg>

                {tree.nodes.map(node => {
                  const isUnlocked = monster.unlockedNodes.includes(node.id);
                  const isSelected = selectedNodeId === node.id;
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
                      <button 
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`
                          relative w-24 h-24 rounded-2xl flex flex-col items-center justify-center p-2 text-center transition-all duration-300 border-2
                          ${isUnlocked ? 'bg-indigo-600 border-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 
                            isAvailable ? 'bg-slate-800 border-indigo-500 hover:scale-110 shadow-lg' : 
                            'bg-slate-950 border-slate-800 opacity-60 grayscale'}
                          ${isSelected ? 'ring-4 ring-white ring-offset-4 ring-offset-slate-900 scale-105 z-10' : ''}
                        `}
                      >
                        <div className="text-3xl mb-1">
                          {node.effect.type === 'skill' ? '⚔️' : '⚡'}
                        </div>
                        <span className="text-[10px] font-bold leading-tight text-white uppercase line-clamp-2">
                          {t.skill_nodes[node.id as keyof typeof t.skill_nodes] || node.name}
                        </span>
                        {!isUnlocked && (
                          <span className="text-[8px] text-indigo-300 mt-1 font-mono font-bold">{node.cost} SP</span>
                        )}
                        {isUnlocked && (
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-[10px] border-2 border-slate-900">
                            ✓
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Details Sidebar */}
          <div className="w-full md:w-80 bg-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col shrink-0 shadow-2xl">
            {selectedNode ? (
              <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-2xl border border-slate-700">
                    {selectedNode.effect.type === 'skill' ? '⚔️' : '⚡'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase leading-tight">
                      {t.skill_nodes[selectedNode.id as keyof typeof t.skill_nodes] || selectedNode.name}
                    </h3>
                    <p className="text-xs text-indigo-400 font-mono">{selectedNode.effect.type.toUpperCase()}</p>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{t.ui.reputation || 'Effect'}</p>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {t.skill_nodes[`${selectedNode.id}_desc` as keyof typeof t.skill_nodes] || selectedNode.description}
                    </p>
                  </div>

                  {selectedNode.effect.type === 'skill' && SKILL_DATA[selectedNode.effect.value as string] && (
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <p className="text-indigo-300 font-bold text-[10px] uppercase mb-1">New Skill Data</p>
                      <div className="flex justify-between items-center text-white font-bold text-sm">
                        <span>{t.skills[selectedNode.effect.value as string as keyof typeof t.skills] || SKILL_DATA[selectedNode.effect.value as string].name}</span>
                        <span className="text-red-400 font-mono">Pwr: {SKILL_DATA[selectedNode.effect.value as string].power}</span>
                      </div>
                    </div>
                  )}

                  {!monster.unlockedNodes.includes(selectedNode.id) && (
                    <div className="space-y-2">
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t.ui.locked || 'Requirements'}</p>
                       <div className="flex flex-col gap-1">
                          <div className={`text-[10px] flex justify-between ${monster.skillPoints >= selectedNode.cost ? 'text-green-400' : 'text-red-400'}`}>
                            <span>• Spirit Points</span>
                            <span>{monster.skillPoints}/{selectedNode.cost}</span>
                          </div>
                          {selectedNode.prerequisites.map(preId => {
                            const preNode = tree.nodes.find(n => n.id === preId);
                            const met = monster.unlockedNodes.includes(preId);
                            return (
                              <div key={preId} className={`text-[10px] flex justify-between ${met ? 'text-green-400' : 'text-red-400'}`}>
                                <span>• Required: {t.skill_nodes[preId as keyof typeof t.skill_nodes] || preNode?.name}</span>
                                <span>{met ? 'OK' : 'LOCKED'}</span>
                              </div>
                            );
                          })}
                       </div>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  {monster.unlockedNodes.includes(selectedNode.id) ? (
                    <div className="w-full py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 font-bold text-center text-xs uppercase tracking-widest">
                      Already Unlocked
                    </div>
                  ) : (
                    <Button 
                      variant="primary" 
                      size="full" 
                      disabled={!(!monster.unlockedNodes.includes(selectedNode.id) && monster.skillPoints >= selectedNode.cost && selectedNode.prerequisites.every(p => monster.unlockedNodes.includes(p)))}
                      onClick={() => onUnlock(selectedNode.id)}
                    >
                      Unlock for {selectedNode.cost} SP
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                <i className="fa-solid fa-circle-info text-4xl mb-4 text-slate-700"></i>
                <p className="text-sm text-slate-500 uppercase font-bold tracking-widest">Select a node<br/>to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillTreeUI;
