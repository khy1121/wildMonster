
import React from 'react';
import { MonsterInstance } from '../types';
import { MONSTERS } from '../constants';

interface PartyUIProps {
  party: MonsterInstance[];
  onClose: () => void;
}

const PartyUI: React.FC<PartyUIProps> = ({ party, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-8 backdrop-blur-sm">
      <div className="bg-slate-800 border-2 border-slate-600 w-full max-w-2xl h-3/4 rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <i className="fa-solid fa-users text-blue-500"></i> Active Party
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><i className="fa-solid fa-xmark text-xl"></i></button>
        </div>

        <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
          {party.map((m) => {
            const species = MONSTERS[m.speciesId];
            return (
              <div key={m.uid} className="bg-slate-900 border border-slate-700 p-4 rounded-lg flex gap-4">
                <div className="text-5xl flex items-center justify-center bg-slate-800 w-20 h-20 rounded-lg">
                  {species.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-lg">{species.name}</h3>
                    <span className="text-sm text-slate-400">LVL {m.level}</span>
                  </div>
                  <div className="space-y-1">
                    <StatBar label="ATK" value={m.currentStats.attack} max={50} color="bg-red-500" />
                    <StatBar label="DEF" value={m.currentStats.defense} max={50} color="bg-blue-500" />
                    <StatBar label="SPD" value={m.currentStats.speed} max={50} color="bg-yellow-500" />
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    EXP {m.exp}/100
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StatBar: React.FC<{ label: string, value: number, max: number, color: string }> = ({ label, value, max, color }) => (
  <div className="flex items-center gap-2">
    <span className="text-[10px] w-6 text-slate-400 font-bold">{label}</span>
    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${(value / max) * 100}%` }}></div>
    </div>
    <span className="text-[10px] text-slate-300">{value}</span>
  </div>
);

export default PartyUI;
