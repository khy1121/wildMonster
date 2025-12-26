
import React from 'react';
import { InventoryItem } from '../types';
import { ITEMS } from '../constants';

interface InventoryUIProps {
  inventory: InventoryItem[];
  onClose: () => void;
}

const InventoryUI: React.FC<InventoryUIProps> = ({ inventory, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-8 backdrop-blur-sm">
      <div className="bg-slate-800 border-2 border-slate-600 w-full max-w-xl h-3/4 rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <i className="fa-solid fa-briefcase text-yellow-500"></i> Tamer Bag
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><i className="fa-solid fa-xmark text-xl"></i></button>
        </div>

        <div className="flex-1 p-6 grid grid-cols-3 gap-4 overflow-y-auto bg-slate-900">
          {inventory.map((item) => {
            const data = ITEMS[item.itemId];
            return (
              <div key={item.itemId} className="aspect-square bg-slate-800 border border-slate-700 rounded-lg p-2 flex flex-col items-center justify-center hover:border-yellow-500 transition group relative cursor-pointer">
                <div className="text-4xl mb-1 group-hover:scale-110 transition">
                  {data.category === 'Healing' ? '🧪' : data.category === 'Capture' ? '🧿' : '📦'}
                </div>
                <span className="text-[10px] font-bold text-center leading-tight h-8 flex items-center">{data.name}</span>
                <div className="absolute top-1 right-1 bg-indigo-600 text-white text-[10px] px-1.5 rounded-full font-bold">x{item.quantity}</div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-black text-[10px] p-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition z-50">
                  {data.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InventoryUI;
