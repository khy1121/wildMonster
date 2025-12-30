
import { EventBus, gameEvents } from './EventBus';
import { BattleEvent, UIEvent, GameEvent as NewGameEvent } from './events/BattleEvents';

export class EventManager {
    private bus: EventBus;
    private eventHistory: NewGameEvent[] = [];
    private maxHistorySize = 100;

    constructor(bus: EventBus) {
        this.bus = bus;
    }

    /**
     * Emit a typed event to all subscribers
     */
    emit<T extends NewGameEvent>(event: T): void {
        this.eventHistory.push(event);
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }
        // We cast to any here because EventBus expects the legacy GameEvent type
        // In a full migration, we would update domain/types.ts to include all new events
        this.bus.emitEvent(event as any);
    }

    /**
     * Subscribe to specific event type
     * Returns unsubscribe function
     */
    subscribe<T extends NewGameEvent['type']>(
        eventType: T,
        callback: (event: Extract<NewGameEvent, { type: T }>) => void
    ): () => void {
        // EventBus.subscribe returns a cleanup function
        return this.bus.subscribe(eventType as any, callback);
    }

    /**
     * Get event history (for debugging/replay)
     */
    getHistory(): readonly NewGameEvent[] {
        return [...this.eventHistory];
    }

    /**
     * Clear event history
     */
    clearHistory(): void {
        this.eventHistory = [];
    }
}

export const eventManager = new EventManager(gameEvents);
