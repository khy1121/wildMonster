
import React, { useEffect, useState } from 'react';
import { eventManager } from '../engine/EventManager';

export const InteractionPrompt: React.FC = () => {
    const [prompt, setPrompt] = useState<{ label: string } | null>(null);

    useEffect(() => {
        // Listen for interaction events from 3D world (Raycaster hit)
        const unsubShow = eventManager.subscribe('INTERACTION_SHOW', (event) => {
            setPrompt({ label: event.label });
        });

        const unsubHide = eventManager.subscribe('INTERACTION_HIDE', () => {
            setPrompt(null);
        });

        return () => {
            unsubShow();
            unsubHide();
        };
    }, []);

    if (!prompt) return null;

    return (
        <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 pointer-events-none animate-bounce">
            <div className="bg-black/80 text-white px-6 py-2 rounded-full border border-white/20 backdrop-blur-md shadow-2xl flex items-center gap-3">
                <span className="bg-indigo-500 text-white font-bold text-xs px-2 py-0.5 rounded shadow">F</span>
                <span className="font-semibold tracking-wide text-sm">{prompt.label}</span>
            </div>
        </div>
    );
};
