
import React, { useEffect, useState } from 'react';
import { eventManager } from '../engine/EventManager';
import { HealthBar } from './components/HealthBar';

interface FloatingText {
    id: string;
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    text: string;
    color: string;
}

export const BattleOverlay: React.FC = () => {
    // State
    const [playerHp, setPlayerHp] = useState({ current: 100, max: 100 });
    const [enemyHp, setEnemyHp] = useState({ current: 100, max: 100 });
    const [dialog, setDialog] = useState<string | null>(null);
    const [floater, setFloater] = useState<FloatingText | null>(null);

    // We need to know who is who. BattleScene maintains "playerEntity" and "enemyEntity".
    // Ideally, valid "BattleStart" event provides IDs. 
    // For now, we listen to HEALTH_CHANGED and map by ID if we knew them, 
    // OR we blindly accept that the event source says "PLAYER" or "ENEMY" if we added that field.
    // Wait, HEALTH_CHANGED has `entityId`. We need to match that to 'player' or 'enemy'.
    // The entities in BattleScene have IDs.
    // Let's assume for this overlay, we might need a BATTLE_STARTED event to initialize IDs.
    // Or we just rely on updates if we had a simplified event or shared context.

    // Actually, BattleScene emits HEALTH_CHANGED with `entityId`.
    // The HealthBar component handles `entityId` filtering. 
    // But here we want to show 2 SPECIFIC bars: Player and Enemy.
    // We need to know which ID belongs to Player and which to Enemy.

    // Let's assume we can get this from GameState or we add a helper.
    // Or simpler: We don't implement the bars here yet because linking IDs is complex without context.
    // Let's focus on Damage Numbers and Dialog which are transient.

    // Wait, I can pass the active monster ID from GameState for Player.
    // Enemy ID? BattleScene generates a wild ID.

    // Let's stick to Dialog and ephemeral feedback for now, 
    // OR update BattleEvents to include 'targetType': 'PLAYER' | 'ENEMY' for easier UI mapping.

    useEffect(() => {
        // Subscribe to Dialog
        const unsubDialog = eventManager.subscribe('DIALOG_SHOW', (e) => {
            setDialog(e.message);
            setTimeout(() => setDialog(null), e.duration || 1500);
        });

        // Subscribe to Damage
        const unsubDamage = eventManager.subscribe('DAMAGE_DEALT', (e) => {
            // We need to know position.
            // If targetId matches player... 
            // We really need 'targetSide' in events for strictly decoupled UI.

            // Let's infer location based on some logic or just show generic for now.
            // Or update BattleScene to include side in event?
            // BattleScene.ts: 
            // eventManager.emit({ ... targetId: ... });

            // I will update BattleScene.ts to include 'side' in the event payload for easier UI handling later.
            // For now, let's just log it or show a generic toast.

            const isPlayer = false; // We don't know yet without ID lookup
            // Placeholder implementation
        });

        return () => {
            unsubDialog();
            unsubDamage();
        };
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between">
            {/* Dialog Area */}
            <div className="mt-auto mb-8 mx-auto w-3/4 max-w-lg min-h-[80px] bg-slate-900/90 border-2 border-slate-600 rounded-lg p-4 flex items-center justify-center transition-opacity duration-300" style={{ opacity: dialog ? 1 : 0 }}>
                <p className="text-white text-lg font-bold text-center">{dialog}</p>
            </div>

            {/* Floating Text Container - Absolute positioning would go here */}
        </div>
    );
};
