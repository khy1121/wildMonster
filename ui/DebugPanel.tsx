
import React from 'react';
import { MONSTER_DATA } from '../data/monsters';

interface DebugPanelProps {
  onAddGold: (amt: number) => void;
  onAddMonster: (speciesId: string) => void;
  onClose: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ onAddGold, onAddMonster, onClose }) => {
  return (
    <div className="fixed top-4 right-4 bg-red-950/90 border border-red-500 p-6 rounded-2xl z-[200] w-64 shadow-2xl backdrop-blur-md">
      <div className="flex justify-between items-center mb-6 border-b border-red-900 pb-2">
        <h3 className="text-red-400 font-black italic uppercase text-sm">Dev Console</h3>
        <button onClick={onClose} className="text-red-500 hover:text-white"><i className="fa-solid fa-xmark"></i></button>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-[10px] text-red-700 font-bold uppercase tracking-widest mb-2">Economy</p>
          <button 
            onClick={() => onAddGold(500)}
            className="w-full py-2 bg-red-900 hover:bg-red-800 text-white text-[10px] font-bold rounded-lg transition"
          >
            +500 Gold
          </button>
        </div>

        <div>
            <p className="text-[10px] text-red-700 font-bold uppercase tracking-widest mb-2">Spawn Species</p>
            <div className="grid grid-cols-3 gap-2">
                {Object.values(MONSTER_DATA).map(m => (
                    <button 
                        key={m.id}
                        onClick={() => onAddMonster(m.id)}
                        className="p-2 bg-slate-900 hover:bg-slate-800 border border-red-900 rounded-lg text-xl"
                        title={m.name}
                    >
                        {m.icon}
                    </button>
                ))}
            </div>
        </div>

        <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            className="w-full py-2 bg-black text-red-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-red-900 mt-4"
        >
            Reset All Progress
        </button>
      </div>
    </div>
  );
};

export default DebugPanel;
