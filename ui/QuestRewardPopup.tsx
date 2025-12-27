
import React from 'react';
import { Quest } from '../domain/types';
import { getTranslation } from '../localization/strings';
import { Modal } from './components/Modal';

interface QuestRewardPopupProps {
    quest: Quest;
    language: 'ko' | 'en';
    onClaim: () => void;
}

const QuestRewardPopup: React.FC<QuestRewardPopupProps> = ({ quest, language, onClaim }) => {
    const t = getTranslation(language);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-slate-900 border-2 border-indigo-500 rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(79,70,229,0.3)] animate-in zoom-in-95 duration-500 delay-150 fill-mode-both">

                {/* Decorative elements */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-xl animate-bounce">
                    <i className="fa-solid fa-trophy text-4xl text-yellow-400"></i>
                </div>

                <div className="mt-8 space-y-6">
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-1">
                            {t.ui.quest_completed || 'Quest Completed!'}
                        </h2>
                        <div className="h-1.5 w-24 bg-indigo-500 mx-auto rounded-full"></div>
                    </div>

                    <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5">
                        <h3 className="text-xl font-bold text-indigo-400 mb-2">{quest.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{quest.description}</p>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Rewards Received</p>
                        <div className="flex justify-center gap-4">
                            <div className="bg-slate-950 px-4 py-3 rounded-2xl border border-slate-800 flex flex-col items-center min-w-[80px]">
                                <span className="text-yellow-500 text-xl font-bold">{quest.rewardGold}</span>
                                <span className="text-[10px] text-slate-500 font-bold">GOLD</span>
                            </div>
                            <div className="bg-slate-950 px-4 py-3 rounded-2xl border border-slate-800 flex flex-col items-center min-w-[80px]">
                                <span className="text-indigo-400 text-xl font-bold">{quest.rewardExp}</span>
                                <span className="text-[10px] text-slate-500 font-bold">EXP</span>
                            </div>
                            {quest.rewardItems?.map((item, idx) => (
                                <div key={idx} className="bg-slate-950 px-4 py-3 rounded-2xl border border-slate-800 flex flex-col items-center min-w-[80px]">
                                    <span className="text-green-400 text-xl font-bold">x{item.quantity}</span>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase truncate max-w-[60px]">{item.itemId}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={onClaim}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg rounded-2xl transition-all shadow-lg shadow-indigo-900/40 active:scale-95 uppercase tracking-widest flex items-center justify-center gap-3"
                    >
                        {t.ui.claim_reward || 'Claim Rewards'}
                        <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuestRewardPopup;
