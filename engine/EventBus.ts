
import Phaser from 'phaser';
import { GameState, EvolutionOption, BattleRewards } from '../domain/types';

export type GameEvent =
  | { type: 'STATE_UPDATED'; state: GameState }
  | { type: 'SCENE_CHANGED'; sceneKey: string }
  | { type: 'BATTLE_START'; enemySpeciesId: string }
  | { type: 'BATTLE_END'; winner: 'PLAYER' | 'ENEMY' | 'CAPTURED' }
  | { type: 'EVOLUTION_READY'; monsterUid: string; options: EvolutionOption[] }
  | { type: 'REWARD_EARNED'; rewards: BattleRewards }
  | { type: 'LOG_MESSAGE'; message: string }
  | { type: 'RETURN_TO_TITLE' }
  | { type: 'MONSTER_DEFEATED'; enemySpeciesId: string; level: number; isBoss: boolean }
  | { type: 'MONSTER_CAPTURED'; speciesId: string; level: number }
  | { type: 'REPUTATION_CHANGED'; faction: string; delta: number; total: number }
  | { type: 'ITEM_COLLECTED'; itemId: string; quantity: number }
  | { type: 'PLAYER_MOVE'; position: { x: number; y: number; z: number } }
  | { type: 'INTERACTION_SHOW'; text: string }
  | { type: 'QUEST_COMPLETED'; questId: string }
  | { type: 'REGION_ENTERED'; regionId: string }
  | { type: 'ACHIEVEMENT_UNLOCKED'; achievementId: string }
  | { type: 'EXPEDITION_COMPLETE'; expeditionId: string };

export class EventBus extends Phaser.Events.EventEmitter {
  constructor() {
    super();
  }

  emitEvent(event: GameEvent) {
    this.emit(event.type, event);
  }

  onEvent(type: GameEvent['type'], callback: (event: any) => void) {
    this.on(type, callback);
  }

  subscribe(type: GameEvent['type'], callback: (event: any) => void) {
    this.on(type, callback);
    return () => { this.off(type, callback); };
  }
}

export const gameEvents = new EventBus();
