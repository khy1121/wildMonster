
import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from './engine/GameConfig';
import { SafeArea } from './engine/SafeArea';
import HUD from './ui/HUD';
import EvolutionChoice from './ui/EvolutionChoice';
import { MonsterDetailUI } from './ui/MonsterDetailUI';
import ShopUI from './ui/ShopUI';
import QuestLogUI from './ui/QuestLogUI';
import QuestRewardPopup from './ui/QuestRewardPopup';
import DebugPanel from './ui/DebugPanel';
import InventoryUI from './components/InventoryUI';
import { FactionUI } from './ui/AppOverlays';
import { MenuUI } from './ui/MenuUI';
import CharacterSelectionUI from './ui/CharacterSelectionUI';
import StarterSelectionUI from './ui/StarterSelectionUI';
import IncubatorUI from './ui/IncubatorUI';
// Phase 4
import { AchievementsUI } from './ui/AchievementsUI';
import { ExpeditionUI } from './ui/ExpeditionUI';
import { DailyLoginUI } from './ui/DailyLoginUI';
// Phase 5
import { WorldMapUI } from './ui/WorldMapUI';
import { EnhancedQuestLogUI } from './ui/EnhancedQuestLogUI';
import { GameState, EvolutionOption, MonsterInstance, Quest } from './domain/types';
import { gameEvents } from './engine/EventBus';
import { gameStateManager } from './engine/GameStateManager';
import { getTranslation } from './localization/strings';
import { QUEST_DATA } from './data/quests';

