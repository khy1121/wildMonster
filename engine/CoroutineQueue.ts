
import { eventManager } from './EventManager';

export type AnimationStep = {
    id: string;
    execute: () => Promise<void>;
    priority: number;
};

export class CoroutineQueue {
    private queue: AnimationStep[] = [];
    private isProcessing = false;

    /**
     * Add animation to queue
     */
    enqueue(step: AnimationStep): void {
        this.queue.push(step);
        this.queue.sort((a, b) => b.priority - a.priority);

        if (!this.isProcessing) {
            this.process();
        }
    }

    /**
     * Process queue sequentially
     */
    private async process(): Promise<void> {
        this.isProcessing = true;

        while (this.queue.length > 0) {
            const step = this.queue.shift();
            if (step) {
                try {
                    await step.execute();
                } catch (error) {
                    console.error(`Error executing animation step ${step.id}:`, error);
                }
            }
        }

        this.isProcessing = false;
        eventManager.emit({ type: 'ANIMATION_QUEUE_COMPLETE' });
    }

    /**
     * Clear all pending animations
     */
    clear(): void {
        this.queue = [];
    }

    /**
     * Check if queue is empty
     */
    isEmpty(): boolean {
        return this.queue.length === 0;
    }
}

export const animationQueue = new CoroutineQueue();
