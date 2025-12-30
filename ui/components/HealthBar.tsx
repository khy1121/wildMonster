
import React, { useEffect, useState } from 'react';
import { eventManager } from '../../engine/EventManager';
import { BattleEvent } from '../../engine/events/BattleEvents';

interface HealthBarProps {
    entityId: string;
    maxHp: number;
    currentHp: number;
    showText?: boolean;
    className?: string;
}

export const HealthBar: React.FC<HealthBarProps> = ({
    entityId,
    maxHp: initialMax,
    currentHp: initialCur,
    showText = true,
    className = ""
}) => {
    const [hp, setHp] = useState(initialCur);
    const [maxHp, setMaxHp] = useState(initialMax);

    // Sync with props if they change externally (e.g. state reset)
    useEffect(() => {
        setHp(initialCur);
        setMaxHp(initialMax);
    }, [initialCur, initialMax]);

    useEffect(() => {
        const unsubscribe = eventManager.subscribe<'HEALTH_CHANGED'>('HEALTH_CHANGED', (event) => {
            if (event.entityId === entityId) {
                setHp(event.newHP);
                setMaxHp(event.maxHP);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [entityId]);

    const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));

    // Color determination
    let colorClass = "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]";
    if (pct <= 20) colorClass = "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse";
    else if (pct <= 50) colorClass = "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.6)]";

    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            <div className="relative h-2 md:h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 backdrop-blur-sm">
                <div
                    className={`h-full transition-all duration-500 ease-out ${colorClass}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            {showText && (
                <div className="flex justify-between text-[10px] font-mono text-slate-300 px-1">
                    <span>HP</span>
                    <span>{Math.round(hp)}/{Math.round(maxHp)}</span>
                </div>
            )}
        </div>
    );
};
