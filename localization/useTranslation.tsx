
import { useState, useEffect } from 'react';
import { gameStateManager } from '../engine/GameStateManager';
import { getTranslation } from './strings';
import { gameEvents } from '../engine/EventBus';

export const useTranslation = () => {
    const [lang, setLang] = useState(gameStateManager.getState().language || 'en');

    useEffect(() => {
        const unsub = gameEvents.subscribe('STATE_UPDATED', (event) => {
            if (event.type === 'STATE_UPDATED') {
                setLang(event.state.language);
            }
        });
        return () => unsub();
    }, []);

    return {
        t: getTranslation(lang),
        language: lang
    };
};
