
import React from 'react';
import { GameState } from '../domain/types';
import { QUEST_DATA } from '../data/quests';
import { getTranslation } from '../localization/strings';
import { Modal } from './components/Modal';

interface QuestLogUIProps {
  state: GameState;
  onClose: () => void;
}

const QuestLogUI: React.FC<QuestLogUIProps> = ({ state, onClose }) => {
  const t = getTranslation(state.language);

  return (
    <Modal 
      title={<>{t.ui.quests} <span className="text-indigo-500">Log</span></>}
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
      <div className="p-4 md:p-6 space-y-3 md:space-y-4">
        {QUEST_DATA.map(quest => {
          const isCompleted = state.completedQuests.includes(quest.id);
          const isLocked = quest.requiredLevel && state.tamer.level < quest.requiredLevel;
          
          return (
            <div 
              key={quest.id}
              className={`p-4 md:p-6 rounded-2xl border-2 transition-all text-left ${
                isCompleted ? 'bg-slate-950/50 border-green-900/30 opacity-60' : 
                isLocked ? 'bg-slate-950/20 border-slate-900 opacity-40 grayscale' :
                'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-start mb-2 gap-2">
                <h3 className={`text-base md:text-xl font-bold ${
                  isCompleted ? 'text-green-500' : 
                  isLocked ? 'text-slate-600' : 
                  'text-white'
                }`}>
                  {isLocked ? '???' : (t.quests[quest.id as keyof typeof t.quests] || quest.title)} 
                  {isCompleted && ' ✓'}
                </h3>
                <div className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0 mt-1">
                  {isCompleted ? t.ui.completed : isLocked ? t.ui.locked : t.ui.active}
                </div>
              </div>
              
              <p className="text-slate-400 text-xs md:text-sm mb-4 leading-relaxed">
                {isLocked 
                  ? `${t.ui.tamer_lvl} ${quest.requiredLevel} ${t.ui.locked}` 
                  : (t.quests[`${quest.id}_desc` as keyof typeof t.quests] || quest.description)
                }
              </p>
              
              {!isLocked && (
                <div className="flex flex-wrap gap-2 md:gap-4">
                    <div className="text-[9px] md:text-[10px] bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 text-yellow-500 font-bold flex items-center gap-1">
                        <i className="fa-solid fa-coins"></i> {quest.rewardGold} G
                    </div>
                    <div className="text-[9px] md:text-[10px] bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 text-indigo-400 font-bold flex items-center gap-1">
                        <i className="fa-solid fa-star"></i> {quest.rewardExp} EXP
                    </div>
                    {quest.rewardItems && quest.rewardItems.length > 0 && (
                      <div className="text-[9px] md:text-[10px] bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 text-green-400 font-bold flex items-center gap-1">
                        <i className="fa-solid fa-box"></i> {quest.rewardItems.length} Items
                      </div>
                    )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

export default QuestLogUI;
