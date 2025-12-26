
import React from 'react';
import { GameState } from '../domain/types';
import { QUEST_DATA } from '../data/quests';

interface QuestLogUIProps {
  state: GameState;
  onClose: () => void;
}

const QuestLogUI: React.FC<QuestLogUIProps> = ({ state, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/95 z-[150] flex flex-col items-center justify-center p-8 backdrop-blur-xl">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[70vh]">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">
            Quest <span className="text-indigo-500">Log</span>
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><i className="fa-solid fa-xmark text-xl"></i></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {QUEST_DATA.map(quest => {
            const isCompleted = state.completedQuests.includes(quest.id);
            return (
              <div 
                key={quest.id}
                className={`p-6 rounded-2xl border-2 transition-all ${isCompleted ? 'bg-slate-950/50 border-green-900/30 opacity-60' : 'bg-slate-950 border-slate-800'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`text-xl font-bold ${isCompleted ? 'text-green-500' : 'text-white'}`}>
                    {quest.title} {isCompleted && '✓'}
                  </h3>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {isCompleted ? 'COMPLETED' : 'ACTIVE'}
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-4">{quest.description}</p>
                
                <div className="flex gap-4">
                    <div className="text-[10px] bg-slate-900 px-3 py-1 rounded-full border border-slate-800 text-yellow-500 font-bold">
                        {quest.rewardGold} G
                    </div>
                    <div className="text-[10px] bg-slate-900 px-3 py-1 rounded-full border border-slate-800 text-indigo-400 font-bold">
                        {quest.rewardExp} EXP
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuestLogUI;
