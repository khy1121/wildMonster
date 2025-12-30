
import { eventManager } from './EventManager';

export interface UILayer {
    id: string;
    type: 'MENU' | 'DIALOG' | 'OVERLAY';
    onCancel?: () => void;
    blockInput: boolean;
}

export class UIStackManager {
    private stack: UILayer[] = [];

    push(layer: UILayer): void {
        this.stack.push(layer);
        eventManager.emit({ type: 'UI_LAYER_PUSH', layerId: layer.id });
    }

    pop(): UILayer | undefined {
        const layer = this.stack.pop();
        if (layer) {
            eventManager.emit({ type: 'UI_LAYER_POP', layerId: layer.id });
        }
        return layer;
    }

    peek(): UILayer | undefined {
        return this.stack[this.stack.length - 1];
    }

    handleCancel(): boolean {
        const top = this.peek();
        if (top?.onCancel) {
            top.onCancel();
            this.pop();
            return true;
        }
        return false;
    }

    clear(): void {
        while (this.stack.length > 0) {
            this.pop();
        }
    }

    getDepth(): number {
        return this.stack.length;
    }
}

export const uiStackManager = new UIStackManager();
