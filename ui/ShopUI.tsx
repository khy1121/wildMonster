
import React, { useState } from 'react';
import { GameState } from '../domain/types';
import { ITEM_DATA } from '../data/items';
import { getTranslation, getFactionDiscount } from '../localization/strings';
import { Modal } from './components/Modal';
import { Button } from './components/Button';
import { gameStateManager } from '../engine/GameStateManager';

interface ShopUIProps {
  state: GameState;
  onBuy: (itemId: string, qty: number) => void;
  onClose: () => void;
}

const ShopUI: React.FC<ShopUIProps> = ({ state, onBuy, onClose }) => {
  const t = getTranslation(state.language);

  // Ensure stock is fresh
  React.useEffect(() => {
    gameStateManager.checkShopRefresh();
  }, []);

  let maxDiscount = 0;
  Object.values(state.reputation).forEach(val => {
    maxDiscount = Math.max(maxDiscount, getFactionDiscount(val));
  });

  const [selectedItemId, setSelectedItemId] = useState<string>(Object.keys(ITEM_DATA)[0]);
  const selectedItem = ITEM_DATA[selectedItemId];

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'S': return 'text-yellow-400 border-yellow-500/50 bg-yellow-950/20';
      case 'A': return 'text-purple-400 border-purple-500/50 bg-purple-950/20';
      case 'B': return 'text-blue-400 border-blue-500/50 bg-blue-950/20';
      case 'C': return 'text-green-400 border-green-500/50 bg-green-950/20';
      default: return 'text-slate-400 border-slate-700 bg-slate-900/50';
    }
  };

  const getPrice = (id: string) => gameStateManager.getEffectivePrice(id);

  return (
    <Modal
      title={<>Wandering <span className="text-indigo-500">{t.ui.shop}</span></>}
      onClose={onClose}
      footer={
        <div className="flex justify-center md:block hidden">
          <Button variant="ghost" onClick={onClose}>{t.ui.close}</Button>
        </div>
      }
    >
      <div className="flex flex-col md:flex-row h-full">
        {/* Item List */}
        <div className="w-full md:w-1/2 p-4 md:p-6 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col h-full max-h-[600px]">
          <div className="flex justify-between items-center mb-4 px-2 shrink-0">
            <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Limited Stock</span>
            <div className="text-[10px] text-indigo-400 font-mono flex items-center gap-1">
              <span className="animate-pulse">⏳</span>
              {state.shopNextRefresh ? new Date(state.shopNextRefresh).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:gap-4 overflow-y-auto pr-1 custom-scrollbar">
            {(state.shopStock || []).map(id => {
              const item = ITEM_DATA[id];
              if (!item) return null;
              const effectivePrice = getPrice(item.id);
              const isSelected = selectedItemId === item.id;
              const tierStyle = getTierColor(item.tier);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`group p-3 md:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 md:gap-4 ${isSelected ? `shadow-xl scale-[1.02] ${tierStyle}` : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                >
                  <div className="relative">
                    <span className="text-3xl md:text-4xl">{item.icon}</span>
                    {item.tier && (
                      <div className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black border ${tierStyle}`}>
                        {item.tier}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <h4 className="text-white font-bold text-sm md:text-base truncate">
                      {t.items[item.id as keyof typeof t.items] || item.name}
                    </h4>
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest truncate">{item.category}</p>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <div className="text-yellow-500 font-bold font-mono text-sm md:text-base">{effectivePrice} G</div>
                    {effectivePrice < item.price && (
                      <div className="text-[10px] text-green-500 font-bold font-mono line-through opacity-50">{item.price} G</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Details & Purchase */}
        <div className="w-full md:w-1/2 p-4 md:p-8 flex flex-col items-center justify-start text-center bg-slate-900/10 overflow-y-auto">
          {maxDiscount > 0 && (
            <div className="mb-2 px-3 py-0.5 bg-green-950/50 border border-green-500/30 rounded-full text-[9px] text-green-400 font-bold uppercase tracking-widest shrink-0">
              {t.ui.reputation} {t.ui.discount}: {Math.round(maxDiscount * 100)}%
            </div>
          )}

          <div className="hidden md:block text-6xl mb-4 drop-shadow-2xl animate-pulse shrink-0">{selectedItem.icon}</div>
          <div className="md:hidden text-4xl mb-1 shrink-0">{selectedItem.icon}</div>

          <h3 className="text-xl md:text-2xl font-bold text-white mb-1 shrink-0">{t.items[selectedItem.id as keyof typeof t.items] || selectedItem.name}</h3>

          {/* Stats & Lore */}
          <div className="mb-4 flex flex-col items-center shrink-0">
            <p className="text-slate-400 text-xs md:text-sm mb-2 max-w-xs">{t.items[`${selectedItem.id}_desc` as keyof typeof t.items] || selectedItem.description}</p>
            {selectedItem.flavorText && (
              <p className="text-slate-500 italic text-[10px] md:text-xs max-w-xs opacity-70 mb-3">{t.items[`${selectedItem.id}_lore` as keyof typeof t.items] || selectedItem.flavorText}</p>
            )}

            {selectedItem.stats && (
              <div className="flex gap-2 flex-wrap justify-center mb-3">
                {Object.entries(selectedItem.stats).map(([stat, val]) => (
                  <span key={stat} className="px-2 py-0.5 bg-slate-800 rounded-lg text-[9px] font-bold text-indigo-400 border border-indigo-900/50">
                    {stat.toUpperCase()} +{val}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="w-full max-w-sm p-4 md:p-5 bg-slate-950 rounded-3xl border border-slate-800 shadow-inner shrink-0">
            <div className="flex justify-between items-center mb-3 text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest border-b border-slate-800 pb-1.5">
              <span>{t.ui.current_stock}</span>
              <span className="text-white bg-slate-800 px-2 py-0.5 rounded-full">{state.tamer.inventory.find(i => i.itemId === selectedItemId)?.quantity || 0}</span>
            </div>

            {/* Crafting Requirements */}
            {selectedItem.requiredMaterials && (
              <div className="mb-4">
                <p className="text-left text-[9px] text-slate-500 mb-2 font-black uppercase tracking-widest">{t.ui.required_item}</p>
                <div className="grid grid-cols-2 gap-2">
                  {selectedItem.requiredMaterials.map(mat => {
                    const hasCount = state.tamer.inventory.find(i => i.itemId === mat.itemId)?.quantity || 0;
                    const isEnough = hasCount >= mat.quantity;
                    const matData = ITEM_DATA[mat.itemId];
                    return (
                      <div key={mat.itemId} className={`flex items-center gap-2 p-1.5 rounded-xl border ${isEnough ? 'bg-slate-900/50 border-slate-800' : 'bg-red-950/10 border-red-900/30'}`}>
                        <span className="text-base">{matData?.icon || '📦'}</span>
                        <div className="text-left leading-tight">
                          <div className={`text-[8px] font-bold ${isEnough ? 'text-slate-400' : 'text-red-400'} truncate max-w-[60px]`}>
                            {t.items[mat.itemId as keyof typeof t.items] || matData?.name}
                          </div>
                          <div className={`text-[10px] font-mono ${isEnough ? 'text-white' : 'text-red-300'}`}>
                            {hasCount}/{mat.quantity}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button
                variant={state.tamer.gold >= getPrice(selectedItemId) ? 'primary' : 'ghost'}
                size="full"
                disabled={state.tamer.gold < getPrice(selectedItemId) || (selectedItem.requiredMaterials?.some(m => (state.tamer.inventory.find(i => i.itemId === m.itemId)?.quantity || 0) < m.quantity))}
                onClick={() => onBuy(selectedItemId, 1)}
              >
                {t.ui.purchase}
              </Button>
              <div className="flex justify-center items-center gap-2">
                <div className="text-yellow-500 font-bold font-mono text-base">{getPrice(selectedItemId)} G</div>
                {selectedItem.factionLock && (
                  <span className="text-[9px] bg-red-900/30 text-red-500 px-2 py-0.5 rounded border border-red-900/50 font-bold">
                    REQ {selectedItem.factionLock.substring(0, 5)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ShopUI;
