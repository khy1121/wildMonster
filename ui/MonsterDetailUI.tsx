
import React, { useState } from 'react';
import { MonsterInstance, Language, GameState } from '../domain/types';
import { MONSTER_DATA } from '../data/monsters';
import { getTranslation } from '../localization/strings';
import { Button } from './components/Button';
import { GameStateManager } from '../engine/GameStateManager';
import SkillTreeUI from './SkillTreeUI';
import { EnhancementUI } from './EnhancementUI';
import { EquipmentUI } from './EquipmentUI';

interface MonsterDetailUIProps {
    gsm: GameStateManager;
    monsterUid: string;
    onClose: () => void;
    language: Language;
}

type Tab = 'SKILLS' | 'ENHANCE' | 'EQUIP';

export const MonsterDetailUI: React.FC<MonsterDetailUIProps> = ({ gsm, monsterUid, onClose, language }) => {
    const t = getTranslation(language);
    const [activeTab, setActiveTab] = useState<Tab>('SKILLS');

    const state = gsm.getState();
    const monster = state.tamer.party.find(m => m.uid === monsterUid)
        || state.tamer.storage.find(m => m.uid === monsterUid);

    if (!monster) return null;

    const species = MONSTER_DATA[monster.speciesId];

    return (
        <div className="fixed inset-0 bg-slate-950/95 z-[150] flex flex-col items-center justify-center p-0 md:p-8 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full h-full flex flex-col max-w-6xl bg-slate-900/50 md:rounded-3xl border md:border-slate-800 overflow-hidden shadow-2xl">

                {/* Header with Tabs */}
                <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-slate-900 border-b border-slate-800 gap-4 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center text-3xl">
                            {species.icon}
                        </div>
                        <div>
                            <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">
                                {t.species[monster.speciesId as keyof typeof t.species] || species.name}
                            </h2>
                            <p className="text-xs text-slate-500 font-mono">LV.{monster.level}</p>
                        </div>
                    </div>

                    <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                        <button
                            onClick={() => setActiveTab('SKILLS')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'SKILLS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Skills
                        </button>
                        <button
                            onClick={() => setActiveTab('ENHANCE')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'ENHANCE' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Enhance
                        </button>
                        <button
                            onClick={() => setActiveTab('EQUIP')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'EQUIP' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Equip
                        </button>
                    </div>

                    <Button variant="outline" size="sm" onClick={onClose} icon={<i className="fa-solid fa-times"></i>}>
                        Close
                    </Button>
                </div>

                {/* Content Area */}
                <div className="flex-1 relative overflow-hidden">
                    {activeTab === 'SKILLS' && (
                        <SkillTreeUI
                            monster={monster}
                            onUnlock={id => gsm.unlockSkillNode(monster.uid, id)}
                            onClose={() => { }}
                            language={language}
                            embedded={true}
                        />
                    )}

                    {activeTab === 'ENHANCE' && (
                        <div className="h-full overflow-auto custom-scrollbar p-0">
                            <EnhancementUI gsm={gsm} monsterUid={monsterUid} onClose={() => { }} />
                        </div>
                    )}

                    {activeTab === 'EQUIP' && (
                        <EquipmentUI gsm={gsm} monsterUid={monsterUid} />
                    )}
                </div>
            </div>
        </div>
    );
};
