
import React from 'react';
import { GameState, FactionType } from '../domain/types';
import { getTranslation, getReputationTier, getFactionDiscount } from '../localization/strings';
import { Modal } from './components/Modal';

interface FactionUIProps {
  state: GameState;
  onClose: () => void;
}

export const FactionUI: React.FC<FactionUIProps> = ({ state, onClose }) => {
  const t = getTranslation(state.language);

  return (
    <Modal 
      title={<>{t.ui.factions} <span className="text-indigo-500">{t.ui.reputation}</span></>}
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
      <div className="p-4 md:p-6 space-y-4">
        {Object.values(FactionType).map(faction => {
          const points = state.reputation[faction] || 0;
          const tier = getReputationTier(points, state.language);
          const discount = getFactionDiscount(points);
          
          return (
            <div key={faction} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex justify-between items-center">
              <div>
                <h3 className="text-white font-bold text-lg">{t.factions[faction]}</h3>
                <p className={`text-xs font-bold uppercase tracking-widest ${points >= 0 ? 'text-indigo-400' : 'text-red-400'}`}>
                   {tier} ({points})
                </p>
              </div>
              {discount > 0 && (
                <div className="bg-green-900/30 border border-green-500/30 px-3 py-1 rounded-full text-green-400 text-[10px] font-black uppercase">
                  {Math.round(discount * 100)}% {t.ui.discount}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
};
