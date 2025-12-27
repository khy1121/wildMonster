import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BattleState, BattleEntity, MonsterInstance, Skill } from '../types';
import { MONSTERS, SKILLS } from '../constants';

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

    addLog(`${MONSTERS[source.speciesId].name} used ${skill.name}!`);
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
              processSkill(p, aliveEnemy, SKILLS[sId]);
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
              processSkill(en, alivePlayer, SKILLS[sId]);
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
        skillPoints: 0,
        unlockedNodes: []
      });
    } else {
      addLog("The monster broke free!");
      triggerVfx(50, 50, "FAIL");
    }
  };

  return (
    <div className="w-full h-full bg-slate-900 flex flex-col items-center p-8 relative overflow-hidden">
      {/* Background Arena */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="w-full h-full border-[20px] border-slate-700 rounded-full scale-150"></div>
      </div>

      <div className="flex-1 w-full max-w-4xl relative">
        {/* Enemy Side */}
        <div className="absolute right-0 top-1/4 flex flex-col items-end">
          {entities.enemy.map(en => (
            <div key={en.uid} className={`transition-all duration-300 ${en.currentHp <= 0 ? 'opacity-0 grayscale scale-50' : ''}`}>
              <BattleUnit entity={en} flip />
            </div>
          ))}
        </div>

        {/* Player Side */}
        <div className="absolute left-0 bottom-1/4 flex flex-col items-start gap-4">
          {entities.player.map(p => (
            <div key={p.uid} className={`transition-all duration-300 ${p.currentHp <= 0 ? 'opacity-50 grayscale' : ''}`}>
              <BattleUnit entity={p} />
            </div>
          ))}
        </div>

        {/* VFX Layer */}
        {vfx.map(v => (
          <div
            key={v.id}
            className="absolute z-50 text-red-500 font-black text-2xl animate-bounce"
            style={{ left: `${v.x}%`, top: `${v.y}%` }}
          >
            {v.text}
          </div>
        ))}
      </div>

      {/* Bottom Command Bar */}
      <div className="w-full max-w-4xl h-32 bg-slate-800 border-t-4 border-slate-700 p-4 flex gap-4">
        <div className="flex-1 bg-slate-900 rounded p-2 overflow-y-auto font-mono text-xs text-green-400">
          {log.map((line, i) => <div key={i}>{line}</div>)}
        </div>
        <div className="w-48 flex flex-col gap-2">
          <button
            onClick={handleCapture}
            className="w-full h-full bg-indigo-600 hover:bg-indigo-500 rounded font-bold text-white transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-circle-dot"></i> CAPTURE
          </button>
        </div>
      </div>
    </div>
  );
};

const BattleUnit: React.FC<{ entity: BattleEntity, flip?: boolean }> = ({ entity, flip }) => {
  const species = MONSTERS[entity.speciesId];
  const hpPercent = (entity.currentHp / entity.maxHp) * 100;

  return (
    <div className={`flex items-center gap-4 ${flip ? 'flex-row-reverse' : ''}`}>
      <div className={`text-7xl transition-transform ${flip ? '-scale-x-100' : ''} ${entity.currentHp > 0 ? 'animate-pulse' : ''}`}>
        {species.icon}
      </div>
      <div className={`w-48 bg-slate-800/80 p-2 rounded border-2 border-slate-600 ${flip ? 'text-right' : 'text-left'}`}>
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-sm">{species.name}</span>
          <span className="text-[10px] text-slate-400">Lvl {entity.level}</span>
        </div>
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${hpPercent > 50 ? 'bg-green-500' : hpPercent > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${hpPercent}%` }}
          ></div>
        </div>
        <div className="text-[9px] text-slate-400 mt-1 uppercase tracking-tighter">
          HP {Math.round(entity.currentHp)} / {entity.maxHp}
        </div>
      </div>
    </div>
  );
};

export default BattleArena;