import React, { useState } from 'react';
import { GameState } from '../domain/types';
import { GameStateManager } from '../engine/GameStateManager';
import { REGION_DATA, REGIONS } from '../data/regions';
import { PORTAL_DATA, PORTALS } from '../data/portals';
import { Button } from './components/Button';
import { getTranslation } from '../localization/strings';

interface WorldMapUIProps {
    gsm: GameStateManager;
    onClose: () => void;
    onTravelToRegion?: (regionId: string) => void;
}

export const WorldMapUI: React.FC<WorldMapUIProps> = ({ gsm, onClose, onTravelToRegion }) => {
    const [state, setState] = useState<GameState>(gsm.getState());
    const t = getTranslation(state.language);

    const currentRegion = REGIONS[state.currentRegion];
    const unlockedRegions = state.unlockedRegions;
    const unlockedPortals = state.unlockedPortals;

    // Get available portals from current region
    const availablePortals = PORTAL_DATA.filter(p =>
        p.fromRegion === state.currentRegion &&
        (unlockedPortals.includes(p.id) || p.unlockLevel === 1)
    );

    const handleTravel = (portalId: string) => {
        const portal = PORTALS[portalId];
        if (!portal) return;

        // Check unlock conditions
        if (portal.unlockLevel && state.tamer.level < portal.unlockLevel) {
            alert(state.language === 'ko'
                ? `레벨 ${portal.unlockLevel} 이상 필요합니다.`
                : `Level ${portal.unlockLevel} required.`);
            return;
        }

        if (portal.unlockQuest && !state.completedQuests.includes(portal.unlockQuest)) {
            alert(state.language === 'ko'
                ? '퀘스트를 먼저 완료해야 합니다.'
                : 'Complete the required quest first.');
            return;
        }

        // Travel to destination
        if (onTravelToRegion) {
            onTravelToRegion(portal.toRegion);
        }

        // Update state
        setState({ ...gsm.getState() });
    };

    const getRegionStatus = (regionId: string): 'current' | 'unlocked' | 'locked' => {
        if (regionId === state.currentRegion) return 'current';
        if (unlockedRegions.includes(regionId)) return 'unlocked';
        return 'locked';
    };

    return (
        <div className="fixed inset-0 bg-slate-950/98 z-[200] flex flex-col p-4 md:p-8 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-6xl mx-auto flex flex-col h-full">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-wider">
                            {state.language === 'ko' ? '세계 지도' : 'World Map'}
                        </h2>
                        <p className="text-amber-400 text-sm mt-1">
                            {state.language === 'ko' ? '현재 위치' : 'Current Location'}: {' '}
                            <span className="font-bold">
                                {state.language === 'ko' && currentRegion?.nameKo ? currentRegion.nameKo : currentRegion?.name}
                            </span>
                        </p>
                    </div>
                    <Button variant="outline" size="md" onClick={onClose} icon={<i className="fa-solid fa-times"></i>}>
                        {t.ui.close}
                    </Button>
                </div>

                {/* Main Content */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-auto custom-scrollbar">

                    {/* Left: Region List */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-xl font-bold text-white mb-2">
                            {state.language === 'ko' ? '지역 목록' : 'Regions'}
                        </h3>

                        {REGION_DATA.map(region => {
                            const status = getRegionStatus(region.id);
                            const isHub = region.isSafeZone;

                            return (
                                <div
                                    key={region.id}
                                    className={`
                    p-4 rounded-xl border-2 transition-all
                    ${status === 'current'
                                            ? 'bg-indigo-900/40 border-indigo-500 shadow-lg shadow-indigo-500/30'
                                            : status === 'unlocked'
                                                ? 'bg-slate-800/50 border-slate-600 hover:border-slate-500'
                                                : 'bg-slate-900/30 border-slate-800 opacity-50'}
                  `}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Region Icon/Element */}
                                        <div className={`
                      w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0
                      ${status === 'locked' ? 'grayscale' : ''}
                    `}>
                                            {isHub ? '🏛️' : region.element === 'FIRE' ? '🔥' : region.element === 'WATER' ? '🌊' : region.element === 'ELECTRIC' ? '⚡' : region.element === 'DARK' ? '🌑' : '🌿'}
                                        </div>

                                        {/* Region Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-white font-bold text-lg">
                                                    {state.language === 'ko' && region.nameKo ? region.nameKo : region.name}
                                                </h4>
                                                {status === 'current' && (
                                                    <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded">
                                                        {state.language === 'ko' ? '현재' : 'Current'}
                                                    </span>
                                                )}
                                                {status === 'locked' && (
                                                    <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded">
                                                        🔒 {state.language === 'ko' ? '잠김' : 'Locked'}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-slate-400 text-sm mb-2">
                                                {state.language === 'ko' && region.descriptionKo ? region.descriptionKo : region.description}
                                            </p>

                                            {!isHub && (
                                                <div className="flex gap-3 text-xs text-slate-500">
                                                    <span>
                                                        {state.language === 'ko' ? '테이머' : 'Tamer'} Lv.{region.levelRange.tamer.min}-{region.levelRange.tamer.max}
                                                    </span>
                                                    <span>|</span>
                                                    <span>
                                                        {state.language === 'ko' ? '와일더' : 'Wilder'} Lv.{region.levelRange.wilder.min}-{region.levelRange.wilder.max}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Right: Available Portals */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-xl font-bold text-white mb-2">
                            {state.language === 'ko' ? '이용 가능한 포털' : 'Available Portals'}
                        </h3>

                        {availablePortals.length === 0 ? (
                            <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-slate-800">
                                <p className="text-slate-500">
                                    {state.language === 'ko'
                                        ? '이 지역에서 사용할 수 있는 포털이 없습니다.'
                                        : 'No portals available from this region.'}
                                </p>
                            </div>
                        ) : (
                            availablePortals.map(portal => {
                                const destination = REGIONS[portal.toRegion];
                                const canTravel = (!portal.unlockLevel || state.tamer.level >= portal.unlockLevel) &&
                                    (!portal.unlockQuest || state.completedQuests.includes(portal.unlockQuest));

                                return (
                                    <button
                                        key={portal.id}
                                        onClick={() => canTravel && handleTravel(portal.id)}
                                        disabled={!canTravel}
                                        className={`
                      p-4 rounded-xl border-2 text-left transition-all
                      ${canTravel
                                                ? 'bg-slate-800/70 border-slate-600 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 cursor-pointer'
                                                : 'bg-slate-900/30 border-slate-800 opacity-50 cursor-not-allowed'}
                    `}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Portal Icon */}
                                            <div className="text-4xl">
                                                {portal.icon}
                                            </div>

                                            {/* Portal Info */}
                                            <div className="flex-1">
                                                <h4 className="text-white font-bold mb-1">
                                                    {state.language === 'ko' && portal.nameKo ? portal.nameKo : portal.name}
                                                </h4>
                                                <p className="text-slate-400 text-sm">
                                                    {state.language === 'ko' ? '목적지' : 'Destination'}: {' '}
                                                    <span className="text-amber-400">
                                                        {state.language === 'ko' && destination?.nameKo ? destination.nameKo : destination?.name}
                                                    </span>
                                                </p>

                                                {/* Requirements */}
                                                {!canTravel && (
                                                    <div className="mt-2 flex gap-2 text-xs">
                                                        {portal.unlockLevel && state.tamer.level < portal.unlockLevel && (
                                                            <span className="bg-red-900/30 text-red-400 px-2 py-0.5 rounded">
                                                                {state.language === 'ko' ? '레벨' : 'Lv'} {portal.unlockLevel}+ {state.language === 'ko' ? '필요' : 'required'}
                                                            </span>
                                                        )}
                                                        {portal.unlockQuest && !state.completedQuests.includes(portal.unlockQuest) && (
                                                            <span className="bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded">
                                                                {state.language === 'ko' ? '퀘스트 필요' : 'Quest required'}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Travel Arrow */}
                                            {canTravel && (
                                                <div className="text-indigo-400 text-2xl">
                                                    →
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-6 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex gap-6">
                            <span className="text-slate-400">
                                {state.language === 'ko' ? '잠금 해제된 지역' : 'Unlocked Regions'}: {' '}
                                <span className="text-white font-bold">{unlockedRegions.length}</span> / {REGION_DATA.length}
                            </span>
                            <span className="text-slate-400">
                                {state.language === 'ko' ? '파편 수집' : 'Fragments Collected'}: {' '}
                                <span className="text-amber-400 font-bold">{state.storyProgress.fragmentsCollected}</span> / 8
                            </span>
                        </div>
                        <div className="text-slate-500 text-xs">
                            {state.language === 'ko' ? '포털을 선택하여 이동하세요' : 'Select a portal to travel'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
