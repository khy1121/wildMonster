
import React, { useState } from 'react';
import { GameState, MonsterInstance } from '../domain/types';
import { GameStateManager } from '../engine/GameStateManager';
import { ITEM_DATA } from '../data/items';
import { Button } from './components/Button';

interface EquipmentUIProps {
    gsm: GameStateManager;
    monsterUid: string;
}

export const EquipmentUI: React.FC<EquipmentUIProps> = ({ gsm, monsterUid }) => {
    const [state, setState] = useState<GameState>(gsm.getState());
    const monster = state.tamer.party.find(m => m.uid === monsterUid)
        || state.tamer.storage.find(m => m.uid === monsterUid);

    if (!monster) return null;

    const currentItem = monster.heldItemId ? ITEM_DATA[monster.heldItemId] : null;

    // Filter Inventory for Equipment
    const equipmentItems = state.tamer.inventory.filter(i =>
        ITEM_DATA[i.itemId].category === 'Equipment'
    );

    const handleEquip = (itemId: string) => {
        gsm.equipItem(monsterUid, itemId);
        setState({ ...gsm.getState() });
    };

    const handleUnequip = () => {
        gsm.unequipItem(monsterUid);
        setState({ ...gsm.getState() });
    };

    return (
        <div className="flex flex-col gap-6 p-4 md:p-8 h-full">
            {/* Current Equipment */}
            <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6 text-center shadow-xl">
                <h3 className="text-indigo-400 font-bold uppercase tracking-widest text-sm mb-4">Held Item</h3>

                {currentItem ? (
                    <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-slate-800 rounded-2xl border-2 border-indigo-500 flex items-center justify-center text-4xl mb-3 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                            {currentItem.icon}
                        </div>
                        <h4 className="text-white font-bold text-lg">{currentItem.name}</h4>
                        <p className="text-slate-400 text-sm mb-4">{currentItem.description}</p>

                        {/* Stats Badge */}
                        <div className="flex gap-2 mb-4">
                            {currentItem.stats?.hp && <span className="bg-green-900/50 text-green-300 px-2 py-1 rounded text-xs font-bold">+ {currentItem.stats.hp} HP</span>}
                            {currentItem.stats?.attack && <span className="bg-red-900/50 text-red-300 px-2 py-1 rounded text-xs font-bold">+ {currentItem.stats.attack} ATK</span>}
                            {currentItem.stats?.defense && <span className="bg-blue-900/50 text-blue-300 px-2 py-1 rounded text-xs font-bold">+ {currentItem.stats.defense} DEF</span>}
                            {currentItem.stats?.speed && <span className="bg-yellow-900/50 text-yellow-300 px-2 py-1 rounded text-xs font-bold">+ {currentItem.stats.speed} SPD</span>}
                        </div>

                        <Button variant="danger" size="md" onClick={handleUnequip} icon={<i className="fa-solid fa-minus-circle"></i>}>
                            Unequip
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-slate-600 py-8">
                        <div className="w-16 h-16 border-2 border-dashed border-slate-700 rounded-2xl flex items-center justify-center text-2xl mb-2">
                            🛑
                        </div>
                        <p className="text-sm font-bold uppercase">Empty Slot</p>
                    </div>
                )}
            </div>

            {/* Inventory Selection */}
            <div className="flex-1 min-h-0 flex flex-col">
                <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-2">Available Equipment</h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-900/50 border border-slate-800 rounded-2xl p-2">
                    {equipmentItems.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-600 text-sm">No equipment in inventory</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {equipmentItems.map(invItem => {
                                const item = ITEM_DATA[invItem.itemId];
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleEquip(item.id)}
                                        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-3 rounded-xl flex items-center gap-3 transition text-left group"
                                    >
                                        <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition">
                                            {item.icon}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-white font-bold text-sm truncate">{item.name}</h4>
                                                <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">x{invItem.quantity}</span>
                                            </div>
                                            <div className="flex gap-2 mt-1">
                                                {item.stats?.hp && <span className="text-[10px] text-green-400">+HP</span>}
                                                {item.stats?.attack && <span className="text-[10px] text-red-400">+ATK</span>}
                                                {item.stats?.defense && <span className="text-[10px] text-blue-400">+DEF</span>}
                                                {item.stats?.speed && <span className="text-[10px] text-yellow-400">+SPD</span>}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
