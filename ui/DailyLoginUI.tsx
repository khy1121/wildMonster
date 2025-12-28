import React, { useEffect, useState } from 'react';
import { GameState } from '../domain/types';
import { GameStateManager } from '../engine/GameStateManager';
import { DAILY_LOGIN_REWARDS, DailyReward } from '../data/dailyRewards';
import { Button } from './components/Button';

interface DailyLoginUIProps {
    gsm: GameStateManager;
    onClose: () => void;
}

export const DailyLoginUI: React.FC<DailyLoginUIProps> = ({ gsm, onClose }) => {
    const [state, setState] = useState<GameState>(gsm.getState());
    const [claimed, setClaimed] = useState(state.dailyLogin.claimedToday);
    const currentDay = state.dailyLogin.consecutiveDays || 1;

    const handleClaim = () => {
        const success = gsm.claimDailyLogin();
        if (success) {
            setClaimed(true);
            setState({ ...gsm.getState() });
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/95 z-[200] flex items-center justify-center p-4 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
            <div className="w-full max-w-lg bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-center">
                    <h2 className="text-2xl font-black text-white uppercase tracking-wider">Daily Login</h2>
                    <p className="text-amber-200 text-sm mt-1">Day {currentDay} Streak! 🔥</p>
                </div>

                {/* Reward Grid */}
                <div className="p-4">
                    <div className="grid grid-cols-7 gap-2">
                        {DAILY_LOGIN_REWARDS.map((reward) => {
                            const isCurrentDay = reward.day === ((currentDay - 1) % 7) + 1;
                            const isPast = reward.day < ((currentDay - 1) % 7) + 1;

                            return (
                                <div
                                    key={reward.day}
                                    className={`
                    relative p-2 rounded-xl border-2 text-center transition-all
                    ${isCurrentDay
                                            ? 'bg-amber-500/20 border-amber-500 scale-110 z-10 shadow-lg shadow-amber-500/30'
                                            : isPast
                                                ? 'bg-green-900/20 border-green-700 opacity-60'
                                                : 'bg-slate-800/50 border-slate-700'}
                  `}
                                >
                                    <div className="text-[10px] text-slate-400 font-bold">Day {reward.day}</div>
                                    <div className="text-xl my-1">
                                        {reward.gold > 0 ? '💰' : reward.items?.[0]?.itemId.includes('egg') ? '🥚' : '📦'}
                                    </div>
                                    <div className="text-[8px] text-slate-300 line-clamp-2">{reward.description}</div>

                                    {isPast && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                                            <span className="text-green-400 text-lg">✓</span>
                                        </div>
                                    )}

                                    {isCurrentDay && !claimed && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Action Area */}
                <div className="p-4 border-t border-slate-700 flex gap-4">
                    <Button variant="outline" size="md" onClick={onClose} className="flex-1">
                        Close
                    </Button>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleClaim}
                        disabled={claimed}
                        className="flex-1"
                    >
                        {claimed ? '✓ Claimed!' : 'Claim Reward'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
