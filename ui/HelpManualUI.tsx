import React, { useState } from 'react';
import { HELP_TOPICS } from '../data/tutorials';

interface HelpManualUIProps {
    language: 'en' | 'ko';
    onClose: () => void;
}

export const HelpManualUI: React.FC<HelpManualUIProps> = ({ language, onClose }) => {
    const [selectedTopic, setSelectedTopic] = useState(HELP_TOPICS[0].id);

    const currentTopic = HELP_TOPICS.find(t => t.id === selectedTopic) || HELP_TOPICS[0];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-slate-900 border-2 border-blue-500 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-6 py-4 border-b-2 border-blue-500 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="text-3xl">📖</span>
                        {language === 'ko' ? '도움말 매뉴얼' : 'Help Manual'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-red-400 text-3xl leading-none transition"
                    >
                        ×
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-64 bg-slate-800 border-r border-slate-700 overflow-y-auto">
                        <div className="p-4 space-y-2">
                            {HELP_TOPICS.map(topic => (
                                <button
                                    key={topic.id}
                                    onClick={() => setSelectedTopic(topic.id)}
                                    className={`w-full text-left px-4 py-3 rounded-lg font-bold transition flex items-center gap-3 ${selectedTopic === topic.id
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                        }`}
                                >
                                    <span className="text-2xl">{topic.icon}</span>
                                    <span>{language === 'ko' ? topic.titleKo : topic.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="text-4xl">{currentTopic.icon}</span>
                            {language === 'ko' ? currentTopic.titleKo : currentTopic.title}
                        </h3>

                        <div className="space-y-6">
                            {currentTopic.sections.map((section, index) => (
                                <div
                                    key={index}
                                    className="bg-slate-800 border border-slate-600 rounded-xl p-5"
                                >
                                    <h4 className="text-xl font-bold text-blue-400 mb-3">
                                        {language === 'ko' ? section.titleKo : section.title}
                                    </h4>
                                    <p className="text-slate-300 leading-relaxed">
                                        {language === 'ko' ? section.contentKo : section.content}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Quick Tips */}
                        <div className="mt-8 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-2 border-blue-500 rounded-xl p-6">
                            <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span>💡</span>
                                {language === 'ko' ? '빠른 팁' : 'Quick Tips'}
                            </h4>
                            <ul className="space-y-2 text-slate-300">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-400 mt-1">▸</span>
                                    <span>
                                        {language === 'ko'
                                            ? '정기적으로 저장하여 진행 상황을 잃지 마세요!'
                                            : 'Save regularly to avoid losing progress!'}
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-400 mt-1">▸</span>
                                    <span>
                                        {language === 'ko'
                                            ? '타입 상성을 활용하여 전투에서 우위를 점하세요.'
                                            : 'Use type advantages to gain the upper hand in battles.'}
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-400 mt-1">▸</span>
                                    <span>
                                        {language === 'ko'
                                            ? '탐험을 보내 자원을 수동적으로 수집하세요.'
                                            : 'Send expeditions to passively gather resources.'}
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-400 mt-1">▸</span>
                                    <span>
                                        {language === 'ko'
                                            ? '장비를 장착하여 스탯을 크게 향상시키세요!'
                                            : 'Equip gear to significantly boost your stats!'}
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-800 border-t border-slate-700 px-6 py-4 flex justify-between items-center">
                    <p className="text-sm text-slate-400">
                        {language === 'ko'
                            ? '더 많은 도움이 필요하신가요? 디스코드 커뮤니티에 참여하세요!'
                            : 'Need more help? Join our Discord community!'}
                    </p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-bold transition"
                    >
                        {language === 'ko' ? '닫기' : 'Close'}
                    </button>
                </div>
            </div>
        </div>
    );
};
