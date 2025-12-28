import React, { useState, useEffect } from 'react';
import { GameState, MonsterInstance } from '../domain/types';
import { GameStateManager } from '../engine/GameStateManager';
import { EXPEDITION_DATA, EXPEDITIONS } from '../data/expeditions';
import { MONSTER_DATA } from '../data/monsters';
import { Button } from './components/Button';
import { getTranslation } from '../localization/strings';

interface ExpeditionUIProps {
    gsm: GameStateManager;
    onClose: () => void;
}

export const ExpeditionUI: React.FC<ExpeditionUIProps> = ({ gsm, onClose }) => {
    const [state, setState] = useState<GameState>(gsm.getState());
    const [selectedExpedition, setSelectedExpedition] = useState<string | null>(null);
    const [selectedMonsters, setSelectedMonsters] = useState<string[]>([]);
    const [now, setNow] = useState(Date.now());

    const t = getTranslation(state.language);

    // Update time every second for countdown
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const availableMonsters = [...state.tamer.party, ...state.tamer.storage];
    const activeExpeditions = state.tamer.activeExpeditions || [];

    const handleSelectMonster = (uid: string) => {
        if (selectedMonsters.includes(uid)) {
            setSelectedMonsters(selectedMonsters.filter(id => id !== uid));
        } else {
            const exp = EXPEDITIONS[selectedExpedition || ''];
            if (exp && selectedMonsters.length < exp.requirements.partySize) {
                setSelectedMonsters([...selectedMonsters, uid]);
            }
        }
    };

    const handleStartExpedition = () => {
        if (!selectedExpedition || selectedMonsters.length === 0) return;

        const result = gsm.startExpedition(selectedExpedition, selectedMonsters);
        if (result.success) {
            setSelectedExpedition(null);
            setSelectedMonsters([]);
            setState({ ...gsm.getState() });
        } else {
            alert(result.message);
        }
    };

    const handleClaimExpedition = (expeditionId: string) => {
        const result = gsm.claimExpedition(expeditionId);
        if (result.success) {
            setState({ ...gsm.getState() });
            const rewardText = state.language === 'ko'
                ? `보상: ${result.rewards.gold} 골드, ${result.rewards.exp} 경험치, 아이템: ${result.rewards.items.join(', ') || '없음'}`
                : `Rewards: ${result.rewards.gold} Gold, ${result.rewards.exp} EXP, Items: ${result.rewards.items.join(', ') || 'None'}`;
            alert(rewardText);
        }
    };

    const formatTimeRemaining = (endTime: number): string => {
        const remaining = Math.max(0, endTime - now);
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    const formatDuration = (ms: number): string => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        return `${hours}h`;
    };

    return (
        <div className="fixed inset-0 bg-slate-950/95 z-[150] flex flex-col p-4 md:p-8 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-5xl mx-auto flex flex-col h-full">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider">{t.ui.expeditions}</h2>
                        <p className="text-slate-400 text-sm">
                            {state.language === 'ko' ? '슬롯' : 'Slots'}: {activeExpeditions.length} / {state.tamer.expeditionSlots}
                        </p>
                    </div>
                    <Button variant="outline" size="md" onClick={onClose} icon={<i className="fa-solid fa-times"></i>}>
                        {t.ui.close}
                    </Button>
                </div>

                {/* Active Expeditions */}
                {activeExpeditions.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-white mb-3">{t.ui.active_expeditions}</h3>
                        <div className="grid gap-3">
                            {activeExpeditions.map(active => {
                                const exp = EXPEDITIONS[active.expeditionId];
                                const isComplete = now >= active.endTime;

                                const displayName = state.language === 'ko' && exp?.nameKo
                                    ? exp.nameKo
                                    : exp?.name || 'Unknown';

                                return (
                                    <div
                                        key={active.expeditionId}
                                        className={`p-4 rounded-xl border-2 flex items-center gap-4 ${isComplete ? 'bg-green-900/30 border-green-500' : 'bg-slate-900/50 border-slate-700'
                                            }`}
                                    >
                                        <div className="text-3xl">{exp?.icon || '🗺️'}</div>
                                        <div className="flex-1">
                                            <h4 className="text-white font-bold">{displayName}</h4>
                                            <p className="text-slate-400 text-sm">
                                                {isComplete
                                                    ? `✅ ${t.ui.expedition_complete}`
                                                    : `${t.ui.time_remaining}: ${formatTimeRemaining(active.endTime)}`}
                                            </p>
                                        </div>
                                        {isComplete && (
                                            <Button variant="primary" size="sm" onClick={() => handleClaimExpedition(active.expeditionId)}>
                                                {t.ui.claim}
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Available Expeditions */}
                <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
                    {/* Expedition List */}
                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <h3 className="text-lg font-bold text-white mb-3">{t.ui.available}</h3>
                        <div className="grid gap-3">
                            {EXPEDITION_DATA.map(exp => {
                                const isSelected = selectedExpedition === exp.id;
                                const isActive = activeExpeditions.some(a => a.expeditionId === exp.id);

                                const displayName = state.language === 'ko' && exp.nameKo ? exp.nameKo : exp.name;
                                const displayDesc = state.language === 'ko' && exp.descriptionKo ? exp.descriptionKo : exp.description;

                                return (
                                    <button
                                        key={exp.id}
                                        onClick={() => !isActive && setSelectedExpedition(isSelected ? null : exp.id)}
                                        disabled={isActive}
                                        className={`
                      p-4 rounded-xl border-2 flex items-start gap-4 text-left transition-all
                      ${isActive
                                                ? 'opacity-40 cursor-not-allowed border-slate-800'
                                                : isSelected
                                                    ? 'bg-indigo-900/30 border-indigo-500'
                                                    : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}
                    `}
                                    >
                                        <div className="text-3xl">{exp.icon}</div>
                                        <div className="flex-1">
                                            <h4 className="text-white font-bold">{displayName}</h4>
                                            <p className="text-slate-400 text-sm mb-2">{displayDesc}</p>
                                            <div className="flex flex-wrap gap-2 text-xs">
                                                <span className="bg-slate-800 px-2 py-1 rounded text-slate-300">
                                                    ⏱️ {formatDuration(exp.duration)}
                                                </span>
                                                <span className="bg-slate-800 px-2 py-1 rounded text-slate-300">
                                                    👥 {exp.requirements.partySize} {state.language === 'ko' ? '마리' : `Monster${exp.requirements.partySize > 1 ? 's' : ''}`}
                                                </span>
                                                {exp.requirements.minLevel && (
                                                    <span className="bg-slate-800 px-2 py-1 rounded text-slate-300">
                                                        LV.{exp.requirements.minLevel}+
                                                    </span>
                                                )}
                                                {exp.requirements.element && (
                                                    <span className="bg-slate-800 px-2 py-1 rounded text-amber-400">
                                                        🔥 {exp.requirements.element}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2 text-xs">
                                                <span className="text-yellow-400">💰 {exp.rewards.gold}G</span>
                                                <span className="text-blue-400">⭐ {exp.rewards.exp} EXP</span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Monster Selection Panel */}
                    {selectedExpedition && (
                        <div className="w-full md:w-80 bg-slate-900 rounded-xl border border-slate-700 p-4 flex flex-col">
                            <h3 className="text-lg font-bold text-white mb-3">{t.ui.select_monsters}</h3>
                            <p className="text-slate-400 text-sm mb-3">
                                {t.ui.selected}: {selectedMonsters.length} / {EXPEDITIONS[selectedExpedition]?.requirements.partySize || 1}
                            </p>

                            <div className="flex-1 overflow-auto custom-scrollbar space-y-2">
                                {availableMonsters.map(monster => {
                                    const species = MONSTER_DATA[monster.speciesId];
                                    const isSelected = selectedMonsters.includes(monster.uid);

                                    return (
                                        <button
                                            key={monster.uid}
                                            onClick={() => handleSelectMonster(monster.uid)}
                                            className={`
                        w-full p-3 rounded-lg border-2 flex items-center gap-3 text-left transition
                        ${isSelected
                                                    ? 'bg-indigo-900/30 border-indigo-500'
                                                    : 'bg-slate-800 border-slate-700 hover:border-slate-500'}
                      `}
                                        >
                                            <div className="text-2xl">{species?.icon || '?'}</div>
                                            <div>
                                                <div className="text-white font-bold text-sm">{species?.name || monster.speciesId}</div>
                                                <div className="text-slate-400 text-xs">LV.{monster.level}</div>
                                            </div>
                                            {isSelected && <span className="ml-auto text-indigo-400">✓</span>}
                                        </button>
                                    );
                                })}
                            </div>

                            <Button
                                variant="primary"
                                size="full"
                                onClick={handleStartExpedition}
                                disabled={selectedMonsters.length !== EXPEDITIONS[selectedExpedition]?.requirements.partySize}
                                className="mt-4"
                            >
                                {t.ui.start_expedition}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
