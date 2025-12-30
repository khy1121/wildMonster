
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventManager } from '../EventManager';
import { EventBus } from '../EventBus';
import { UIStackManager } from '../UIStackManager';
import { CoroutineQueue } from '../CoroutineQueue';

// Mock Phaser functionality
const listeners = new Map<string, Function[]>();
vi.mock('phaser', () => ({
    default: {
        Events: {
            EventEmitter: class {
                emit(event: string, data: any) {
                    const callbacks = listeners.get(event) || [];
                    callbacks.forEach(cb => cb(data));
                    return true;
                }
                on(event: string, cb: Function) {
                    if (!listeners.has(event)) listeners.set(event, []);
                    listeners.get(event)!.push(cb);
                    return this;
                }
                off(event: string, cb: Function) {
                    if (!listeners.has(event)) return this;
                    const callbacks = listeners.get(event)!;
                    const index = callbacks.indexOf(cb);
                    if (index !== -1) callbacks.splice(index, 1);
                    return this;
                }
            }
        }
    }
}));

describe('UI Event Architecture', () => {
    let bus: EventBus;
    let eventManager: EventManager;

    beforeEach(() => {
        listeners.clear();
        bus = new EventBus();
        eventManager = new EventManager(bus);
    });

    describe('EventManager', () => {
        it('should emit and receive typed events', () => {
            const spy = vi.fn();
            eventManager.subscribe('HEALTH_CHANGED', spy);

            eventManager.emit({
                type: 'HEALTH_CHANGED',
                entityId: 'player',
                newHP: 80,
                maxHP: 100,
                delta: -20
            });

            expect(spy).toHaveBeenCalledWith({
                type: 'HEALTH_CHANGED',
                entityId: 'player',
                newHP: 80,
                maxHP: 100,
                delta: -20
            });
        });

        it('should maintain event history', () => {
            eventManager.emit({ type: 'UI_LAYER_PUSH', layerId: 'menu' });
            eventManager.emit({ type: 'UI_LAYER_POP', layerId: 'menu' });

            const history = eventManager.getHistory();
            expect(history).toHaveLength(2);
            expect(history[0].type).toBe('UI_LAYER_PUSH');
            expect(history[1].type).toBe('UI_LAYER_POP');
        });

        it('should clear history', () => {
            eventManager.emit({ type: 'UI_LAYER_PUSH', layerId: 'menu' });
            eventManager.clearHistory();
            expect(eventManager.getHistory()).toHaveLength(0);
        });
    });

    describe('UIStackManager', () => {
        let uiStack: UIStackManager;

        beforeEach(() => {
            // Mock the global eventManager used by UIStackManager singleton
            // We can't easily mock the singleton import, so we'll test the logic if we could inject dependency, 
            // OR we just verify side effects on the eventManager we just tested if they share the bus.
            // Since UIStackManager imports the singleton `eventManager`, we need to mock that module or just trust the side effects.
            // For this test, we'll verify behavior via the stack state.
            uiStack = new UIStackManager();
        });

        it('should push and pop layers', () => {
            // clear existing stack if any (singleton persistence)
            uiStack.clear();

            uiStack.push({ id: 'layer1', type: 'MENU', blockInput: true });
            expect(uiStack.getDepth()).toBe(1);

            uiStack.push({ id: 'layer2', type: 'DIALOG', blockInput: true });
            expect(uiStack.getDepth()).toBe(2);

            const popped = uiStack.pop();
            expect(popped?.id).toBe('layer2');
            expect(uiStack.getDepth()).toBe(1);
        });

        it('should handle cancel', () => {
            uiStack.clear();
            const onCancel = vi.fn();

            uiStack.push({ id: 'modal', type: 'MENU', blockInput: true, onCancel });

            const handled = uiStack.handleCancel();
            expect(handled).toBe(true);
            expect(onCancel).toHaveBeenCalled();
            expect(uiStack.getDepth()).toBe(0);
        });

        it('should return false if cancel not handled', () => {
            uiStack.clear();
            uiStack.push({ id: 'static', type: 'OVERLAY', blockInput: false });

            const handled = uiStack.handleCancel();
            expect(handled).toBe(false);
            expect(uiStack.getDepth()).toBe(1);
        });
    });

    describe('CoroutineQueue', () => {
        let queue: CoroutineQueue;

        beforeEach(() => {
            queue = new CoroutineQueue();
        });

        it('should execute tasks sequentially by priority', async () => {
            const executionOrder: string[] = [];

            // Task 0 starts immediately and blocks the queue for a bit
            const task0 = {
                id: 'task0',
                priority: 0,
                execute: async () => {
                    await new Promise(resolve => setTimeout(resolve, 20)); // Longer wait
                    executionOrder.push('task0');
                }
            };

            const task1 = {
                id: 'task1',
                priority: 1,
                execute: async () => {
                    await new Promise(resolve => setTimeout(resolve, 10));
                    executionOrder.push('task1');
                }
            };

            const task2 = {
                id: 'task2',
                priority: 2, // Higher priority
                execute: async () => {
                    await new Promise(resolve => setTimeout(resolve, 10));
                    executionOrder.push('task2');
                }
            };

            queue.enqueue(task0); // Starts processing, blocks queue
            queue.enqueue(task1); // Goes into queue
            queue.enqueue(task2); // Goes into queue, should jump ahead of task1 due to sort

            // Wait for all to finish (20 + 10 + 10 + buffer)
            await new Promise(resolve => setTimeout(resolve, 100));

            // task0 finishes first (it started first)
            // Then task2 (higher prio)
            // Then task1 (lower prio)
            expect(executionOrder).toEqual(['task0', 'task2', 'task1']);
        });
    });
});
