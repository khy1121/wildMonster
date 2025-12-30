
import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from './engine/GameConfig';
import { SafeArea } from './engine/SafeArea';
import HUD from './ui/HUD';
import { GameHUD } from './ui/GameHUD';
import EvolutionChoice from './ui/EvolutionChoice';
import { MonsterDetailUI } from './ui/MonsterDetailUI';
import ShopUI from './ui/ShopUI';
// import QuestLogUI from './ui/QuestLogUI';  // Old Quest system - disabled for Phase 5
// import QuestRewardPopup from './ui/QuestRewardPopup';  // Old Quest system - disabled for Phase 5
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
// Equipment System
import { EquipmentUI } from './ui/EquipmentUI';
// Save System
import { SaveManagementUI } from './ui/SaveManagementUI';
import { saveManager } from './engine/SaveManager';
// Tutorial System
import { TutorialOverlay } from './ui/TutorialOverlay';
import { HelpManualUI } from './ui/HelpManualUI';
import { tutorialManager } from './engine/TutorialManager';
// 3D World
import { World3D } from './components/World3D/World3D';
import { TestWorld3D } from './components/World3D/TestWorld3D';
import { R3FWorld } from './components/World3D/R3FWorld';
import { BattleOverlay } from './ui/BattleOverlay';
import { GameState, EvolutionOption, MonsterInstance } from './domain/types';  // Removed Quest - using Phase 5 structure
import { gameEvents } from './engine/EventBus';
import { gameStateManager } from './engine/GameStateManager';
import { getTranslation } from './localization/strings';
import { Minimap } from './ui/Minimap';
import { InteractionPrompt } from './ui/InteractionPrompt';
// Data Management System
import { dataManager } from './engine/DataManager';
// import { QUEST_DATA } from './data/quests';  // Disabled for Phase 5 - using EnhancedQuestLogUI

