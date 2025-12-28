
import React from 'react';
import { GameState, FactionType } from '../domain/types';
import { MONSTER_DATA } from '../data/monsters';
import { getTranslation, getReputationTier } from '../localization/strings';

interface HUDProps {
  state: GameState;
  onOpenSkills: (uid: string) => void;
  onOpenQuests: () => void;
  onOpenFactions: () => void;
  onOpenShop: () => void;
  onOpenSettings: () => void;
  onOpenInventory: () => void;
  onOpenIncubator: () => void;
  // Phase 4
  onOpenAchievements?: () => void;
  onOpenExpeditions?: () => void;
}

const HUD: React.FC<HUDProps> = ({ state, onOpenSkills, onOpenQuests, onOpenFactions, onOpenShop, onOpenSettings, onOpenInventory, onOpenIncubator, onOpenAchievements, onOpenExpeditions }) => {
  const { tamer, language, reputation } = state;
  const t = getTranslation(language);
  const activeMonster = tamer.party[0];
  const species = activeMonster ? MONSTER_DATA[activeMonster.speciesId] : null;

  // Find dominant faction for lead monster
  const leadFaction = species ? species.faction : null;
  const leadRep = leadFaction ? reputation[leadFaction] : 0;

  // Phase 4: Check for completed expeditions
  const hasCompletedExpedition = tamer.activeExpeditions?.some(e => Date.now() >= e.endTime) ?? false;

  return (
    <div className="absolute top-0 left-0 w-full p-2 md:p-4 pointer-events-none flex flex-col gap-2">
      <div className="flex justify-between items-start w-full">
        {/* Tamer Info - Compact for Mobile */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          <div className="hud-card border border-slate-700 flex items-center gap-2 md:gap-4">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-indigo-600 rounded-full flex items-center justify-center text-lg md:text-2xl border-2 border-indigo-400 shrink-0">
              👤
            </div>
            <div className="min-w-0">
              <h2 className="text-white font-bold leading-none text-xs md:text-base truncate max-w-[80px] md:max-w-none">{tamer.name}</h2>
              <p className="text-slate-400 text-[8px] md:text-[10px] mt-0.5 md:mt-1 uppercase tracking-wider font-mono">
                LV.{tamer.level} • <span className="text-yellow-500">{tamer.gold}G</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pointer-events-auto">
            <button
              onClick={onOpenQuests}
              className="btn-primary flex items-center justify-center gap-2 text-[9px] md:text-[10px] min-h-[40px]"
              aria-label="Open Quests"
            >
              <i className="fa-solid fa-scroll"></i> <span className="hidden sm:inline">{t.ui.quests}</span>
            </button>

            <button
              onClick={onOpenFactions}
              className="btn-primary flex items-center justify-center gap-2 text-[9px] md:text-[10px] min-h-[40px]"
              aria-label="Open Factions"
            >
              <i className="fa-solid fa-flag"></i> <span className="hidden sm:inline">{t.ui.factions}</span>
            </button>

            <button
              onClick={onOpenShop}
              className="btn-primary flex items-center justify-center gap-2 text-[9px] md:text-[10px] min-h-[40px]"
              aria-label="Open Shop"
            >
              <i className="fa-solid fa-store"></i> <span className="hidden sm:inline">{t.ui.shop}</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="btn-primary flex items-center justify-center gap-2 text-[9px] md:text-[10px] min-h-[40px]"
              aria-label="Open Settings"
            >
              <i className="fa-solid fa-cog"></i> <span className="hidden sm:inline">{t.ui.settings}</span>
            </button>

            <button
              onClick={onOpenInventory}
              className="btn-primary flex items-center justify-center gap-2 text-[9px] md:text-[10px] min-h-[40px] bg-yellow-600 hover:bg-yellow-500 border-yellow-500"
              aria-label="Open Inventory"
            >
              <i className="fa-solid fa-briefcase"></i> <span className="hidden sm:inline">{t.ui.inventory}</span>
            </button>

            <button
              onClick={onOpenIncubator}
              className="btn-primary flex items-center justify-center gap-2 text-[9px] md:text-[10px] min-h-[40px] bg-emerald-600 hover:bg-emerald-500 border-emerald-500 relative"
              aria-label="Open Incubator"
            >
              <i className="fa-solid fa-flask"></i> <span className="hidden sm:inline">{t.ui.incubator}</span>
              {state.incubators.some(s => s.isComplete) && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white animate-bounce" />
              )}
            </button>

            {/* Phase 4 Buttons */}
            {onOpenAchievements && (
              <button
                onClick={onOpenAchievements}
                className="btn-primary flex items-center justify-center gap-2 text-[9px] md:text-[10px] min-h-[40px] bg-amber-600 hover:bg-amber-500 border-amber-500"
                aria-label="Open Achievements"
              >
                <i className="fa-solid fa-trophy"></i> <span className="hidden sm:inline">{t.ui.achievements}</span>
              </button>
            )}

            {onOpenExpeditions && (
              <button
                onClick={onOpenExpeditions}
                className="btn-primary flex items-center justify-center gap-2 text-[9px] md:text-[10px] min-h-[40px] bg-purple-600 hover:bg-purple-500 border-purple-500 relative"
                aria-label="Open Expeditions"
              >
                <i className="fa-solid fa-compass"></i> <span className="hidden sm:inline">{t.ui.expeditions}</span>
                {hasCompletedExpedition && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white animate-bounce" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Reputation Summary */}
        <div className="hidden lg:flex flex-col gap-1 pointer-events-auto">
          {leadFaction && (
            <div className="bg-slate-900/80 border border-slate-700 px-3 py-1.5 rounded-lg backdrop-blur-md shadow-xl">
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block">{t.factions[leadFaction]}</span>
              <span className={`text-[11px] font-bold ${leadRep >= 0 ? 'text-indigo-400' : 'text-red-400'}`}>
                {getReputationTier(leadRep, language)} ({leadRep})
              </span>
            </div>
          )}
        </div>

        {/* Active Monster Info - Compact for Mobile */}
        {activeMonster && species && (
          <div
            className="hud-card border border-slate-700 pointer-events-auto flex items-center gap-2 md:gap-4 cursor-pointer hover:border-indigo-500 group transition"
            onClick={() => onOpenSkills(activeMonster.uid)}
          >
            <div className="text-2xl md:text-4xl relative shrink-0">
              {species.icon}
              {activeMonster.skillPoints > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-indigo-500 rounded-full animate-ping" />
              )}
            </div>
            <div className="w-24 md:w-32">
              <div className="flex justify-between text-[8px] md:text-[10px] text-white font-bold mb-1">
                <span className="group-hover:text-indigo-400 transition truncate">{t.species[activeMonster.speciesId as keyof typeof t.species] || species.name}</span>
                <span>LV.{activeMonster.level}</span>
              </div>
              <div className="w-full h-1.5 md:h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${(activeMonster.currentHp / activeMonster.currentStats.maxHp) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="text-[7px] md:text-[8px] text-indigo-500 font-bold">{activeMonster.skillPoints} SP</span>
                <p className="text-[7px] md:text-[8px] text-slate-500 font-mono">
                  {Math.round(activeMonster.currentHp)}/{activeMonster.currentStats.maxHp}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HUD;
