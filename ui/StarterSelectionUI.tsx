
import React, { useState } from 'react';
import { MONSTER_DATA } from '../data/monsters';
import { useTranslation } from '../localization/useTranslation';
import { MonsterSpecies, ElementType } from '../domain/types';

interface StarterSelectionUIProps {
    onSelect: (speciesId: string) => void;
}

const StarterSelectionUI: React.FC<StarterSelectionUIProps> = ({ onSelect }) => {
    const { t } = useTranslation();
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const starters = [
        MONSTER_DATA.ignis,
        MONSTER_DATA.aqualo,
        MONSTER_DATA.voltwing
    ];

    const getTypeColor = (type: ElementType) => {
        switch (type) {
            case ElementType.FIRE: return 'from-orange-500 to-red-600 shadow-orange-500/20';
            case ElementType.WATER: return 'from-blue-400 to-indigo-600 shadow-blue-500/20';
            case ElementType.ELECTRIC: return 'from-yellow-400 to-amber-600 shadow-yellow-500/20';
            default: return 'from-slate-400 to-slate-600';
        }
    };

    const getEvoPreivew = (species: MonsterSpecies) => {
        if (!species.evolutions || species.evolutions.length === 0) return null;
        return species.evolutions.map(evo => {
            const target = MONSTER_DATA[evo.targetSpeciesId];
            return (
                <div key={evo.targetSpeciesId} className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-800/80 mb-1 flex items-center justify-center text-xs">
                        {target?.icon}
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                        {(t.species as any)[evo.targetSpeciesId] || target?.name}
                    </span>
                </div>
            );
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 text-white overflow-y-auto">
            <div className="max-w-5xl w-full">
                <h1 className="text-4xl md:text-5xl font-bold text-center mb-2 animate-fade-in">
                    {t.ui.choose_starter}
                </h1>
                <p className="text-slate-400 text-center mb-12 animate-fade-in delay-100">
                    Your journey begins with a loyal companion. Choose wisely.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {starters.map((species, index) => (
                        <div
                            key={species.id}
                            onClick={() => setSelectedId(species.id)}
                            className={`
                relative bg-slate-900/60 rounded-3xl p-8 border-2 transition-all duration-300 cursor-pointer
                hover:scale-105 active:scale-95 flex flex-col items-center
                ${selectedId === species.id ? 'border-indigo-500 bg-slate-800/80 shadow-2xl' : 'border-white/5 hover:border-white/20'}
                animate-fade-in
              `}
                            style={{ animationDelay: `${(index + 2) * 150}ms` }}
                        >
                            <div className={`
                w-32 h-32 rounded-full bg-gradient-to-br mb-8 flex items-center justify-center text-6xl shadow-inner
                ${getTypeColor(species.type)}
              `}>
                                {species.icon}
                            </div>

                            <h3 className="text-3xl font-black mb-1 capitalize tracking-tight">
                                {(t.species as any)[species.id] || species.name}
                            </h3>

                            <div className="flex items-center space-x-2 mb-6">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border border-white/10 uppercase`}>
                                    {species.type}
                                </span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase">Level 1 Starter</span>
                            </div>

                            <div className="w-full grid grid-cols-5 gap-1 mb-8">
                                {Object.entries(species.baseStats).map(([stat, val]) => (
                                    <div key={stat} className="flex flex-col items-center">
                                        <span className="text-[8px] text-slate-500 uppercase font-black">{stat.slice(0, 3)}</span>
                                        <span className="text-xs font-bold text-white">{val}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="w-full h-px bg-white/5 mb-6" />

                            <div className="w-full">
                                <span className="text-[10px] text-slate-500 font-bold uppercase mb-4 block text-center tracking-widest">
                                    Evolution Track
                                </span>
                                <div className="flex justify-center items-start space-x-6">
                                    {getEvoPreivew(species)}
                                </div>
                            </div>

                            {selectedId === species.id && (
                                <div className="absolute top-4 right-4 text-indigo-400">
                                    <i className="fa-solid fa-circle-check text-2xl" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-16 flex justify-center">
                    <button
                        disabled={!selectedId}
                        onClick={() => selectedId && onSelect(selectedId)}
                        className={`
              px-16 py-5 rounded-2xl font-black text-xl transition-all transform tracking-widest uppercase
              ${selectedId
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-[0_0_40px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95 text-white'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
            `}
                    >
                        {t.ui.confirm_selection}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StarterSelectionUI;
