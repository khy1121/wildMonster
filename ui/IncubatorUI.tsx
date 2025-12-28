import React from 'react';
import { GameState, IncubatorSlot } from '../domain/types';
import { ITEM_DATA } from '../data/items';
import { gameStateManager } from '../engine/GameStateManager';

interface IncubatorUIProps {
    state: GameState;
    onClose: () => void;
}

const IncubatorUI: React.FC<IncubatorUIProps> = ({ state, onClose }) => {
    const eggsInInventory = state.tamer.inventory.filter(i => ITEM_DATA[i.itemId].category === 'Egg');

    const handleStartIncubation = (eggItemId: string) => {
        // Determine requirements based on egg type
        const requirements: { itemId: string, quantity: number }[] = [];
        if (eggItemId.includes('fire')) requirements.push({ itemId: 'data_fire', quantity: 5 });
        if (eggItemId.includes('water')) requirements.push({ itemId: 'data_water', quantity: 5 });
        // Mercenary eggs
        if (eggItemId.includes('mercenary')) requirements.forEach(r => r.quantity = 10);

        // Check inventory
        const missing = requirements.filter(req => {
            const item = state.tamer.inventory.find(i => i.itemId === req.itemId);
            return !item || item.quantity < req.quantity;
        });

        if (missing.length > 0) {
            const missingNames = missing.map(m => {
                const itemData = ITEM_DATA[m.itemId];
                return `${itemData ? itemData.name : m.itemId} (x${m.quantity})`;
            }).join(', ');
            alert(`Missing required materials: ${missingNames}`);
            return;
        }

        // Gather materials for function call
        // In a real UI we might let user select distinct stacks, but here we auto-pull
        const materialsToUse = requirements.map(req => ({ itemId: req.itemId, quantity: req.quantity }));

        const success = gameStateManager.startIncubation(eggItemId, materialsToUse);
        if (success) {
            alert("Incubation started!");
        } else {
            alert("Failed to start incubation. Check incubator availability.");
        }
    };

    const handleHatch = (slotId: string) => {
        const monster = gameStateManager.hatchEgg(slotId);
        if (monster) {
            alert(`Congratulations! A new Wilder has hatched!`);
        } else {
            alert(`Storage is full! Please make space.`);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl relative flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="text-2xl">📟</span> Incubator Laboratory
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">Hatch and nurture your Wilder eggs</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Active Incubators */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Active Slots</h3>
                        {state.incubators.length === 0 ? (
                            <div className="p-8 border-2 border-dashed border-slate-800 rounded-xl text-center">
                                <p className="text-slate-500 text-sm italic">No active incubators. Start an egg below.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {state.incubators.map(slot => {
                                    const egg = ITEM_DATA[slot.eggItemId];
                                    const progress = Math.min(100, Math.floor(((state.gameTime - slot.startTime + 2400) % 2400) / slot.duration * 100));

                                    return (
                                        <div key={slot.id} className="p-4 bg-slate-800 rounded-xl border border-slate-700 flex items-center gap-4">
                                            <div className="text-4xl animate-bounce">{egg.icon}</div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-bold text-white">{egg.name}</span>
                                                    {slot.isComplete ? (
                                                        <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">READY</span>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400">INCUBATING...</span>
                                                    )}
                                                </div>
                                                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-500 ${slot.isComplete ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-blue-500 animate-pulse'}`}
                                                        style={{ width: `${slot.isComplete ? 100 : progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                            {slot.isComplete && (
                                                <button
                                                    onClick={() => handleHatch(slot.id)}
                                                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-transform active:scale-95 shadow-lg shadow-green-900/40"
                                                >
                                                    HATCH
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Eggs in Inventory */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Eggs in Inventory</h3>
                        {eggsInInventory.length === 0 ? (
                            <div className="p-6 bg-slate-800/50 rounded-xl text-center text-slate-400 text-sm">
                                No eggs found. Explore the world to find Wilder eggs!
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {eggsInInventory.map(invItem => {
                                    const item = ITEM_DATA[invItem.itemId];
                                    return (
                                        <div
                                            key={invItem.itemId}
                                            className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all group flex flex-col items-center text-center cursor-pointer"
                                            onClick={() => handleStartIncubation(invItem.itemId)}
                                        >
                                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{item.icon}</div>
                                            <div className="font-bold text-sm text-white">{item.name}</div>
                                            <div className="text-[10px] text-slate-500 mt-1">Quantity: {invItem.quantity}</div>
                                            <button className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors">
                                                START
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default IncubatorUI;
