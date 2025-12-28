import React, { useState } from 'react';
import { GameState, AchievementCategory } from '../domain/types';
import { GameStateManager } from '../engine/GameStateManager';
import { ACHIEVEMENT_DATA, ACHIEVEMENTS } from '../data/achievements';
import { Button } from './components/Button';

interface AchievementsUIProps {
    gsm: GameStateManager;
    onClose: () => void;
}

const CATEGORY_INFO: Record<AchievementCategory, { label: string; color: string; icon: string }> = {
    combat: { label: 'Combat', color: 'red', icon: '⚔️' },
    collection: { label: 'Collection', color: 'blue', icon: '📚' },
    progression: { label: 'Progression', color: 'green', icon: '⬆️' },
    economy: { label: 'Economy', color: 'yellow', icon: '💰' }
};

export const AchievementsUI: React.FC<AchievementsUIProps> = ({ gsm, onClose }) => {
    const [state, setState] = useState<GameState>(gsm.getState());
    const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'all'>('all');

    const filteredAchievements = activeCategory === 'all'
        ? ACHIEVEMENT_DATA
        : ACHIEVEMENT_DATA.filter(a => a.category === activeCategory);

    const handleClaim = (achievementId: string) => {
        gsm.claimAchievementReward(achievementId);
        setState({ ...gsm.getState() });
    };

    const getProgress = (achievementId: string): number => {
        return state.tamer.achievementProgress[achievementId] || 0;
    };

    const isUnlocked = (achievementId: string): boolean => {
        return state.tamer.unlockedAchievements.includes(achievementId);
    };

    const isClaimed = (achievementId: string): boolean => {
        return !!state.flags[`achievement_claimed_${achievementId}`];
    };

    return (
        <div className="fixed inset-0 bg-slate-950/95 z-[150] flex flex-col p-4 md:p-8 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-4xl mx-auto flex flex-col h-full">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider">Achievements</h2>
                        <p className="text-slate-400 text-sm">
                            {state.tamer.unlockedAchievements.length} / {ACHIEVEMENT_DATA.length} Unlocked
                        </p>
                    </div>
                    <Button variant="outline" size="md" onClick={onClose} icon={<i className="fa-solid fa-times"></i>}>
                        Close
                    </Button>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase whitespace-nowrap transition ${activeCategory === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        All
                    </button>
                    {(Object.keys(CATEGORY_INFO) as AchievementCategory[]).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase whitespace-nowrap transition flex items-center gap-2 ${activeCategory === cat
                                    ? `bg-${CATEGORY_INFO[cat].color}-600 text-white`
                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                        >
                            <span>{CATEGORY_INFO[cat].icon}</span>
                            {CATEGORY_INFO[cat].label}
                        </button>
                    ))}
                </div>

                {/* Achievement List */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                    <div className="grid gap-3">
                        {filteredAchievements.map(achievement => {
                            const progress = getProgress(achievement.id);
                            const unlocked = isUnlocked(achievement.id);
                            const claimed = isClaimed(achievement.id);
                            const progressPercent = Math.min(100, (progress / achievement.target) * 100);
                            const catInfo = CATEGORY_INFO[achievement.category];

                            return (
                                <div
                                    key={achievement.id}
                                    className={`
                    p-4 rounded-xl border-2 flex items-center gap-4 transition-all
                    ${unlocked && !claimed
                                            ? 'bg-amber-900/30 border-amber-500 animate-pulse'
                                            : claimed
                                                ? 'bg-green-900/20 border-green-700 opacity-60'
                                                : 'bg-slate-900/50 border-slate-700'}
                  `}
                                >
                                    {/* Icon */}
                                    <div className={`
                    w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0
                    ${unlocked ? 'bg-amber-500/20' : 'bg-slate-800'}
                  `}>
                                        {achievement.icon}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-white font-bold truncate">{achievement.name}</h3>
                                            <span className={`text-[10px] px-2 py-0.5 rounded bg-${catInfo.color}-900/50 text-${catInfo.color}-400 uppercase`}>
                                                {catInfo.label}
                                            </span>
                                        </div>
                                        <p className="text-slate-400 text-sm mb-2 line-clamp-1">{achievement.description}</p>

                                        {/* Progress Bar */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 ${unlocked ? 'bg-green-500' : 'bg-indigo-500'}`}
                                                    style={{ width: `${progressPercent}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-slate-400 font-mono w-16 text-right">
                                                {progress}/{achievement.target}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="shrink-0">
                                        {claimed ? (
                                            <div className="text-green-400 text-sm font-bold">✓ Claimed</div>
                                        ) : unlocked ? (
                                            <Button variant="primary" size="sm" onClick={() => handleClaim(achievement.id)}>
                                                Claim
                                            </Button>
                                        ) : (
                                            <div className="text-slate-600 text-xs">🔒</div>
                                        )}
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
