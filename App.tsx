
import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from './engine/GameConfig';
import { SafeArea } from './engine/SafeArea';
import HUD from './ui/HUD';
import EvolutionChoice from './ui/EvolutionChoice';
import SkillTreeUI from './ui/SkillTreeUI';
import ShopUI from './ui/ShopUI';
import QuestLogUI from './ui/QuestLogUI';
import DebugPanel from './ui/DebugPanel';
import InventoryUI from './components/InventoryUI';
import { FactionUI } from './ui/AppOverlays';
import { MenuUI } from './ui/MenuUI';
import { GameState, EvolutionOption, MonsterInstance } from './domain/types';
import { gameEvents } from './engine/EventBus';
import { gameStateManager } from './engine/GameStateManager';
import { getTranslation } from './localization/strings';

const App: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [gameState, setGameState] = useState<GameState>(gameStateManager.getState());
  const [evolutionData, setEvolutionData] = useState<{ monsterUid: string, options: EvolutionOption[] } | null>(null);
  const [overlay, setOverlay] = useState<'NONE' | 'SKILLS' | 'SHOP' | 'QUESTS' | 'DEBUG' | 'FACTIONS' | 'MENU' | 'INVENTORY'>('NONE');
  const [activeMonsterUid, setActiveMonsterUid] = useState<string | null>(null);

  useEffect(() => {
    console.log('APP MOUNTED');
    gameEvents.onEvent('STATE_UPDATED', (event: any) => {
      setGameState({ ...event.state });
    });

    gameEvents.onEvent('EVOLUTION_READY', (event: any) => {
      setEvolutionData({ monsterUid: event.monsterUid, options: event.options });
    });

    // Initialize safe area probe for notch insets
    SafeArea.init();

    // Prevent double Phaser creation in StrictMode by using a window guard
    const win = window as any;
    if (!gameRef.current && containerRef.current) {
      if (win.__PHASER__ && win.__PHASER__ instanceof Phaser.Game) {
        gameRef.current = win.__PHASER__;
      } else {
        const config = createGameConfig('phaser-root');
        try {
          gameRef.current = new Phaser.Game(config);
          win.__PHASER__ = gameRef.current;
          console.log('PHASER CREATED', { parent: config.parent });
        } catch (err) {
          console.error('PHASER CREATE ERROR', err);
        }
      }
    }

    return () => {
      SafeArea.dispose();
      const win = window as any;
      if (gameRef.current && (!win.__PHASER_KEEP_ALIVE__)) {
        gameRef.current.destroy(true);
        if (win.__PHASER__ === gameRef.current) delete win.__PHASER__;
        gameRef.current = null;
      }
    };
  }, []);

  const handleChooseEvolution = (targetId: string) => {
    if (evolutionData) {
      gameStateManager.evolveMonster(evolutionData.monsterUid, targetId);
      setEvolutionData(null);
    }
  };

  const t = getTranslation(gameState.language);
  const currentSkillTreeMonster = activeMonsterUid
    ? gameState.tamer.party.find(m => m.uid === activeMonsterUid)
    : null;

  return (
    <div id="game-root" className="relative w-full h-full bg-black overflow-hidden font-sans select-none">
      <div id="phaser-root" ref={containerRef} className="w-full h-full" />
      <div id="hud-root">
        {/* Primary HUD always visible */}
        <HUD
          state={gameState}
          onOpenSkills={(uid) => { setActiveMonsterUid(uid); setOverlay('SKILLS'); }}
          onOpenMenu={() => setOverlay('MENU')}
          onOpenInventory={() => setOverlay('INVENTORY')}
        />
      </div>

      {/* Floating Debug Toggle - Shifted for mobile nav */}
      <button
        onClick={() => setOverlay('DEBUG')}
        className={`absolute bottom-4 right-4 w-10 h-10 bg-red-950/50 hover:bg-red-900 border border-red-900 text-red-600 rounded-full flex items-center justify-center transition shadow-lg z-[50] active:scale-90 ${overlay !== 'NONE' && overlay !== 'DEBUG' ? 'mb-16 md:mb-0' : ''}`}
      >
        <i className="fa-solid fa-bug"></i>
      </button>

      {/* Logic Overlays */}
      {evolutionData && gameState.tamer.party.find(m => m.uid === evolutionData.monsterUid) && (
        <EvolutionChoice
          monster={gameState.tamer.party.find(m => m.uid === evolutionData.monsterUid)!}
          options={evolutionData.options}
          onChoose={handleChooseEvolution}
          onCancel={() => setEvolutionData(null)}
          language={gameState.language}
        />
      )}

      {overlay === 'SKILLS' && currentSkillTreeMonster && (
        <SkillTreeUI
          monster={currentSkillTreeMonster}
          language={gameState.language}
          onUnlock={(id) => gameStateManager.unlockSkillNode(currentSkillTreeMonster.uid, id)}
          onClose={() => setOverlay('NONE')}
        />
      )}

      {overlay === 'SHOP' || (gameState.flags['open_shop'] && (
        <ShopUI
          state={gameState}
          onBuy={(id, q) => gameStateManager.buyItem(id, q)}
          onClose={() => setOverlay('NONE')}
        />
      ))}

      {overlay === 'QUESTS' && (
        <QuestLogUI
          state={gameState}
          onClose={() => setOverlay('NONE')}
        />
      )}

      {overlay === 'FACTIONS' && (
        <FactionUI
          state={gameState}
          onClose={() => setOverlay('NONE')}
        />
      )}

      {overlay === 'MENU' && (
        <MenuUI
          state={gameState}
          onClose={() => setOverlay('NONE')}
        />
      )}

      {overlay === 'DEBUG' && (
        <DebugPanel
          state={gameState}
          onAddGold={(a) => gameStateManager.addGold(a)}
          onAddMonster={(id) => gameStateManager.addDebugMonster(id)}
          onClose={() => setOverlay('NONE')}
        />
      )}

      {overlay === 'INVENTORY' && (
        <InventoryUI
          state={gameState}
          onClose={() => setOverlay('NONE')}
        />
      )}

      {/* Navigation Tabs - Mobile Optimized Bottom Bar */}
      {(overlay !== 'NONE' && overlay !== 'DEBUG' && overlay !== 'SKILLS') && (
        <div className="fixed bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-slate-900/90 border border-slate-700 p-1.5 md:p-2 rounded-full md:rounded-2xl flex gap-1 md:gap-2 shadow-2xl backdrop-blur-md">
          <button
            onClick={() => setOverlay('QUESTS')}
            className={`px-4 md:px-6 py-2 md:py-2 rounded-full md:rounded-xl text-[10px] md:text-xs font-bold transition uppercase tracking-widest flex items-center gap-2 active:scale-95 ${overlay === 'QUESTS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <i className="fa-solid fa-scroll"></i> {t.ui.quests}
          </button>
          <button
            onClick={() => setOverlay('FACTIONS')}
            className={`px-4 md:px-6 py-2 md:py-2 rounded-full md:rounded-xl text-[10px] md:text-xs font-bold transition uppercase tracking-widest flex items-center gap-2 active:scale-95 ${overlay === 'FACTIONS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <i className="fa-solid fa-flag"></i> {t.ui.factions}
          </button>
          <button
            onClick={() => setOverlay('SHOP')}
            className={`px-4 md:px-6 py-2 md:py-2 rounded-full md:rounded-xl text-[10px] md:text-xs font-bold transition uppercase tracking-widest flex items-center gap-2 active:scale-95 ${overlay === 'SHOP' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <i className="fa-solid fa-store"></i> {t.ui.shop}
          </button>
          <button
            onClick={() => setOverlay('MENU')}
            className={`px-4 md:px-6 py-2 md:py-2 rounded-full md:rounded-xl text-[10px] md:text-xs font-bold transition uppercase tracking-widest flex items-center gap-2 active:scale-95 ${overlay === 'MENU' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <i className="fa-solid fa-cog"></i> {t.ui.settings}
          </button>
        </div>
      )}

      <div className="absolute bottom-2 left-4 text-[7px] text-slate-600 font-mono pointer-events-none uppercase tracking-[0.2em] hidden md:block">
        EonTamers Alpha v0.12 • Built with Gemini Engine
      </div>
    </div>
  );
};

export default App;
