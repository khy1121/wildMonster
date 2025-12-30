
import React, { useEffect, useState } from 'react';
import { eventManager } from '../engine/EventManager';

export const Minimap: React.FC = () => {
    const [position, setPosition] = useState({ x: 0, z: 0 }); // 3D usually X/Z plane

    useEffect(() => {
        // This event would be emitted by the 3D Character Controller
        const unsub = eventManager.subscribe('PLAYER_MOVE', (event) => {
            setPosition({ x: event.position.x, z: event.position.z });
        });
        return () => unsub();
    }, []);

    return (
        <div className="absolute top-4 right-4 w-32 h-32 bg-slate-900/80 border-2 border-indigo-500 rounded-full overflow-hidden shadow-lg pointer-events-auto opacity-80 hover:opacity-100 transition">
            <div className="relative w-full h-full bg-slate-800">
                {/* Radar Lines */}
                <div className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: 'radial-gradient(circle, transparent 30%, #4f46e5 31%, transparent 32%)',
                        backgroundSize: '100% 100%'
                    }}
                />
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-indigo-500/30" />
                <div className="absolute left-1/2 top-0 h-full w-[1px] bg-indigo-500/30" />

                {/* Player DOT - Always Center */}
                <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />

                {/* Mock Map Content relative to position */}
                {/* We would render relative markers here */}
                <div className="absolute top-2 w-full text-center text-[8px] text-white font-mono">
                    {Math.round(position.x)}, {Math.round(position.z)}
                </div>
            </div>
        </div>
    );
};
