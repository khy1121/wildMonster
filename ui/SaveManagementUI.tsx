import React, { useState, useEffect } from 'react';
import { saveManager, SaveMetadata } from '../engine/SaveManager';
import { gameStateManager } from '../engine/GameStateManager';
import { getTranslation } from '../localization/strings';

interface SaveManagementUIProps {
    onClose: () => void;
    onLoadSave: (slotId: number) => void;
}

export const SaveManagementUI: React.FC<SaveManagementUIProps> = ({ onClose, onLoadSave }) => {
    const [slots, setSlots] = useState(saveManager.getAllSlots());
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const [showImport, setShowImport] = useState(false);
    const [importData, setImportData] = useState('');
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(saveManager.isAutoSaveEnabled());

    const state = gameStateManager.getState();
    const t = getTranslation(state.language);
    const lang = state.language;

    useEffect(() => {
        // Refresh slots when component mounts
        setSlots(saveManager.getAllSlots());
    }, []);

    const handleSave = (slotId: number) => {
        const success = saveManager.saveToSlot(slotId, state);
        if (success) {
            setSlots(saveManager.getAllSlots());
            alert(lang === 'ko' ? '저장 완료!' : 'Saved successfully!');
        } else {
            alert(lang === 'ko' ? '저장 실패' : 'Save failed');
        }
    };

    const handleLoad = (slotId: number) => {
        if (confirm(lang === 'ko' ? '이 세이브를 불러오시겠습니까?' : 'Load this save?')) {
            onLoadSave(slotId);
        }
    };

    const handleDelete = (slotId: number) => {
        if (confirm(lang === 'ko' ? '이 세이브를 삭제하시겠습니까?' : 'Delete this save?')) {
            saveManager.deleteSlot(slotId);
            setSlots(saveManager.getAllSlots());
            setSelectedSlot(null);
        }
    };

    const handleExport = (slotId: number) => {
        const exported = saveManager.exportSlot(slotId);
        if (exported) {
            navigator.clipboard.writeText(exported);
            alert(lang === 'ko' ? '클립보드에 복사됨!' : 'Copied to clipboard!');
        }
    };

    const handleImport = () => {
        if (selectedSlot === null) {
            alert(lang === 'ko' ? '슬롯을 선택하세요' : 'Select a slot');
            return;
        }

        const success = saveManager.importSlot(selectedSlot, importData);
        if (success) {
            setSlots(saveManager.getAllSlots());
            setShowImport(false);
            setImportData('');
            alert(lang === 'ko' ? '가져오기 완료!' : 'Import successful!');
        } else {
            alert(lang === 'ko' ? '가져오기 실패' : 'Import failed');
        }
    };

    const toggleAutoSave = () => {
        const newValue = !autoSaveEnabled;
        saveManager.enableAutoSave(newValue);
        setAutoSaveEnabled(newValue);
    };

    const formatTimestamp = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US');
    };

    const formatPlaytime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-slate-900 border-2 border-indigo-500 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-900 to-purple-900 px-6 py-4 border-b-2 border-indigo-500 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="text-3xl">💾</span>
                        {lang === 'ko' ? '세이브 관리' : 'Save Management'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-red-400 text-3xl leading-none transition"
                    >
                        ×
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    {/* Auto-save toggle */}
                    <div className="mb-6 flex items-center justify-between bg-slate-800 border border-slate-600 rounded-lg p-4">
                        <div>
                            <span className="text-white font-bold">
                                {lang === 'ko' ? '자동 저장' : 'Auto-Save'}
                            </span>
                            <p className="text-sm text-slate-400">
                                {lang === 'ko' ? '5분마다 자동으로 저장됩니다' : 'Automatically saves every 5 minutes'}
                            </p>
                        </div>
                        <button
                            onClick={toggleAutoSave}
                            className={`px-4 py-2 rounded-lg font-bold transition ${autoSaveEnabled
                                    ? 'bg-green-600 hover:bg-green-500 text-white'
                                    : 'bg-slate-600 hover:bg-slate-500 text-slate-300'
                                }`}
                        >
                            {autoSaveEnabled ? (lang === 'ko' ? '켜짐' : 'ON') : (lang === 'ko' ? '꺼짐' : 'OFF')}
                        </button>
                    </div>

                    {/* Save Slots */}
                    <div className="space-y-4">
                        {slots.map((slot, index) => {
                            const metadata = slot.metadata;
                            const isEmpty = !metadata;

                            return (
                                <div
                                    key={index}
                                    className={`border-2 rounded-xl p-4 transition cursor-pointer ${selectedSlot === index
                                            ? 'border-indigo-500 bg-indigo-900/30'
                                            : 'border-slate-600 bg-slate-800 hover:border-slate-500'
                                        }`}
                                    onClick={() => setSelectedSlot(index)}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">
                                                {isEmpty ? '📁' : '💾'}
                                            </span>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">
                                                    {lang === 'ko' ? `슬롯 ${index + 1}` : `Slot ${index + 1}`}
                                                </h3>
                                                {isEmpty ? (
                                                    <p className="text-sm text-slate-500 italic">
                                                        {lang === 'ko' ? '비어있음' : 'Empty'}
                                                    </p>
                                                ) : (
                                                    <p className="text-sm text-slate-400">
                                                        {metadata.tamerName} • Lv.{metadata.tamerLevel}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {!isEmpty && metadata && (
                                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                            <div className="text-slate-400">
                                                <span className="text-slate-500">{lang === 'ko' ? '위치:' : 'Location:'}</span> {metadata.currentLocation}
                                            </div>
                                            <div className="text-slate-400">
                                                <span className="text-slate-500">{lang === 'ko' ? '골드:' : 'Gold:'}</span> {metadata.gold}G
                                            </div>
                                            <div className="text-slate-400">
                                                <span className="text-slate-500">{lang === 'ko' ? '파티:' : 'Party:'}</span> {metadata.partySize}
                                            </div>
                                            <div className="text-slate-400">
                                                <span className="text-slate-500">{lang === 'ko' ? '플레이 시간:' : 'Playtime:'}</span> {formatPlaytime(metadata.playtime)}
                                            </div>
                                            <div className="text-slate-400 col-span-2">
                                                <span className="text-slate-500">{lang === 'ko' ? '저장 시간:' : 'Saved:'}</span> {formatTimestamp(metadata.timestamp)}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSave(index);
                                            }}
                                            className="flex-1 bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-lg text-sm font-bold text-white transition"
                                        >
                                            {lang === 'ko' ? '저장' : 'Save'}
                                        </button>

                                        {!isEmpty && (
                                            <>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleLoad(index);
                                                    }}
                                                    className="flex-1 bg-green-600 hover:bg-green-500 px-3 py-2 rounded-lg text-sm font-bold text-white transition"
                                                >
                                                    {lang === 'ko' ? '불러오기' : 'Load'}
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleExport(index);
                                                    }}
                                                    className="bg-purple-600 hover:bg-purple-500 px-3 py-2 rounded-lg text-sm font-bold text-white transition"
                                                >
                                                    📤
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(index);
                                                    }}
                                                    className="bg-red-600 hover:bg-red-500 px-3 py-2 rounded-lg text-sm font-bold text-white transition"
                                                >
                                                    🗑️
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Import Section */}
                    <div className="mt-6 border-t-2 border-slate-700 pt-6">
                        <button
                            onClick={() => setShowImport(!showImport)}
                            className="w-full bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-lg font-bold text-white transition flex items-center justify-center gap-2"
                        >
                            <span>📥</span>
                            {lang === 'ko' ? '세이브 가져오기' : 'Import Save'}
                        </button>

                        {showImport && (
                            <div className="mt-4 space-y-3">
                                <textarea
                                    value={importData}
                                    onChange={(e) => setImportData(e.target.value)}
                                    placeholder={lang === 'ko' ? '세이브 데이터를 붙여넣으세요...' : 'Paste save data here...'}
                                    className="w-full h-32 bg-slate-800 border border-slate-600 rounded-lg p-3 text-white font-mono text-sm resize-none"
                                />
                                <button
                                    onClick={handleImport}
                                    disabled={!importData || selectedSlot === null}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-bold text-white transition"
                                >
                                    {lang === 'ko' ? '가져오기' : 'Import'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
