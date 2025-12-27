
import React, { useState } from 'react';
import { MONSTER_DATA } from '../data/monsters';
import { GameState } from '../domain/types';
import { getTranslation } from '../localization/strings';
import { Button } from './components/Button';

interface DebugPanelProps {
  state: GameState;
  onAddGold: (amt: number) => void;
  onAddMonster: (speciesId: string) => void;
  onCompleteQuest: (questId: string) => void;
  onClose: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ state, onAddGold, onAddMonster, onCompleteQuest, onClose }) => {
  const t = getTranslation(state.language);
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <Button
        variant="danger"
        size="sm"
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 right-14 w-10 h-10 rounded-full z-[200] shadow-xl"
        icon={<i className="fa-solid fa-terminal"></i>}
      />
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 md:inset-auto md:top-4 md:right-4 w-full md:w-64 bg-red-950/95 md:border md:border-red-500 md:rounded-2xl z-[200] shadow-2xl backdrop-blur-md flex flex-col md:max-h-[90vh] animate-in slide-in-from-right duration-300">
      <div className="flex justify-between items-center p-4 md:p-6 border-b border-red-900 shrink-0">
        <h3 className="text-red-400 font-black italic uppercase text-xs md:text-sm">{t.ui.dev_console}</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setCollapsed(true)} className="md:hidden" icon={<i className="fa-solid fa-minus"></i>} />
          <Button variant="ghost" size="sm" onClick={onClose} icon={<i className="fa-solid fa-xmark text-xl"></i>} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
        <div>
          <p className="text-[10px] text-red-700 font-bold uppercase tracking-widest mb-3">Economy</p>
          <Button
            variant="danger"
            size="full"
            onClick={() => onAddGold(500)}
          >
            +500 {t.ui.gold}
          </Button>
        </div>

        <div>
          <p className="text-[10px] text-red-700 font-bold uppercase tracking-widest mb-3">Spawn Species</p>
          <div className="grid grid-cols-4 md:grid-cols-3 gap-2">
            {Object.values(MONSTER_DATA).map(m => (
              <button
                key={m.id}
                onClick={() => onAddMonster(m.id)}
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-red-900 rounded-lg text-2xl min-h-[50px] flex items-center justify-center transition active:scale-90"
                title={t.species[m.id as keyof typeof t.species] || m.name}
              >
                {m.icon}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] text-red-700 font-bold uppercase tracking-widest mb-3">Quests</p>
          <div className="grid grid-cols-1 gap-2">
            {state.activeQuests.map(id => (
              <Button
                key={id}
                variant="danger"
                size="sm"
                onClick={() => onCompleteQuest(id)}
              >
                Force Complete: {id}
              </Button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-red-900">
          <Button
            variant="outline"
            size="full"
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            className="!text-red-500 !border-red-900 hover:!bg-red-900/20"
          >
            {t.ui.reset_progress}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
