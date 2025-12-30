
import React, { useState, useEffect } from 'react';
import { gameStateManager } from '../engine/GameStateManager';
import { gameEvents } from '../engine/EventBus';
import { dataManager } from '../engine/DataManager';

interface GameHUDProps {
    children: React.ReactNode;
}

export const GameHUD: React.FC<GameHUDProps> = ({ children }) => {
    const [tamer, setTamer] = useState(gameStateManager.getState().tamer);
    const [party, setParty] = useState(gameStateManager.getState().tamer.party);

    useEffect(() => {
        const unsub = gameEvents.subscribe('STATE_UPDATED', (event) => {
            if (event.type === 'STATE_UPDATED') {
                setTamer(event.state.tamer);
                setParty(event.state.tamer.party);
            }
        });
        return () => unsub();
    }, []);

    const spPercent = (tamer.currentSpiritPoints / tamer.maxSpiritPoints) * 100;

    return (
        <div className="absolute inset-0 pointer-events-none z-10">
            {/* Top Left - Player Stats */}
            <div className="absolute top-4 left-4 pointer-events-auto">
                <div className="bg-slate-900/80 p-3 rounded-lg border border-indigo-500 shadow-lg backdrop-blur-sm">
                    <div className="text-white font-bold text-lg">{tamer.name}</div>
                    <div className="text-sm text-gray-300">Lv. {tamer.level}</div>

                    {/* Spirit Bar */}
                    <div className="mt-2 w-48 h-3 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 ease-out"
                            style={{ width: `${spPercent}%` }}
                        />
                    </div>
                    <div className="text-xs text-gray-400 mt-1 font-mono">
                        {tamer.currentSpiritPoints} / {tamer.maxSpiritPoints} SP
                    </div>
                </div>
            </div>

            {/* Bottom Left - Party Monsters */}
            <div className="absolute bottom-4 left-4 pointer-events-auto">
                <div className="flex gap-2">
                    {[0, 1, 2].map(index => {
                        const monster = party[index];
                        const species = monster ? dataManager.getMonsterSpecies(monster.speciesId) : null;

                        return (
                            <div
                                key={index}
                                className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center transition-all ${monster
                                        ? 'bg-slate-800 border-indigo-500 shadow-lg shadow-indigo-500/20'
                                        : 'bg-slate-900/50 border-slate-700'
                                    }`}
                            >
                                {species ? (
                                    <div className="text-center">
                                        <div className="text-2xl">{species.icon}</div>
                                        <div className="text-[8px] text-gray-400 font-mono">Lv.{monster.level}</div>
                                    </div>
                                ) : (
                                    <div className="text-slate-600 text-xs">Empty</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Top Bar Area (for existing HUD children) */}
            <div className="w-full pointer-events-auto">
                {children}
            </div>

            {/* Bottom Area (Can be used for notifications, hotbars, etc in the future) */}
            <div className="w-full flex justify-center pointer-events-auto">
                {/* Placeholder for future HUD elements */}
            </div>
        </div>
    );
};
