import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BattleState, BattleEntity, MonsterInstance, Skill } from '../types';
import { MONSTER_DATA } from '../data/monsters';
import { SKILL_DATA } from '../data/skills';

interface BattleArenaProps {
  battle: BattleState;
  onEnd: (winner: 'PLAYER' | 'ENEMY' | 'CAPTURED', captured?: MonsterInstance) => void;
}

const BattleArena: React.FC<BattleArenaProps> = ({ battle, onEnd }) => {
  const [entities, setEntities] = useState<{ player: BattleEntity[], enemy: BattleEntity[] }>({
    player: battle.playerMonsters,
    enemy: battle.enemyMonsters
  });
  const [log, setLog] = useState<string[]>(battle.log);
  const [vfx, setVfx] = useState<{ id: string, x: number, y: number, text: string }[]>([]);
  const lastTickRef = useRef<number>(Date.now());

  // Fix: useRef<number>() expects 1 argument (initialValue) in some configurations.
  // Using 0 as a default value for the animation request handle.
  const requestRef = useRef<number>(0);

  const addLog = (msg: string) => setLog(prev => [msg, ...prev].slice(0, 10));

  const triggerVfx = (x: number, y: number, text: string) => {
    const id = Math.random().toString();
    setVfx(prev => [...prev, { id, x, y, text }]);
    setTimeout(() => {
      setVfx(prev => prev.filter(v => v.id !== id));
    }, 1000);
  };

  const processSkill = (source: BattleEntity, target: BattleEntity, skill: Skill) => {
    // Damage Calculation
    const damage = Math.max(1, skill.power + source.currentStats.attack - target.currentStats.defense);

    // Update State
    setEntities(prev => {
      const isPlayerSource = prev.player.some(e => e.uid === source.uid);
      const newPlayer = prev.player.map(p => ({ ...p, cooldowns: { ...p.cooldowns } }));
      const newEnemy = prev.enemy.map(e => ({ ...e, cooldowns: { ...e.cooldowns } }));

      if (isPlayerSource) {
        const tIdx = newEnemy.findIndex(e => e.uid === target.uid);
        if (tIdx > -1) {
          newEnemy[tIdx].currentHp = Math.max(0, newEnemy[tIdx].currentHp - damage);
        }
        const sIdx = newPlayer.findIndex(e => e.uid === source.uid);
        if (sIdx > -1) {
          newPlayer[sIdx].cooldowns[skill.id] = skill.cooldown * 1000;
        }
      } else {
        const tIdx = newPlayer.findIndex(e => e.uid === target.uid);
        if (tIdx > -1) {
          newPlayer[tIdx].currentHp = Math.max(0, newPlayer[tIdx].currentHp - damage);
        }
        const sIdx = newEnemy.findIndex(e => e.uid === source.uid);
        if (sIdx > -1) {
          newEnemy[sIdx].cooldowns[skill.id] = skill.cooldown * 1000;
        }
      }

      return { player: newPlayer, enemy: newEnemy };
    });

    addLog(`${MONSTER_DATA[source.speciesId].name} used ${skill.name}!`);
    triggerVfx(target.position.x, target.position.y, `-${damage}`);
  };

  const update = useCallback(() => {
    const now = Date.now();
    const dt = now - lastTickRef.current;
    lastTickRef.current = now;

    setEntities(prev => {
      const nextPlayer = prev.player.map(e => ({
        ...e,
        cooldowns: Object.fromEntries(
          Object.entries(e.cooldowns).map(([id, ms]) => [id, Math.max(0, (ms as number) - dt)])
        )
      }));
      const nextEnemy = prev.enemy.map(e => ({
        ...e,
        cooldowns: Object.fromEntries(
          Object.entries(e.cooldowns).map(([id, ms]) => [id, Math.max(0, (ms as number) - dt)])
        )
      }));

      // Basic AI / Auto-Skill
      nextPlayer.forEach(p => {
        if (p.currentHp <= 0) return;
        p.activeSkills.forEach(sId => {
          if (p.cooldowns[sId] === 0 || p.cooldowns[sId] === undefined) {
            const aliveEnemy = nextEnemy.find(en => en.currentHp > 0);
            if (aliveEnemy) {
              processSkill(p, aliveEnemy, SKILL_DATA[sId]);
            }
          }
        });
      });

      nextEnemy.forEach(en => {
        if (en.currentHp <= 0) return;
        en.activeSkills.forEach(sId => {
          if (en.cooldowns[sId] === 0 || en.cooldowns[sId] === undefined) {
            const alivePlayer = nextPlayer.find(p => p.currentHp > 0);
            if (alivePlayer) {
              processSkill(en, alivePlayer, SKILL_DATA[sId]);
            }
          }
        });
      });

      return { player: nextPlayer, enemy: nextEnemy };
    });

    requestRef.current = requestAnimationFrame(update);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [update]);

  // Check Win/Loss
  useEffect(() => {
    const playerAlive = entities.player.some(e => e.currentHp > 0);
    const enemyAlive = entities.enemy.some(e => e.currentHp > 0);

    if (!enemyAlive) {
      onEnd('PLAYER');
    } else if (!playerAlive) {
      onEnd('ENEMY');
    }
  }, [entities, onEnd]);

  const handleCapture = () => {
    // Simple capture logic
    const enemy = entities.enemy[0];
    if (enemy.currentHp / enemy.maxHp < 0.3) {
      addLog("Successful capture!");
      onEnd('CAPTURED', {
        uid: Math.random().toString(36).substr(2, 9),
        speciesId: enemy.speciesId,
        level: enemy.level,
        exp: 0,
        currentHp: enemy.maxHp,
        currentStats: enemy.currentStats,
        evolutionHistory: [],
        enhancementLevel: 0,
        skillPoints: 0,
        unlockedNodes: []
      });
    } else {
      addLog("The monster broke free!");
      triggerVfx(50, 50, "FAIL");
    }
  };

  const handleTamerSkill = (skillId: 'heal' | 'boost') => {
    // In a real scenario, we'd call GameStateManager's useTamerSkill. 
    // However, BattleArena is isolated UI. We usually propagate events via gameEvents or props.
    // For this prototype, we'll assume we can import gameStateManager directly or pass a handler.
    // Given the architecture, let's use a direct import for simplicity in this React component,
    // OR better, assume Tamer stats are passed in 'battle' state or fetched from manager.
    // Let's import the manager to trigger the logic.
    const { gameStateManager } = require('../engine/GameStateManager');
    const result = gameStateManager.useTamerSkill(skillId);

    if (result.success) {
      addLog(result.message);
      triggerVfx(50, 80, skillId === 'heal' ? '💚' : '💪');
    } else {
      addLog(result.message);
    }
  };

  const [tamerStats, setTamerStats] = useState({ current: 100, max: 100 });

  // Poll Tamer stats (since they change via skills)
  useEffect(() => {
    const { gameStateManager } = require('../engine/GameStateManager');
    const interval = setInterval(() => {
      const state = gameStateManager.getState();
      if (state.tamer) {
        setTamerStats({
          current: state.tamer.currentSpiritPoints,
          max: state.tamer.maxSpiritPoints
        });
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] border-[40px] border-indigo-900 rounded-full animate-spin-slow opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-transparent"></div>
      </div>

      {/* Main Battle Field */}
      <div className="flex-1 w-full max-w-lg relative flex flex-col items-center justify-center p-4">
        {/* Enemy Side (Top Area for Mobile) */}
        <div className="w-full flex justify-end items-start mb-12">
          {entities.enemy.map(en => (
            <div key={en.uid} className={`transition-all duration-500 transform ${en.currentHp <= 0 ? 'opacity-0 -translate-y-12' : 'animate-fade-in'}`}>
              <BattleUnit entity={en} flip />
            </div>
          ))}
        </div>

        {/* Player Side (Middle Area) */}
        <div className="w-full flex justify-start items-center">
          {entities.player.map(p => (
            <div key={p.uid} className={`transition-all duration-500 transform ${p.currentHp <= 0 ? 'opacity-50 grayscale translate-y-4' : 'animate-float'}`}>
              <BattleUnit entity={p} />
            </div>
          ))}
        </div>

        {/* Floating Damage Text */}
        {vfx.map(v => (
          <div
            key={v.id}
            className="absolute z-50 text-red-500 font-black text-3xl animate-pop-out flex items-center gap-1"
            style={{ left: `${v.x}%`, top: `${v.y}%`, pointerEvents: 'none' }}
          >
            <span className="text-xl">💥</span> {v.text}
          </div>
        ))}
      </div>

      {/* Mobile-First Bottom Command Center */}
      <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-md border-t-2 border-slate-800 p-4 md:p-6 pb-safe flex flex-col gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">

        {/* Tamer Status & DS Bar */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-indigo-500 border-2 border-white overflow-hidden">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Tamer" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 mb-1">
              <span>Spirit (DS)</span>
              <span>{tamerStats.current} / {tamerStats.max}</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${(tamerStats.current / tamerStats.max) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Combat Log - Slim for Mobile */}
        <div className="h-10 bg-black/40 rounded-lg px-3 py-1 overflow-y-auto font-mono text-[10px] text-green-400 border border-slate-800/50">
          {log.map((line, i) => <div key={i} className="animate-in fade-in slide-in-from-left-2">{line}</div>)}
        </div>

        {/* Interaction Bar */}
        <div className="flex gap-2 items-stretch h-16">
          {/* Tamer Skills */}
          <button
            onClick={() => handleTamerSkill('heal')}
            className="flex-1 bg-emerald-900/50 hover:bg-emerald-800/50 border border-emerald-700 rounded-xl flex flex-col items-center justify-center p-1 active:scale-95 transition-all"
          >
            <span className="text-xl">💚</span>
            <span className="text-[9px] font-bold text-emerald-200">HEAL (20)</span>
          </button>

          <button
            onClick={() => handleTamerSkill('boost')}
            className="flex-1 bg-orange-900/50 hover:bg-orange-800/50 border border-orange-700 rounded-xl flex flex-col items-center justify-center p-1 active:scale-95 transition-all"
          >
            <span className="text-xl">🔥</span>
            <span className="text-[9px] font-bold text-orange-200">BOOST (30)</span>
          </button>

          {/* Capture Button - Large and Ergonomic */}
          <button
            onClick={handleCapture}
            className="w-20 bg-gradient-to-br from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 rounded-xl font-black text-white transition-all active:scale-95 shadow-[0_4px_15px_rgba(79,70,229,0.4)] flex flex-col items-center justify-center gap-1 border-b-4 border-indigo-950"
          >
            <span className="text-2xl drop-shadow-md">🧿</span>
            <span className="text-[9px] uppercase tracking-tighter">Capture</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const BattleUnit: React.FC<{ entity: BattleEntity, flip?: boolean }> = ({ entity, flip }) => {
  const species = MONSTER_DATA[entity.speciesId];
  const hpPercent = (entity.currentHp / entity.maxHp) * 100;

  return (
    <div className={`flex flex-col items-center gap-2 ${flip ? 'animate-in slide-in-from-right-10' : 'animate-in slide-in-from-left-10'}`}>
      {/* Unit Sprite / Icon */}
      <div className={`relative ${flip ? 'scale-x-[-1]' : ''}`}>
        <div className="text-7xl md:text-8xl filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
          {species.icon}
        </div>
        {/* Unit Status Effects or Indicators could go here */}
      </div>

      {/* HP Plate */}
      <div className={`w-40 md:w-48 bg-slate-900/80 backdrop-blur-sm p-2 rounded-xl border border-slate-700 shadow-xl`}>
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-[11px] md:text-xs text-white uppercase tracking-wider truncate max-w-[80px]">{species.name}</span>
          <span className="text-[9px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded-md border border-slate-800">LV.{entity.level}</span>
        </div>

        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-[1px]">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out fill-available ${hpPercent > 50 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : hpPercent > 20 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' : 'bg-gradient-to-r from-red-600 to-rose-500'}`}
            style={{ width: `${hpPercent}%` }}
          >
            <div className="w-full h-full opacity-30 bg-[linear-gradient(45deg,rgba(255,255,255,.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.2)_50%,rgba(255,255,255,.2)_75%,transparent_75%,transparent)] bg-[length:10px_10px] animate-shimmer"></div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-1 text-[8px] font-black uppercase tracking-tighter">
          <span className="text-slate-500">Stability</span>
          <span className={hpPercent < 20 ? 'animate-pulse text-red-500' : 'text-slate-400'}>{Math.round(entity.currentHp)} / {entity.maxHp}</span>
        </div>
      </div>
    </div>
  );
};

export default BattleArena;