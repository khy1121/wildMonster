
import React, { useState } from 'react';
import { GameState, MonsterInstance, InventoryItem } from '../domain/types';
import { GameStateManager } from '../engine/GameStateManager';
import { ITEM_DATA } from '../data/items';

interface EnhancementUIProps {
    gsm: GameStateManager;
    monsterUid: string;
    onClose: () => void;
}

export const EnhancementUI: React.FC<EnhancementUIProps> = ({ gsm, monsterUid, onClose }) => {
    const [state, setState] = useState<GameState>(gsm.getState());
    const [selectedClone, setSelectedClone] = useState<string | null>(null);
    const [useBackup, setUseBackup] = useState(false);
    const [resultMessage, setResultMessage] = useState<string | null>(null);

    const monster = state.tamer.party.find(m => m.uid === monsterUid)
        || state.tamer.storage.find(m => m.uid === monsterUid);

    if (!monster) return null;

    // Filter Inventory for Clones
    const cloneItems = state.tamer.inventory.filter(i =>
        ITEM_DATA[i.itemId].category === 'Material' && i.itemId.startsWith('power_clone')
    );

    const hasBackupDisk = state.tamer.inventory.some(i => i.itemId === 'backup_disk' && i.quantity > 0);

    const handleEnhance = () => {
        if (!selectedClone) return;
        const result = gsm.enhanceMonster(monsterUid, selectedClone, useBackup);
        setResultMessage(result.message);
        setState({ ...gsm.getState() }); // Refresh state
    };

    return (
        <div className="flex flex-col items-center justify-start p-6 h-full text-white">
            <div style={{
                width: '100%', maxWidth: '500px', backgroundColor: '#222',
                padding: '20px', borderRadius: '12px', border: '1px solid #444',
                textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
            }}>
                <h3 className="text-xl font-bold mb-4 text-orange-400 uppercase tracking-widest">Growth Chamber</h3>

                <div style={{ margin: '20px 0' }}>
                    <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <div className="flex flex-col items-start gap-1">
                            <span className="text-xs text-slate-500 uppercase font-bold">Current Level</span>
                            <span className="text-4xl font-black text-indigo-400">+{monster.enhancementLevel}</span>
                        </div>
                        <div className="text-right text-xs text-slate-400 font-mono space-y-1">
                            <div>HP: <span className="text-white">{monster.currentStats.maxHp}</span></div>
                            <div>ATK: <span className="text-white">{monster.currentStats.attack}</span></div>
                            <div>SPD: <span className="text-white">{monster.currentStats.speed}</span></div>
                        </div>
                    </div>
                </div>

                <hr style={{ borderColor: '#444', margin: '20px 0' }} />

                {/* Clone Selection */}
                <div style={{ margin: '20px 0', textAlign: 'left' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8em', color: '#aaa', fontWeight: 'bold', textTransform: 'uppercase' }}>Select Power Clone</label>
                    {cloneItems.length === 0 ? (
                        <div className="p-4 bg-slate-800/50 rounded-lg text-slate-500 text-sm text-center border border-slate-700 border-dashed">
                            No Power Clones in inventory.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {cloneItems.map(item => (
                                <button
                                    key={item.itemId}
                                    onClick={() => setSelectedClone(item.itemId)}
                                    style={{
                                        backgroundColor: selectedClone === item.itemId ? '#4a9' : '#333',
                                        border: selectedClone === item.itemId ? '1px solid #6cba7d' : '1px solid #555',
                                        borderRadius: '8px', padding: '10px',
                                        color: 'white', cursor: 'pointer', flex: '1 1 40%',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ fontWeight: 'bold' }}>{ITEM_DATA[item.itemId].name}</div>
                                    <div style={{ fontSize: '0.8em', opacity: 0.8 }}>Qty: {item.quantity}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Backup Disk */}
                <div style={{ margin: '15px 0', textAlign: 'left', padding: '10px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: hasBackupDisk ? 1 : 0.5, cursor: hasBackupDisk ? 'pointer' : 'default' }}>
                        <input
                            type="checkbox"
                            checked={useBackup}
                            onChange={e => setUseBackup(e.target.checked)}
                            disabled={!hasBackupDisk}
                            style={{ width: '16px', height: '16px' }}
                        />
                        <span className="font-bold text-sm">Use Backup Disk</span>
                    </label>
                    {!hasBackupDisk && <div style={{ fontSize: '0.8em', color: '#f66', marginLeft: '26px', marginTop: '4px' }}>Not available</div>}
                    {hasBackupDisk && <div style={{ fontSize: '0.8em', color: '#888', marginLeft: '26px', marginTop: '4px' }}>Prevents failure penalties.</div>}
                </div>

                {/* Action Buttons */}
                <div style={{ marginTop: '20px' }}>
                    <button
                        onClick={handleEnhance}
                        disabled={!selectedClone}
                        style={{
                            width: '100%', padding: '16px', borderRadius: '8px', border: 'none',
                            backgroundColor: selectedClone ? '#f80' : '#444',
                            color: 'white', cursor: selectedClone ? 'pointer' : 'not-allowed',
                            fontWeight: 'bold', fontSize: '1.1em',
                            boxShadow: selectedClone ? '0 4px 12px rgba(255, 136, 0, 0.4)' : 'none',
                            transition: 'all 0.2s',
                            opacity: selectedClone ? 1 : 0.5
                        }}
                    >
                        INITIALIZE ENHANCEMENT
                    </button>
                </div>

                {/* Result Message */}
                {resultMessage && (
                    <div className="animate-in zoom-in-95 duration-200" style={{
                        marginTop: '20px', padding: '12px', borderRadius: '8px',
                        backgroundColor: resultMessage.includes('Success') ? 'rgba(0, 200, 0, 0.2)' : 'rgba(200, 0, 0, 0.2)',
                        color: resultMessage.includes('Success') ? '#8f8' : '#f88',
                        border: `1px solid ${resultMessage.includes('Success') ? '#484' : '#844'}`,
                        fontWeight: 'bold'
                    }}>
                        {resultMessage}
                    </div>
                )}

            </div>
        </div>
    );
};