const App: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [gameState, setGameState] = useState<GameState>(gameStateManager.getState());
  const [evolutionData, setEvolutionData] = useState<{ monsterUid: string, options: EvolutionOption[] } | null>(null);
  const [completedQuest, setCompletedQuest] = useState<Quest | null>(null);
  const [overlay, setOverlay] = useState<'NONE' | 'SKILLS' | 'SHOP' | 'QUESTS' | 'DEBUG' | 'FACTIONS' | 'MENU' | 'INVENTORY' | 'INCUBATOR' | 'ACHIEVEMENTS' | 'EXPEDITIONS' | 'WORLDMAP' | 'ENHANCED_QUESTS'>('NONE');
  const [showDailyLogin, setShowDailyLogin] = useState(false);
  const [activeMonsterUid, setActiveMonsterUid] = useState<string | null>(null);
  const [selectionStep, setSelectionStep] = useState<'CHARACTER' | 'STARTER' | 'NONE'>('NONE');
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [activeScene, setActiveScene] = useState<string>('BootScene');

  useEffect(() => {
    const unsub = gameEvents.subscribe('STATE_UPDATED', (event) => {
      if (event.type === 'STATE_UPDATED') {
        setGameState({ ...event.state });
        if (!event.state.flags['game_started'] && selectionStep === 'NONE') {
          setSelectionStep('CHARACTER');
        } else if (event.state.flags['game_started']) {
          setSelectionStep('NONE');
        }
      }
    });

    gameEvents.on('EVOLUTION_READY', (event: any) => {
      setEvolutionData({ monsterUid: event.monsterUid, options: event.options });
    });

    gameEvents.on('QUEST_COMPLETED', (event: any) => {
      const quest = QUEST_DATA.find(q => q.id === event.questId);
      if (quest) {
        setCompletedQuest(quest);
      }
    });

    gameEvents.on('SCENE_CHANGED', (event: any) => {
      setActiveScene(event.sceneKey);
    });

    gameEvents.on('BATTLE_END', () => {
      setActiveScene('OverworldScene');
      // Refresh quests daily on battle end or scene change
      gameStateManager.refreshDailyQuests();
    });

    SafeArea.init();

    // Initial refresh
    gameStateManager.refreshDailyQuests();

    if (!gameStateManager.getState().flags['game_started']) {
      setSelectionStep('CHARACTER');
    } else {
      // Phase 4: Check Daily Login when game is already started
      const loginCheck = gameStateManager.checkDailyLogin();
      if (loginCheck.isNewDay || !gameStateManager.getState().dailyLogin.claimedToday) {
        setShowDailyLogin(true);
      }
    }

    const win = window as any;
    if (!gameRef.current && containerRef.current) {
      if (win.__PHASER__ && win.__PHASER__ instanceof Phaser.Game) {
        gameRef.current = win.__PHASER__;
      } else {
        const config = createGameConfig('phaser-root');
        gameRef.current = new Phaser.Game(config);
        win.__PHASER__ = gameRef.current;
      }
    }

    return () => {
      unsub();
      SafeArea.dispose();
    };
  }, []);

  const handleCharSelect = (id: string) => {
    setSelectedCharId(id);
    setSelectionStep('STARTER');
  };

  const handleStarterSelect = (speciesId: string) => {
    if (selectedCharId) {
      gameStateManager.startNewGame(selectedCharId, speciesId);
      setSelectionStep('NONE');
    }
  };

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

      {selectionStep === 'CHARACTER' && (
        <CharacterSelectionUI onSelect={handleCharSelect} />
      )}

      {selectionStep === 'STARTER' && (
        <StarterSelectionUI onSelect={handleStarterSelect} />
      )}

      {selectionStep === 'NONE' && (activeScene === 'OverworldScene' || activeScene === 'MenuScene') && (
        <>
          <HUD
            state={gameState}
            onOpenSkills={(uid) => { setActiveMonsterUid(uid); setOverlay('SKILLS'); }}
            onOpenQuests={() => setOverlay('QUESTS')}
            onOpenFactions={() => setOverlay('FACTIONS')}
            onOpenShop={() => setOverlay('SHOP')}
            onOpenSettings={() => setOverlay('MENU')}
            onOpenInventory={() => setOverlay('INVENTORY')}
            onOpenIncubator={() => setOverlay('INCUBATOR')}
            onOpenAchievements={() => setOverlay('ACHIEVEMENTS')}
            onOpenExpeditions={() => setOverlay('EXPEDITIONS')}
            onOpenWorldMap={() => setOverlay('WORLDMAP')}
            onOpenEnhancedQuests={() => setOverlay('ENHANCED_QUESTS')}
          />

          <button
            onClick={() => setOverlay('DEBUG')}
            className={`absolute bottom-4 right-4 w-10 h-10 bg-red-950/50 hover:bg-red-900 border border-red-900 text-red-600 rounded-full flex items-center justify-center transition shadow-lg z-[50] active:scale-90`}
          >
            <i className="fa-solid fa-bug"></i>
          </button>
        </>
      )}

      {evolutionData && gameState.tamer.party.find(m => m.uid === evolutionData.monsterUid) && (
        <EvolutionChoice
          monster={gameState.tamer.party.find(m => m.uid === evolutionData.monsterUid)!}
          options={evolutionData.options}
          onChoose={handleChooseEvolution}
          onCancel={() => setEvolutionData(null)}
          language={gameState.language}
        />
      )}

      {overlay === 'SKILLS' && activeMonsterUid && (
        <MonsterDetailUI
          gsm={gameStateManager}
          monsterUid={activeMonsterUid}
          language={gameState.language}
          onClose={() => setOverlay('NONE')}
        />
      )}

      {(overlay === 'SHOP' || gameState.flags['open_shop']) && (
        <ShopUI
          state={gameState}
          onBuy={(id, q) => gameStateManager.buyItem(id, q)}
          onClose={() => {
            setOverlay('NONE');
            if (gameState.flags['open_shop']) {
              gameStateManager.updateState({ flags: { ...gameState.flags, open_shop: false } });
            }
          }}
        />
      )}

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
          onCompleteQuest={(id) => gameStateManager.completeQuest(id)}
          onClose={() => setOverlay('NONE')}
        />
      )}

      {overlay === 'INVENTORY' && (
        <InventoryUI
          state={gameState}
          onClose={() => setOverlay('NONE')}
        />
      )}

      {overlay === 'INCUBATOR' && (
        <IncubatorUI
          state={gameState}
          onClose={() => setOverlay('NONE')}
        />
      )}

      {completedQuest && (
        <QuestRewardPopup
          quest={completedQuest}
          language={gameState.language}
          onClaim={() => {
            gameStateManager.claimQuestReward(completedQuest.id);
            setCompletedQuest(null);
          }}
        />
      )}

      {/* Phase 4 UIs */}
      {overlay === 'ACHIEVEMENTS' && (
        <AchievementsUI
          gsm={gameStateManager}
          onClose={() => setOverlay('NONE')}
        />
      )}

      {overlay === 'EXPEDITIONS' && (
        <ExpeditionUI
          gsm={gameStateManager}
          onClose={() => setOverlay('NONE')}
        />
      )}

      {showDailyLogin && (
        <DailyLoginUI
          gsm={gameStateManager}
          onClose={() => setShowDailyLogin(false)}
        />
      )}

      {/* Phase 5 UIs */}
      {overlay === 'WORLDMAP' && (
        <WorldMapUI
          gsm={gameStateManager}
          onClose={() => setOverlay('NONE')}
          onTravelToRegion={(regionId) => {
            // Update current region in state
            const currentState = gameStateManager.getState();
            currentState.currentRegion = regionId;
            gameEvents.emit({ type: 'STATE_UPDATED', state: currentState });
            setOverlay('NONE');
          }}
        />
      )}

      {overlay === 'ENHANCED_QUESTS' && (
        <EnhancedQuestLogUI
          gsm={gameStateManager}
          onClose={() => setOverlay('NONE')}
        />
      )}

      <div className="absolute bottom-2 left-4 text-[7px] text-slate-600 font-mono pointer-events-none uppercase tracking-[0.2em] hidden md:block">
        EonTamers Alpha v0.15 • Built with Gemini Engine
      </div>
    </div>
  );
};

export default App;
