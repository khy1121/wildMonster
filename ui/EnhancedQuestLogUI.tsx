import React, { useState } from 'react';
import { GameState, Quest, QuestType } from '../domain/types';
import { GameStateManager } from '../engine/GameStateManager';
import { QUEST_DATA, QUESTS } from '../data/quests';
import { Button } from './components/Button';
import { getTranslation } from '../localization/strings';

interface EnhancedQuestLogUIProps {
    gsm: GameStateManager;
    onClose: () => void;
}

type QuestFilter = 'all' | 'main' | 'side' | 'completed';

export const EnhancedQuestLogUI: React.FC<EnhancedQuestLogUIProps> = ({ gsm, onClose }) => {
    const [state, setState] = useState<GameState>(gsm.getState());
    const [filter, setFilter] = useState<QuestFilter>('all');
    const t = getTranslation(state.language);

    // Filter quests
    const activeQuests = QUEST_DATA.filter(q =>
        state.activeQuests.includes(q.id) || q.status === 'available'
    );

    const completedQuests = QUEST_DATA.filter(q =>
        state.completedQuests.includes(q.id)
    );

    let displayQuests: Quest[] = [];
    switch (filter) {
        case 'main':
            displayQuests = activeQuests.filter(q => q.type === 'main');
            break;
        case 'side':
            displayQuests = activeQuests.filter(q => q.type === 'side' || q.type === 'lore');
            break;
        case 'completed':
            displayQuests = completedQuests;
            break;
        default:
            displayQuests = activeQuests;
    }

    const getQuestProgress = (quest: Quest): number => {
        if (!quest.objectives) return 0;
        const completed = quest.objectives.filter(obj => obj.current >= obj.count).length;
        return (completed / quest.objectives.length) * 100;
    };

    const isQuestCompleted = (questId: string): boolean => {
        return state.completedQuests.includes(questId);
    };

    const getTypeColor = (type: QuestType): string => {
        switch (type) {
            case 'main': return 'amber';
            case 'side': return 'blue';
            case 'lore': return 'purple';
            case 'hidden': return 'red';
            default: return 'gray';
        }
    };

    const getTypeIcon = (type: QuestType): string => {
        switch (type) {
            case 'main': return '⭐';
            case 'side': return '📝';
            case 'lore': return '📚';
            case 'hidden': return '🔍';
            default: return '❓';
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/98 z-[200] flex flex-col p-4 md:p-8 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-5xl mx-auto flex flex-col h-full">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-wider">
                            {state.language === 'ko' ? '퀘스트 로그' : 'Quest Log'}
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">
                            {state.language === 'ko' ? '활성' : 'Active'}: {activeQuests.length} | {' '}
                            {state.language === 'ko' ? '완료' : 'Completed'}: {completedQuests.length}
                        </p>
                    </div>
                    <Button variant="outline" size="md" onClick={onClose} icon={<i className="fa-solid fa-times"></i>}>
                        {t.ui.close}
                    </Button>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase whitespace-nowrap transition ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        {t.ui.all}
                    </button>
                    <button
                        onClick={() => setFilter('main')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase whitespace-nowrap transition flex items-center gap-2 ${filter === 'main' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        ⭐ {state.language === 'ko' ? '메인' : 'Main'}
                    </button>
                    <button
                        onClick={() => setFilter('side')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase whitespace-nowrap transition flex items-center gap-2 ${filter === 'side' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        📝 {state.language === 'ko' ? '서브' : 'Side'}
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase whitespace-nowrap transition flex items-center gap-2 ${filter === 'completed' ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        ✓ {state.language === 'ko' ? '완료' : 'Completed'}
                    </button>
                </div>

                {/* Quest List */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                    {displayQuests.length === 0 ? (
                        <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-slate-800">
                            <p className="text-slate-500">
                                {state.language === 'ko'
                                    ? '표시할 퀘스트가 없습니다.'
                                    : 'No quests to display.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {displayQuests.map(quest => {
                                const progress = getQuestProgress(quest);
                                const completed = isQuestCompleted(quest.id);
                                const typeColor = getTypeColor(quest.type);
                                const typeIcon = getTypeIcon(quest.type);

                                return (
                                    <div
                                        key={quest.id}
                                        className={`
                      p-4 rounded-xl border-2 transition-all
                      ${completed
                                                ? 'bg-green-900/20 border-green-700 opacity-70'
                                                : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'}
                    `}
                                    >
                                        {/* Quest Header */}
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="text-3xl">{typeIcon}</div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-white font-bold text-lg">
                                                        {state.language === 'ko' && quest.nameKo ? quest.nameKo : quest.name}
                                                    </h3>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded bg-${typeColor}-900/50 text-${typeColor}-400 uppercase`}>
                                                        {quest.type}
                                                    </span>
                                                    {completed && (
                                                        <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                                                            ✓ {state.language === 'ko' ? '완료' : 'Done'}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-slate-400 text-sm mb-2">
                                                    {state.language === 'ko' && quest.descriptionKo ? quest.descriptionKo : quest.description}
                                                </p>

                                                {/* Quest Objectives */}
                                                {quest.objectives && quest.objectives.length > 0 && (
                                                    <div className="space-y-2 mb-3">
                                                        {quest.objectives.map((obj, idx) => (
                                                            <div key={idx} className="flex items-center gap-3">
                                                                <div className={`
                                  w-5 h-5 rounded flex items-center justify-center text-xs
                                  ${obj.current >= obj.count
                                                                        ? 'bg-green-600 text-white'
                                                                        : 'bg-slate-800 text-slate-400 border border-slate-600'}
                                `}>
                                                                    {obj.current >= obj.count ? '✓' : idx + 1}
                                                                </div>

                                                                <div className="flex-1">
                                                                    <p className={`text-sm ${obj.current >= obj.count ? 'text-green-400 line-through' : 'text-slate-300'}`}>
                                                                        {state.language === 'ko' && obj.descriptionKo ? obj.descriptionKo : obj.description}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                                            <div
                                                                                className={`h-full transition-all ${obj.current >= obj.count ? 'bg-green-500' : 'bg-indigo-500'}`}
                                                                                style={{ width: `${Math.min(100, (obj.current / obj.count) * 100)}%` }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-xs text-slate-500 font-mono w-16 text-right">
                                                                            {obj.current}/{obj.count}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Quest Rewards */}
                                                {quest.rewards && (
                                                    <div className="flex gap-3 text-xs text-slate-400">
                                                        {quest.rewards.gold > 0 && (
                                                            <span className="flex items-center gap-1">
                                                                💰 {quest.rewards.gold}G
                                                            </span>
                                                        )}
                                                        {quest.rewards.exp > 0 && (
                                                            <span className="flex items-center gap-1">
                                                                ⭐ {quest.rewards.exp} EXP
                                                            </span>
                                                        )}
                                                        {quest.rewards.items && quest.rewards.items.length > 0 && (
                                                            <span className="flex items-center gap-1">
                                                                📦 {quest.rewards.items.length} {state.language === 'ko' ? '아이템' : 'items'}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Overall Progress Bar */}
                                        {!completed && (
                                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800">
                                                <span className="text-xs text-slate-500">
                                                    {state.language === 'ko' ? '진행도' : 'Progress'}:
                                                </span>
                                                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-slate-400 font-bold w-12 text-right">
                                                    {Math.round(progress)}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer Stats */}
                <div className="mt-6 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex gap-6">
                            <span className="text-slate-400">
                                {state.language === 'ko' ? '메인 퀘스트 완료' : 'Main Quests Completed'}: {' '}
                                <span className="text-amber-400 font-bold">{state.storyProgress.mainQuestsCompleted.length}</span>
                            </span>
                            <span className="text-slate-400">
                                {state.language === 'ko' ? '현재 Act' : 'Current Act'}: {' '}
                                <span className="text-white font-bold">{state.storyProgress.currentAct}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
