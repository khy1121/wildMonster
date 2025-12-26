
import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from './engine/GameConfig';
import HUD from './ui/HUD';
import EvolutionChoice from './ui/EvolutionChoice';
import SkillTreeUI from './ui/SkillTreeUI';
import ShopUI from './ui/ShopUI';
import QuestLogUI from './ui/QuestLogUI';
import DebugPanel from './ui/DebugPanel';
import { GameState, EvolutionOption, MonsterInstance } from './domain/types';
import { gameEvents } from './engine/EventBus';
import { gameStateManager } from './engine/GameStateManager';

const App: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [gameState, setGameState] = useState<GameState>(gameStateManager.getState());
  const [evolutionData, setEvolutionData] = useState<{ monsterUid: string, options: EvolutionOption[] } | null>(null);
  const [overlay, setOverlay] = useState<'NONE' | 'SKILLS' | 'SHOP' | 'QUESTS' | 'DEBUG'>('NONE');
  const [activeMonsterUid, setActiveMonsterUid] = useState<string | null>(null);

  useEffect(() => {
    gameEvents.onEvent('STATE_UPDATED', (event: any) => {
      setGameState({ ...event.state });
    });

    gameEvents.onEvent('EVOLUTION_READY', (event: any) => {
      setEvolutionData({ monsterUid: event.monsterUid, options: event.options });
    });

    if (!gameRef.current && containerRef.current) {
      const config = createGameConfig('game-container');
      gameRef.current = new Phaser.Game(config);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
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

  const currentSkillTreeMonster = activeMonsterUid
    ? gameState.tamer.party.find(m => m.uid === activeMonsterUid)
    : null;

  return (
    <div className="relative w-full h-full bg-black overflow-hidden font-sans">
      <div id="game-container" ref={containerRef} className="w-full h-full" />

      <HUD 
        state={gameState} 
        onOpenSkills={(uid) => { setActiveMonsterUid(uid); setOverlay('SKILLS'); }}
        onOpenMenu={() => setOverlay('QUESTS')} // Quick link for now
      />

      {/* Floating Debug Toggle */}
      <button 
        onClick={() => setOverlay('DEBUG')}
        className="absolute bottom-4 right-4 w-8 h-8 bg-red-950/50 hover:bg-red-900 border border-red-900 text-red-600 rounded flex items-center justify-center transition"
      >
        <i className="fa-solid fa-bug"></i>
      </button>

      {evolutionData && gameState.tamer.party.find(m => m.uid === evolutionData.monsterUid) && (
        <EvolutionChoice 
          monster={gameState.tamer.party.find(m => m.uid === evolutionData.monsterUid)!} 
          options={evolutionData.options}
          onChoose={handleChooseEvolution}
          onCancel={() => setEvolutionData(null)}
        />
      )}

      {overlay === 'SKILLS' && currentSkillTreeMonster && (
        <SkillTreeUI
          monster={currentSkillTreeMonster}
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

      {overlay === 'DEBUG' && (
          <DebugPanel 
            onAddGold={(a) => gameStateManager.addGold(a)}
            onAddMonster={(id) => gameStateManager.addDebugMonster(id)}
            onClose={() => setOverlay('NONE')}
          />
      )}

      {/* Navigation Tabs for overlays */}
      {(overlay !== 'NONE' && overlay !== 'DEBUG' && overlay !== 'SKILLS') && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-slate-900/90 border border-slate-700 p-2 rounded-2xl flex gap-2 shadow-2xl backdrop-blur-md">
              <button onClick={() => setOverlay('QUESTS')} className={`px-6 py-2 rounded-xl text-xs font-bold transition uppercase tracking-widest ${overlay === 'QUESTS' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Quests</button>
              <button onClick={() => setOverlay('SHOP')} className={`px-6 py-2 rounded-xl text-xs font-bold transition uppercase tracking-widest ${overlay === 'SHOP' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Shop</button>
          </div>
      )}
      
      <div className="absolute bottom-4 left-4 text-[8px] text-slate-600 font-mono pointer-events-none uppercase tracking-[0.2em]">
        EonTamers Alpha v0.12 • Built with Gemini Engine
      </div>
    </div>
  );
};

export default App;