export const App: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [gameState, setGameState] = useState<GameState>(gameStateManager.getState());
  const [evolutionData, setEvolutionData] = useState<{ monsterUid: string, options: EvolutionOption[] } | null>(null);
  // const [completedQuest, setCompletedQuest] = useState<Quest | null>(null);  // Disabled for Phase 5
  const [overlay, setOverlay] = useState<'NONE' | 'SKILLS' | 'SHOP' | 'QUESTS' | 'DEBUG' | 'FACTIONS' | 'MENU' | 'INVENTORY' | 'INCUBATOR' | 'ACHIEVEMENTS' | 'EXPEDITIONS' | 'WORLDMAP' | 'ENHANCED_QUESTS' | 'EQUIPMENT' | 'SAVES' | 'HELP' | '3D_WORLD' | 'TEST_3D'>('NONE');
  const [showDailyLogin, setShowDailyLogin] = useState(false);
  const [activeMonsterUid, setActiveMonsterUid] = useState<string | null>(null);
  const [selectionStep, setSelectionStep] = useState<'CHARACTER' | 'STARTER' | 'NONE'>('NONE');
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [activeScene, setActiveScene] = useState<string>('BootScene');
  const [tutorialProgress, setTutorialProgress] = useState(tutorialManager.getProgress());
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load game data on mount
  useEffect(() => {
    const initData = async () => {
      try {
        console.log('🎮 Loading game data...');
        await dataManager.loadAllData();
        setDataLoaded(true);
        console.log('✅ Game data loaded successfully');
      } catch (error) {
        console.error('❌ Failed to load game data:', error);
        // Continue anyway with fallback data
        setDataLoaded(true);
      }
    };

    initData();
  }, []);

  useEffect(() => {
    if (!dataLoaded) return; // Wait for data to load
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

    // gameEvents.on('QUEST_COMPLETED', (event: any) => {  // Disabled for Phase 5
    //   const quest = QUEST_DATA.find(q => q.id === event.questId);
    //   if (quest) {
    //     setCompletedQuest(quest);
    //   }
    // });

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
    console.log('[App] Checking initialization...', { gameRef: !!gameRef.current, containerRef: !!containerRef.current });

    if (!gameRef.current && containerRef.current) {
      if (win.__PHASER__ && win.__PHASER__ instanceof Phaser.Game) {
        console.log('[App] Resuming existing global Phaser instance');
        gameRef.current = win.__PHASER__;
      } else {
        console.log('[App] Creating new Phaser Game instance');
        const config = createGameConfig('phaser-root');
        gameRef.current = new Phaser.Game(config);
        win.__PHASER__ = gameRef.current;
        console.log('[App] Game instance created', gameRef.current);
      }
    } else {
      console.warn('[App] Skipping initialization. Refs state:', { gameRef: !!gameRef.current, containerRef: !!containerRef.current });
    }

    return () => {
      unsub();
      // Remove other listeners if needed or rely on component unmount
      gameEvents.off('EVOLUTION_READY', () => { });
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        (window as any).__PHASER__ = null;
      }
    };
  }, [dataLoaded]);

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

  const [viewMode, setViewMode] = useState<'PHASER' | '3D' | 'TEST_3D'>('PHASER');

  const handleOpen3DWorld = () => setViewMode('3D');
  const handleOpenTest3D = () => setViewMode('TEST_3D');
  const handleClose3D = () => setViewMode('PHASER');

  return (
    <div id="game-root" className="relative w-full h-full bg-black overflow-hidden font-sans select-none">

      {/* --- LAYER 0: WORLD (Z-0) --- */}
      <div className="absolute inset-0 z-0">
        <div id="phaser-root" ref={containerRef} className={`w-full h-full ${viewMode !== 'PHASER' ? 'hidden' : ''}`} />

        {/* 3D Worlds - Mounted here as base layer components */}
        {viewMode === '3D' && (
          <World3D onClose={handleClose3D} />
        )}
        {viewMode === 'TEST_3D' && (
          <TestWorld3D onClose={handleClose3D} />
        )}
      </div>

      {/* --- LAYER 10: HUD (Z-10) --- */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {selectionStep === 'NONE' && (activeScene === 'OverworldScene' || activeScene === 'MenuScene' || viewMode !== 'PHASER') && (
          <GameHUD>
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
              onOpenEquipment={() => setOverlay('EQUIPMENT')}
              onOpenSaves={() => setOverlay('SAVES')}
              onOpenHelp={() => setOverlay('HELP')}
              onOpen3DWorld={handleOpen3DWorld}
              onOpenTest3D={handleOpenTest3D}
            />
            <button
              onClick={() => setOverlay('DEBUG')}
              className={`absolute bottom-4 right-4 w-10 h-10 bg-red-950/50 hover:bg-red-900 border border-red-900 text-red-600 rounded-full flex items-center justify-center transition shadow-lg z-[50] active:scale-90 pointer-events-auto`}
            >
              <i className="fa-solid fa-bug"></i>
            </button>
            <Minimap />
            <InteractionPrompt />
          </GameHUD>
        )}

        {/* Battle HUD */}
        {activeScene === 'BattleScene' && viewMode === 'PHASER' && (
          <BattleOverlay />
        )}
      </div>

      {/* --- LAYER 20: MODALS (Z-20) --- */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {/* Initialization Flows */}
        {selectionStep === 'CHARACTER' && (
          <div className="pointer-events-auto w-full h-full"><CharacterSelectionUI onSelect={handleCharSelect} /></div>
        )}

        {selectionStep === 'STARTER' && (
          <div className="pointer-events-auto w-full h-full"><StarterSelectionUI onSelect={handleStarterSelect} /></div>
        )}

        {/* Overlays - Wrappers ensure pointer-events-auto where needed */}
        {/* Note: Most UI components handle their own layout/background, so we just render them.
            We assume they have pointer-events-auto on their containers or we wrap them if they strictly don't.
            Most existing UIs here seem to be full screen or modal-like. */}

        {evolutionData && gameState.tamer.party.find(m => m.uid === evolutionData.monsterUid) && (
          <div className="pointer-events-auto absolute inset-0">
            <EvolutionChoice
              monster={gameState.tamer.party.find(m => m.uid === evolutionData.monsterUid)!}
              options={evolutionData.options}
              onChoose={handleChooseEvolution}
              onCancel={() => setEvolutionData(null)}
              language={gameState.language}
            />
          </div>
        )}

        {overlay === 'SKILLS' && activeMonsterUid && (
          <div className="pointer-events-auto absolute inset-0">
            <MonsterDetailUI
              gsm={gameStateManager}
              monsterUid={activeMonsterUid}
              language={gameState.language}
              onClose={() => setOverlay('NONE')}
            />
          </div>
        )}

        {(overlay === 'SHOP' || gameState.flags['open_shop']) && (
          <div className="pointer-events-auto absolute inset-0">
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
          </div>
        )}

        {overlay === 'FACTIONS' && (
          <div className="pointer-events-auto absolute inset-0">
            <FactionUI state={gameState} onClose={() => setOverlay('NONE')} />
          </div>
        )}

        {overlay === 'MENU' && (
          <div className="pointer-events-auto absolute inset-0">
            <MenuUI state={gameState} onClose={() => setOverlay('NONE')} />
          </div>
        )}

        {overlay === 'DEBUG' && (
          <div className="pointer-events-auto absolute inset-0">
            <DebugPanel
              state={gameState}
              onAddGold={(a) => gameStateManager.addGold(a)}
              onAddMonster={(id) => gameStateManager.addDebugMonster(id)}
              onCompleteQuest={(id) => gameStateManager.completeQuest(id)}
              onClose={() => setOverlay('NONE')}
            />
          </div>
        )}

        {overlay === 'INVENTORY' && (
          <div className="pointer-events-auto absolute inset-0">
            <InventoryUI state={gameState} onClose={() => setOverlay('NONE')} />
          </div>
        )}

        {overlay === 'INCUBATOR' && (
          <div className="pointer-events-auto absolute inset-0">
            <IncubatorUI state={gameState} onClose={() => setOverlay('NONE')} />
          </div>
        )}

        {overlay === 'ACHIEVEMENTS' && (
          <div className="pointer-events-auto absolute inset-0">
            <AchievementsUI gsm={gameStateManager} onClose={() => setOverlay('NONE')} />
          </div>
        )}

        {overlay === 'EXPEDITIONS' && (
          <div className="pointer-events-auto absolute inset-0">
            <ExpeditionUI gsm={gameStateManager} onClose={() => setOverlay('NONE')} />
          </div>
        )}

        {showDailyLogin && (
          <div className="pointer-events-auto absolute inset-0">
            <DailyLoginUI gsm={gameStateManager} onClose={() => setShowDailyLogin(false)} />
          </div>
        )}

        {overlay === 'WORLDMAP' && (
          <div className="pointer-events-auto absolute inset-0">
            <WorldMapUI
              gsm={gameStateManager}
              onClose={() => setOverlay('NONE')}
              onTravelToRegion={(regionId) => { setOverlay('NONE'); }}
            />
          </div>
        )}

        {overlay === 'ENHANCED_QUESTS' && (
          <div className="pointer-events-auto absolute inset-0">
            <EnhancedQuestLogUI gsm={gameStateManager} onClose={() => setOverlay('NONE')} />
          </div>
        )}

        {overlay === 'EQUIPMENT' && (
          <div className="pointer-events-auto absolute inset-0">
            <EquipmentUI gsm={gameStateManager} onClose={() => setOverlay('NONE')} />
          </div>
        )}

        {overlay === 'SAVES' && (
          <div className="pointer-events-auto absolute inset-0">
            <SaveManagementUI
              onClose={() => setOverlay('NONE')}
              onLoadSave={(slotId) => {
                const loadedState = saveManager.loadFromSlot(slotId);
                if (loadedState) {
                  gameStateManager.setState(loadedState);
                  setGameState(loadedState);
                  setOverlay('NONE');
                }
              }}
            />
          </div>
        )}

        {overlay === 'HELP' && (
          <div className="pointer-events-auto absolute inset-0">
            <HelpManualUI language={gameState.language} onClose={() => setOverlay('NONE')} />
          </div>
        )}
      </div>

      <div className="absolute bottom-2 left-4 text-[7px] text-slate-600 font-mono pointer-events-none uppercase tracking-[0.2em] hidden md:block z-30">
        EonTamers Alpha v0.15 • Built with Gemini Engine
      </div>
    </div>
  );
};

export default App;
