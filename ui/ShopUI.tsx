
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
  const [selectedItemId, setSelectedItemId] = useState<string>(Object.keys(ITEM_DATA)[0]);
  const selectedItem = ITEM_DATA[selectedItemId];

  let maxDiscount = 0;
  Object.values(state.reputation).forEach(val => {
    maxDiscount = Math.max(maxDiscount, getFactionDiscount(val));
  });

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
        <div className="w-full md:w-1/2 p-4 md:p-6 border-b md:border-b-0 md:border-r border-slate-800">
          <div className="grid grid-cols-1 gap-3 md:gap-4">
            {Object.values(ITEM_DATA).map(item => {
              const effectivePrice = getPrice(item.id);
              return (
                <div 
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`p-3 md:p-4 rounded-2xl border-2 transition cursor-pointer flex items-center gap-3 md:gap-4 ${selectedItemId === item.id ? 'bg-indigo-950/30 border-indigo-500 shadow-lg' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                >
                  <span className="text-3xl md:text-4xl">{item.icon}</span>
                  <div className="flex-1 min-w-0 text-left">
                    <h4 className="text-white font-bold text-sm md:text-base truncate">{t.items[item.id as keyof typeof t.items] || item.name}</h4>
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
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col items-center justify-center text-center bg-slate-900/30">
          {maxDiscount > 0 && (
            <div className="mb-4 px-3 py-1 bg-green-950/50 border border-green-500/30 rounded-full text-[10px] text-green-400 font-bold uppercase tracking-widest">
              {t.ui.reputation} {t.ui.discount}: {Math.round(maxDiscount * 100)}%
            </div>
          )}

          <div className="hidden md:block text-8xl mb-6 drop-shadow-2xl animate-bounce">{selectedItem.icon}</div>
          <div className="md:hidden text-5xl mb-2">{selectedItem.icon}</div>
          
          <h3 className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2">{t.items[selectedItem.id as keyof typeof t.items] || selectedItem.name}</h3>
          <p className="text-slate-400 text-sm md:text-base mb-6 md:mb-8 max-w-xs">{t.items[`${selectedItem.id}_desc` as keyof typeof t.items] || selectedItem.description}</p>
          
          <div className="w-full max-w-sm p-4 md:p-6 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center mb-3 md:mb-4 text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">
              <span>{t.ui.current_stock}</span>
              <span className="text-white">{state.tamer.inventory.find(i => i.itemId === selectedItemId)?.quantity || 0}</span>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button 
                variant="primary" 
                size="full" 
                disabled={state.tamer.gold < getPrice(selectedItemId)}
                onClick={() => onBuy(selectedItemId, 1)}
              >
                {t.ui.purchase} (1)
              </Button>
              <div className="text-yellow-500 font-bold font-mono text-sm">{getPrice(selectedItemId)} G</div>
            </div>
          </div>

          <div className="mt-6 md:hidden">
            <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-yellow-500 font-bold font-mono">
              WALLET: {state.tamer.gold} G
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ShopUI;
