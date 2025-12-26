
import React from 'react';
import { MONSTERS } from '../constants';

interface DebugPanelProps {
  onAddMonster: (id: string) => void;
  onClose: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ onAddMonster, onClose }) => {
  return (
    <div className="fixed top-20 right-4 w-64 bg-slate-900/95 border-2 border-red-900 rounded-lg z-[100] shadow-2xl p-4 text-xs font-mono">
      <div className="flex justify-between items-center mb-4 text-red-500 font-bold border-b border-red-900 pb-2">
        <span>DEBUG CONSOLE</span>
        <button onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
      </div>

      <p className="text-slate-500 mb-2 uppercase">Spawn Monsters</p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {Object.values(MONSTERS).map(m => (
          <button 
            key={m.id}
            onClick={() => onAddMonster(m.id)}
            className="bg-slate-800 hover:bg-slate-700 p-2 rounded text-left flex items-center gap-1 border border-slate-700"
          >
            <span>{m.icon}</span> {m.name}
          </button>
        ))}
      </div>

      <p className="text-slate-500 mb-2 uppercase">Save Management</p>
      <div className="space-y-2">
        <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full bg-red-900/40 hover:bg-red-900 text-red-200 p-2 rounded border border-red-800 transition">
          Wipe LocalStorage
        </button>
      </div>
    </div>
  );
};

export default DebugPanel;
