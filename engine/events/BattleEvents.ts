
import { BattleRewards } from '../../domain/types';
import { StatusEffect } from '../../domain/statusEffects';

export type BattleEvent =
    | { type: 'HEALTH_CHANGED'; entityId: string; newHP: number; maxHP: number; delta: number }
    | { type: 'DAMAGE_DEALT'; targetId: string; damage: number; isCritical: boolean; element?: string }
    | { type: 'BUFF_APPLIED'; targetId: string; buffId: string; duration: number; icon: string }
    | { type: 'BUFF_REMOVED'; targetId: string; buffId: string }
    | { type: 'SKILL_USED'; casterId: string; skillId: string; targetId: string }
    | { type: 'TURN_START'; entityId: string; turnNumber: number }
    | { type: 'TURN_END'; entityId: string }
    | { type: 'BATTLE_END'; winner: 'PLAYER' | 'ENEMY' | 'CAPTURED'; rewards?: BattleRewards }
    | { type: 'ANIMATION_QUEUE_COMPLETE' }
    | { type: 'STATUS_EFFECT_APPLIED'; targetId: string; status: StatusEffect }
    | { type: 'CAPTURE_ATTEMPT'; success: boolean; monsterSpeciesId: string };

export type UIEvent =
    | { type: 'MENU_OPENED'; menuId: string; layer: number }
    | { type: 'MENU_CLOSED'; menuId: string; layer: number }
    | { type: 'DIALOG_SHOW'; message: string; duration?: number; priority: 'LOW' | 'NORMAL' | 'HIGH' }
    | { type: 'SCREEN_SHAKE'; intensity: number; duration: number }
    | { type: 'CAMERA_FLASH'; color: number; duration: number }
    | { type: 'UI_LAYER_PUSH'; layerId: string }
    | { type: 'UI_LAYER_POP'; layerId: string }
    | { type: 'VIEWPORT_RESIZED'; width: number; height: number; aspectRatio: number };

export type WorldEvent =
    | { type: 'PLAYER_MOVE'; position: { x: number; y: number; z: number }; rotation: number }
    | { type: 'INTERACTION_SHOW'; label: string; targetId: string }
    | { type: 'INTERACTION_HIDE' };

export type GameEvent = BattleEvent | UIEvent | WorldEvent;
