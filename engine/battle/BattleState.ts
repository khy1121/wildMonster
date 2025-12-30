
import { CombatEntity } from '../../domain/combat';
import { Skill, Item, MonsterInstance } from '../../domain/types';

export interface BattleContext {
    // Entities
    playerEntity: CombatEntity;
    enemyEntity: CombatEntity;

    // UI & Visuals
    showDialog(text: string): Promise<void>;
    hideDialog(): void;
    updateHealthUI(target: 'PLAYER' | 'ENEMY', newHp: number, maxHp: number): Promise<void>;
    playAnimation(key: string, target: 'PLAYER' | 'ENEMY'): Promise<void>;
    showDamageNumber(target: 'PLAYER' | 'ENEMY', amount: number, isCritical: boolean, type: string): void;

    // Input
    enablePlayerInput(onActionSelected: (action: BattleAction) => void): void;
    disablePlayerInput(): void;

    // State Access
    isBattleOver(): boolean;
    setBattleOver(winner: 'PLAYER' | 'ENEMY' | 'CAPTURED'): void;

    // Low level
    log(message: string): void;
}

export type BattleActionType = 'ATTACK' | 'ITEM' | 'SWITCH' | 'ESCAPE';

export interface BattleAction {
    type: BattleActionType;
    skill?: Skill;
    item?: Item;
    switchTarget?: MonsterInstance;
}

/**
 * Abstract Base Class for all Battle States
 */
export abstract class BattleState {
    protected context: BattleContext;
    protected stack: BattleStateStack;

    constructor(context: BattleContext, stack: BattleStateStack) {
        this.context = context;
        this.stack = stack;
    }

    /** Called when state is pushed onto the stack */
    abstract enter(): Promise<void>;

    /** Called when state is popped off the stack */
    abstract exit(): Promise<void>;

    /** Called when state, previously paused by a push on top, is resumed */
    abstract resume(): Promise<void>;

    /** Called every frame (optional) */
    update(delta: number): void { }
}

/**
 * Stack Machine to manage Battle States
 */
export class BattleStateStack {
    private stack: BattleState[] = [];
    private context: BattleContext;

    constructor(context: BattleContext) {
        this.context = context;
    }

    public async push(state: BattleState): Promise<void> {
        if (this.stack.length > 0) {
            // The current top state is being paused
            // We might want a pause() method but resume() usually suffices upon return
        }
        this.stack.push(state);
        await state.enter();
    }

    public async pop(): Promise<void> {
        if (this.stack.length === 0) return;

        const state = this.stack.pop();
        if (state) {
            await state.exit();
        }

        const top = this.peek();
        if (top) {
            await top.resume();
        }
    }

    public peek(): BattleState | undefined {
        return this.stack[this.stack.length - 1];
    }

    public clear(): void {
        this.stack = [];
    }

    public update(delta: number): void {
        const top = this.peek();
        if (top) {
            top.update(delta);
        }
    }

    public getContext(): BattleContext {
        return this.context;
    }
}
