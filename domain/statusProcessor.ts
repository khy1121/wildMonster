import { CombatEntity } from './combat';
import {
    StatusEffect,
    processStatusDamage,
    shouldSkipTurn,
    updateStatusDuration,
    STATUS_EFFECTS
} from './statusEffects';

export interface StatusProcessResult {
    damage: number;
    healed: number;
    statusRemoved: boolean;
    skipTurn: boolean;
    message: string;
    messageKo: string;
}

/**
 * Process status effects at the start/end of a turn
 */
export function processStatusEffects(
    entity: CombatEntity,
    timing: 'start' | 'end'
): StatusProcessResult {
    const result: StatusProcessResult = {
        damage: 0,
        healed: 0,
        statusRemoved: false,
        skipTurn: false,
        message: '',
        messageKo: ''
    };

    if (!entity.status) return result;

    const status = entity.status;
    const effectData = STATUS_EFFECTS[status.type];

    // Check if should skip turn (paralysis, sleep, freeze)
    if (timing === 'start') {
        if (shouldSkipTurn(status)) {
            result.skipTurn = true;
            result.message = `${entity.name} is ${effectData.name}!`;
            result.messageKo = `${entity.name}은(는) ${effectData.nameKo} 상태입니다!`;

            // Freeze has chance to thaw
            if (status.type === 'freeze' && Math.random() < 0.2) {
                entity.status = null;
                result.statusRemoved = true;
                result.message = `${entity.name} thawed out!`;
                result.messageKo = `${entity.name}의 얼음이 녹았다!`;
                result.skipTurn = false;
            }
        }
    }

    // Process damage/healing effects at end of turn
    if (timing === 'end') {
        const damage = processStatusDamage(status, entity.maxHp);

        if (damage > 0) {
            result.damage = damage;
            entity.hp = Math.max(0, entity.hp - damage);
            result.message = `${entity.name} took ${damage} damage from ${effectData.name}!`;
            result.messageKo = `${entity.name}은(는) ${effectData.nameKo}로 ${damage} 데미지를 받았다!`;
        }

        // Update status duration
        const updatedStatus = updateStatusDuration(status);
        if (updatedStatus === null) {
            entity.status = null;
            result.statusRemoved = true;
            result.message += ` ${entity.name} recovered from ${effectData.name}!`;
            result.messageKo += ` ${entity.name}의 ${effectData.nameKo}이(가) 회복되었다!`;
        } else {
            entity.status = updatedStatus;
        }
    }

    return result;
}

/**
 * Apply a status effect to an entity
 */
export function applyStatus(
    entity: CombatEntity,
    statusType: StatusEffect['type'],
    duration: number = -1,
    potency: number = 1
): { success: boolean; message: string; messageKo: string } {
    // Can't apply if already has a status (except flinch)
    if (entity.status && statusType !== 'flinch') {
        return {
            success: false,
            message: `${entity.name} already has a status!`,
            messageKo: `${entity.name}은(는) 이미 상태이상입니다!`
        };
    }

    const effectData = STATUS_EFFECTS[statusType];

    // Set duration based on status type
    let finalDuration = duration;
    if (statusType === 'sleep') {
        finalDuration = Math.floor(Math.random() * 3) + 1; // 1-3 turns
    } else if (statusType === 'confusion') {
        finalDuration = Math.floor(Math.random() * 4) + 1; // 1-4 turns
    } else if (statusType === 'flinch') {
        finalDuration = 1;
    }

    entity.status = {
        type: statusType,
        duration: finalDuration,
        turnsActive: 0,
        potency
    };

    return {
        success: true,
        message: `${entity.name} was ${effectData.name}!`,
        messageKo: `${entity.name}은(는) ${effectData.nameKo} 상태가 되었다!`
    };
}

/**
 * Cure status effect
 */
export function cureStatus(entity: CombatEntity): boolean {
    if (!entity.status) return false;

    // Curse cannot be cured
    if (entity.status.type === 'curse') return false;

    entity.status = null;
    return true;
}

/**
 * Get speed modifier from status
 */
export function getStatusSpeedModifier(entity: CombatEntity): number {
    if (!entity.status) return 1.0;

    if (entity.status.type === 'paralysis') return 0.5;
    if (entity.status.type === 'freeze') return 0.25;

    return 1.0;
}
