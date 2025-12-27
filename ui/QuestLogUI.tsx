
import React from 'react';
import { GameState, Quest } from '../domain/types';
import { QUEST_DATA } from '../data/quests';
import { getTranslation } from '../localization/strings';
import { Modal } from './components/Modal';
import { gameStateManager } from '../engine/GameStateManager';

interface QuestLogUIProps {
  state: GameState;
  onClose: () => void;
}

const QuestLogUI: React.FC<QuestLogUIProps> = ({ state, onClose }) => {
  const t = getTranslation(state.language);

  const activeQuests = QUEST_DATA.filter(q => state.activeQuests.includes(q.id));
  const pendingQuests = QUEST_DATA.filter(q => state.pendingRewards.includes(q.id));
  const completedQuests = QUEST_DATA.filter(q => state.completedQuests.includes(q.id));

  const renderQuestCard = (quest: Quest, status: 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'LOCKED') => {
    const isLocked = status === 'LOCKED';
    const isCompleted = status === 'COMPLETED';
    const isPending = status === 'PENDING';

    // Progress for active quests
    const currentProgress = (state.flags[`quest_progress_${quest.id}`] as number) || 0;
    const progressPercent = quest.progressMax ? Math.min(100, (currentProgress / quest.progressMax) * 100) : 0;

    return (
      <div
        key={quest.id}
        className={`p-4 md:p-6 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${isCompleted ? 'bg-slate-950/50 border-green-900/30 opacity-60' :
          isPending ? 'bg-indigo-950/20 border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.1)]' :
            isLocked ? 'bg-slate-950/20 border-slate-900 opacity-40 grayscale' :
              'bg-slate-950 border-slate-800 hover:border-slate-700'
          }`}
      >
        {/* Background Accent for Categories */}
        <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-5 blur-3xl pointer-events-none ${quest.category === 'DAILY' ? 'bg-yellow-500' :
          quest.category === 'WEEKLY' ? 'bg-purple-500' :
            quest.category === 'STORY' ? 'bg-indigo-500' : 'bg-green-500'
          }`} />

        <div className="flex justify-between items-start mb-2 gap-2 relative z-10">
          <div className="flex flex-col gap-1">
            <div className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/5 w-fit ${quest.category === 'DAILY' ? 'text-yellow-500 bg-yellow-500/10' :
              quest.category === 'WEEKLY' ? 'text-purple-400 bg-purple-400/10' :
                quest.category === 'STORY' ? 'text-indigo-400 bg-indigo-400/10' : 'text-green-500 bg-green-500/10'
              }`}>
              {quest.category}
            </div>
            <h3 className={`text-base md:text-xl font-bold ${isCompleted ? 'text-green-500' :
              isLocked ? 'text-slate-600' :
                isPending ? 'text-indigo-400' : 'text-white'
              }`}>
              {isLocked ? '???' : (t.quests[quest.id as keyof typeof t.quests] || quest.title)}
              {isCompleted && ' ✓'}
            </h3>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0 mt-1">
              {isCompleted ? t.ui.completed : isLocked ? t.ui.locked : isPending ? (t.ui.pending || 'Pending') : t.ui.active}
            </div>

            {(status === 'ACTIVE' && quest.category !== 'STORY' && !state.flags['rerolled_today']) && (
              <button
                onClick={() => gameStateManager.rerollQuest(quest.id)}
                className="text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2 py-1 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                title="Reroll Quest"
              >
                <i className="fa-solid fa-rotate"></i> Reroll
              </button>
            )}
          </div>
        </div>

        <p className="text-slate-400 text-xs md:text-sm mb-4 leading-relaxed relative z-10">
          {isLocked
            ? `${t.ui.tamer_lvl} ${quest.requiredLevel} ${t.ui.locked}`
            : (t.quests[`${quest.id}_desc` as keyof typeof t.quests] || quest.description)
          }
        </p>

        {/* Progress Bar for ACTIVE/PENDING */}
        {quest.progressMax && (status === 'ACTIVE' || status === 'PENDING') && (
          <div className="mb-4 space-y-1.5 relative z-10">
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-slate-500">PROGRESS</span>
              <span className="text-indigo-400">{currentProgress} / {quest.progressMax}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
              <div
                className={`h-full transition-all duration-500 rounded-full ${isPending ? 'bg-indigo-500' : 'bg-slate-700'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 mt-auto relative z-10">
          {!isLocked && (
            <div className="flex flex-wrap gap-2 md:gap-4">
              <div className="text-[9px] md:text-[10px] bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800 text-yellow-500 font-bold flex items-center gap-1">
                <i className="fa-solid fa-coins"></i> {quest.rewardGold} G
              </div>
              <div className="text-[9px] md:text-[10px] bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800 text-indigo-400 font-bold flex items-center gap-1">
                <i className="fa-solid fa-star"></i> {quest.rewardExp} EXP
              </div>
              {quest.rewardItems && quest.rewardItems.length > 0 && (
                <div className="text-[9px] md:text-[10px] bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800 text-green-400 font-bold flex items-center gap-1">
                  <i className="fa-solid fa-box"></i> {quest.rewardItems.length} Items
                </div>
              )}
            </div>
          )}

          {isPending && (
            <button
              onClick={() => gameStateManager.claimQuestReward(quest.id)}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-indigo-950/20 active:scale-90 uppercase tracking-widest"
            >
              Claim Reward
            </button>
          )}

          {status === 'ACTIVE' && quest.category !== 'STORY' && !state.flags['rerolled_today'] && (
            <button
              onClick={() => gameStateManager.rerollQuest(quest.id)}
              className="p-2 bg-slate-800 hover:bg-red-900 border border-slate-700 text-slate-400 hover:text-white rounded-lg transition-all active:scale-90"
              title="Reroll Quest"
            >
              <i className="fa-solid fa-arrows-rotate"></i>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Modal
      title={<>{t.ui.quests} <span className="text-indigo-500">Log</span></>}
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
      <div className="p-4 md:p-6 space-y-4">
        {/* Active & Pending Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Quests</h4>
          </div>
          {pendingQuests.map(q => renderQuestCard(q, 'PENDING'))}
          {activeQuests.map(q => renderQuestCard(q, 'ACTIVE'))}
          {activeQuests.length === 0 && pendingQuests.length === 0 && (
            <div className="py-8 text-center bg-slate-950/20 rounded-2xl border-2 border-dashed border-slate-900">
              <p className="text-slate-600 text-sm font-bold uppercase tracking-widest italic">No active quests</p>
            </div>
          )}
        </div>

        {/* Story/Locked Section */}
        {QUEST_DATA.filter(q => q.category === 'STORY' && !state.activeQuests.includes(q.id) && !state.completedQuests.includes(q.id)).length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-4 bg-slate-700 rounded-full"></div>
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Story & Locked</h4>
            </div>
            {QUEST_DATA.filter(q => q.category === 'STORY' && !state.activeQuests.includes(q.id) && !state.completedQuests.includes(q.id)).map(q => {
              const isLocked = q.requiredLevel && state.tamer.level < q.requiredLevel;
              return renderQuestCard(q, isLocked ? 'LOCKED' : 'ACTIVE');
            })}
          </div>
        )}

        {/* Completed Section */}
        {completedQuests.length > 0 && (
          <div className="space-y-3 opacity-60">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-4 bg-green-900 rounded-full"></div>
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Recently Completed</h4>
            </div>
            {completedQuests.map(q => renderQuestCard(q, 'COMPLETED'))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default QuestLogUI;
