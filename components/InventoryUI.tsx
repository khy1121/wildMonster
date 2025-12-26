
import React, { useState } from 'react';
import { GameState } from '../domain/types';
import { ITEM_DATA } from '../data/items';
import { gameStateManager } from '../engine/GameStateManager';
import { getTranslation } from '../localization/strings';

interface InventoryUIProps {
  state: GameState;
  onClose: () => void;
}

const InventoryUI: React.FC<InventoryUIProps> = ({ state, onClose }) => {
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const t = getTranslation(state.language);
  const activeMonster = state.tamer.party[0];

  const handleUseItem = (itemId: string) => {
    const result = gameStateManager.useItem(itemId);

    setMessage({
      text: result.message,
      type: result.success ? 'success' : 'error'
    });

    // Auto-clear message after 2 seconds
    setTimeout(() => setMessage(null), 2000);
  };

  const canUseItem = (itemId: string): boolean => {
    const itemDef = ITEM_DATA[itemId];
    if (!itemDef || itemDef.category !== 'Healing') return false;
    if (!activeMonster) return false;
    return activeMonster.currentHp < activeMonster.currentStats.maxHp;
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 md:p-8 backdrop-blur-sm">
      <div className="bg-slate-800 border-2 border-slate-600 w-full max-w-2xl max-h-[80vh] rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <i className="fa-solid fa-briefcase text-yellow-500"></i> {t.ui.inventory}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Message Toast */}
        {message && (
          <div className={`mx-4 mt-4 p-3 rounded-lg text-center font-bold animate-in fade-in slide-in-from-top-2 ${message.type === 'success'
              ? 'bg-green-900/50 border border-green-500 text-green-200'
              : 'bg-red-900/50 border border-red-500 text-red-200'
            }`}>
            {message.text}
          </div>
        )}

        <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-900">
          {state.tamer.inventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <i className="fa-solid fa-box-open text-6xl mb-4 opacity-50"></i>
              <p className="text-lg">{t.ui.no_items}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {state.tamer.inventory.map((invItem) => {
                const itemDef = ITEM_DATA[invItem.itemId];
                const isUsable = itemDef.category === 'Healing';
                const canUse = canUseItem(invItem.itemId);

                return (
                  <div
                    key={invItem.itemId}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex flex-col hover:border-yellow-500 transition group"
                  >
                    {/* Item Icon */}
                    <div className="text-4xl md:text-5xl mb-2 text-center group-hover:scale-110 transition">
                      {itemDef.icon}
                    </div>

                    {/* Item Name */}
                    <span className="text-xs md:text-sm font-bold text-center leading-tight mb-1 h-8 flex items-center justify-center">
                      {itemDef.name}
                    </span>

                    {/* Quantity Badge */}
                    <div className="text-center mb-2">
                      <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                        ×{invItem.quantity}
                      </span>
                    </div>

                    {/* Description Tooltip */}
                    <p className="text-[10px] text-slate-400 text-center mb-2 line-clamp-2">
                      {itemDef.description}
                    </p>

                    {/* Use Button for Healing Items */}
                    {isUsable && (
                      <button
                        onClick={() => handleUseItem(invItem.itemId)}
                        disabled={!canUse || invItem.quantity === 0}
                        className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition ${canUse && invItem.quantity > 0
                            ? 'bg-green-600 hover:bg-green-500 text-white active:scale-95'
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                          }`}
                      >
                        <i className="fa-solid fa-hand-sparkles mr-1"></i>
                        {t.ui.use_item}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryUI;
