
import React, { useState } from 'react';
import { CHARACTER_DATA } from '../data/characters';
import { useTranslation } from '@/localization/useTranslation';
import { Character } from '../domain/types';

interface CharacterSelectionUIProps {
    onSelect: (characterId: string) => void;
}

const CharacterSelectionUI: React.FC<CharacterSelectionUIProps> = ({ onSelect }) => {
    const { t } = useTranslation();
    const [selectedCharId, setSelectedCharId] = useState<string | null>(null);

    const characters = Object.values(CHARACTER_DATA);

    const getGlowColor = (charId: string) => {
        switch (charId) {
            case 'leo': return 'shadow-[0_0_30px_rgba(239,68,68,0.3)] border-red-500/50';
            case 'ken': return 'shadow-[0_0_30px_rgba(59,130,246,0.3)] border-blue-500/50'; // Scholar/Blue
            case 'elara': return 'shadow-[0_0_30px_rgba(34,197,94,0.3)] border-green-500/50'; // Mystic/Green
            case 'zoe': return 'shadow-[0_0_30px_rgba(168,85,247,0.3)] border-purple-500/50'; // Ranger/Purple
            default: return 'border-white/20';
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role.toLowerCase()) {
            case 'warrior': return <i className="fa-solid fa-shield-halved text-red-400 mr-2" />;
            case 'scholar': return <i className="fa-solid fa-microscope text-blue-400 mr-2" />;
            case 'mystic': return <i className="fa-solid fa-wand-sparkles text-green-400 mr-2" />;
            case 'ranger': return <i className="fa-solid fa-wind text-purple-400 mr-2" />;
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 text-white overflow-y-auto">
            <div className="max-w-6xl w-full">
                <h1 className="text-4xl md:text-5xl font-bold text-center mb-2 animate-fade-in bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                    {t.ui.select_hero}
                </h1>
                <p className="text-slate-400 text-center mb-12 animate-fade-in delay-100">
                    {t.ui.choose_tamer}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                    {characters.map((char, index) => (
                        <div
                            key={char.id}
                            onClick={() => setSelectedCharId(char.id)}
                            className={`
                relative group cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300
                bg-slate-900/50 backdrop-blur-sm hover:scale-105
                ${selectedCharId === char.id ? `${getGlowColor(char.id)} bg-slate-800/80 scale-105` : 'border-white/10 hover:border-white/30'}
                animate-fade-in
              `}
                            style={{ animationDelay: `${(index + 2) * 100}ms` }}
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-32 h-32 rounded-full bg-slate-800 mb-6 flex items-center justify-center overflow-hidden border-2 border-white/5 group-hover:border-white/20 transition-colors">
                                    {/* Placeholder icon if image missing, else show character emoji/icon */}
                                    <span className="text-6xl group-hover:scale-110 transition-transform duration-500">
                                        {char.id === 'leo' ? '⚔️' : char.id === 'ken' ? '🧪' : char.id === 'elara' ? '✨' : '🏹'}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-bold mb-1">{(t.characters as any)[char.id] || char.name}</h3>
                                <div className="flex items-center text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">
                                    {getRoleIcon(char.role)}
                                    {(t.roles as any)[char.role.toLowerCase()] || char.role}
                                </div>

                                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                                    {(t.ui as any)[`${char.role.toLowerCase()}_desc`] || char.description}
                                </p>

                                {char.startingBonus && (
                                    <div className="text-xs text-indigo-400 font-medium bg-indigo-500/10 px-3 py-1 rounded-full">
                                        Bonus: {Object.entries(char.startingBonus).map(([k, v]) => `${k.toUpperCase()} +${v}`).join(', ')}
                                    </div>
                                )}
                            </div>

                            {selectedCharId === char.id && (
                                <div className="absolute -top-3 -right-3 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-950">
                                    <i className="fa-solid fa-check" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-16 flex justify-center">
                    <button
                        disabled={!selectedCharId}
                        onClick={() => selectedCharId && onSelect(selectedCharId)}
                        className={`
              px-12 py-4 rounded-xl font-bold text-lg transition-all transform
              ${selectedCharId
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl hover:scale-105 active:scale-95 text-white'
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

export default CharacterSelectionUI;
