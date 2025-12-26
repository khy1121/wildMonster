
import React, { useState } from 'react';
import { GameState, Item } from '../domain/types';
import { ITEM_DATA } from '../data/items';

interface ShopUIProps {
  state: GameState;
  onBuy: (itemId: string, qty: number) => void;
  onClose: () => void;
}

const ShopUI: React.FC<ShopUIProps> = ({ state, onBuy, onClose }) => {
  const [selectedItemId, setSelectedItemId] = useState<string>(Object.keys(ITEM_DATA)[0]);

  const selectedItem = ITEM_DATA[selectedItemId];

  return (
    <div className="fixed inset-0 bg-slate-950/95 z-[150] flex flex-col items-center justify-center p-8 backdrop-blur-xl">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[80vh]">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">
            Wandering <span className="text-indigo-500">Merchant</span>
          </h2>
          <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-yellow-500 font-bold font-mono">
            {state.tamer.gold} G
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Item List */}
          <div className="w-1/2 p-6 border-r border-slate-800 overflow-y-auto">
            <div className="grid grid-cols-1 gap-4">
              {Object.values(ITEM_DATA).map(item => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center gap-4 ${selectedItemId === item.id ? 'bg-indigo-950/30 border-indigo-500 shadow-lg' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                >
                  <span className="text-4xl">{item.icon}</span>
                  <div className="flex-1">
                    <h4 className="text-white font-bold">{item.name}</h4>
                    <p className="text-slate-500 text-xs uppercase tracking-widest">{item.category}</p>
                  </div>
                  <div className="text-yellow-500 font-bold font-mono">{item.price} G</div>
                </div>
              ))}
            </div>
          </div>

          {/* Details & Purchase */}
          <div className="w-1/2 p-10 flex flex-col items-center justify-center text-center">
            <div className="text-8xl mb-6 drop-shadow-2xl animate-bounce">{selectedItem.icon}</div>
            <h3 className="text-3xl font-bold text-white mb-2">{selectedItem.name}</h3>
            <p className="text-slate-400 mb-8 max-w-xs">{selectedItem.description}</p>
            
            <div className="w-full p-6 bg-slate-950 rounded-2xl border border-slate-800 mb-8">
              <div className="flex justify-between items-center mb-4 text-xs text-slate-500 font-bold uppercase tracking-widest">
                <span>Current Stock</span>
                <span className="text-white">{state.tamer.inventory.find(i => i.itemId === selectedItemId)?.quantity || 0}</span>
              </div>
              <button 
                disabled={state.tamer.gold < selectedItem.price}
                onClick={() => onBuy(selectedItemId, 1)}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition shadow-xl ${state.tamer.gold >= selectedItem.price ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
              >
                Purchase (1)
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 flex justify-center bg-slate-900/50">
           <button 
            onClick={onClose}
            className="px-8 py-3 text-slate-500 hover:text-white font-bold uppercase tracking-widest text-xs transition"
           >
            Close Shop
           </button>
        </div>
      </div>
    </div>
  );
};

export default ShopUI;
