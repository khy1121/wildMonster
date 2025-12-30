
import { BattleState, BattleContext, BattleAction } from './BattleState';
import { ICommand, AttackCommand, MessageCommand } from './Command';
import { Skill } from '../../domain/types';
import { SKILL_DATA } from '../../data/skills';

/**
 * Initial State: Intro
 */
export class BattleInitState extends BattleState {
    async enter(): Promise<void> {
        await this.context.showDialog(`Wild ${this.context.enemyEntity.name} appeared!`);
        await this.context.showDialog(`Go! ${this.context.playerEntity.name}!`);
        // Push Turn Start
        await this.stack.push(new TurnStartState(this.context, this.stack));
    }
    async exit(): Promise<void> { }
    async resume(): Promise<void> { }
}

/**
 * Turn Start: Pre-turn checks
 */
export class TurnStartState extends BattleState {
    async enter(): Promise<void> {
        // e.g. "It's raining!"
        // Then push Player Action Selection
        await this.stack.push(new PlayerActionSelectionState(this.context, this.stack));
    }
    async exit(): Promise<void> { }
    async resume(): Promise<void> {
        // If we return to TurnStart (e.g. after a full turn cycle), strictly speaking we should probably Loop or pop self.
        // But usually we want to loop turns.
        // Design: The stack will probably Pop everything back to empty and push TurnStart again? 
        // Or ActionSelection pops itself, Execution pops itself, returns here?
        // Let's assume TurnLoop manages this. For now, we'll just loop by pushing itself again or handling in resume.
        // Actually, cleaner is: Init -> Push TurnStart -> Push Input -> Push Execute -> Pop Execute -> Pop Input -> Pop TurnStart?? No.

        // Better flow:
        // Init -> Input
        // Input -> (Selects) -> EnemyInput -> Execute
        // Execute -> (Done) -> Pop back to Input? Or TurnStart?
        // Let's say we chain:
        // Input (when resumed) -> check if battle over? -> start new turn (reset)?

        // Simple Recursive Approach:
        // TurnStart calls Input. Input calls Execute. Execute pops.
        // When Input resumes (turn done), Input pops.
        // TurnStart resumes. TurnStart starts over (re-enters logic).

        await this.stack.push(new PlayerActionSelectionState(this.context, this.stack));
    }
}

/**
 * Player Selection
 */
export class PlayerActionSelectionState extends BattleState {
    async enter(): Promise<void> {
        this.context.enablePlayerInput((action) => {
            this.handleInput(action);
        });
    }

    async handleInput(action: BattleAction) {
        this.context.disablePlayerInput();

        if (action.type === 'ATTACK' && action.skill) {
            // Player chose attack. Now get Enemy Action.
            const enemyAction = this.decideEnemyAction();

            // Go to Execution
            await this.stack.push(new ActionExecutionState(this.context, this.stack, action, enemyAction));
        } else {
            // Handle Item/Switch/Escape
            await this.stack.push(new ActionExecutionState(this.context, this.stack, action, this.decideEnemyAction()));
        }
    }

    decideEnemyAction(): BattleAction {
        // Simple AI: Random Skill
        const skills = this.context.enemyEntity.skills;
        const randomSkillId = skills[Math.floor(Math.random() * skills.length)];
        const skill = SKILL_DATA[randomSkillId];
        // If skill data missing, fallback or skip (simplified)
        if (!skill) return { type: 'ATTACK', skill: SKILL_DATA['tackle'] }; // Fallback
        return { type: 'ATTACK', skill: skill };
    }

    async exit(): Promise<void> { }
    async resume(): Promise<void> {
        // Turn finished
        // Check win condition
        if (this.context.isBattleOver()) {
            this.stack.pop(); // Pop self
            return;
        }

        // Loop: triggering handleInput again? No, we need to wait for input.
        // Re-enable input
        this.context.enablePlayerInput((action) => {
            this.handleInput(action);
        });
    }
}

/**
 * Action Execution: Speed Check and Command Execution
 */
export class ActionExecutionState extends BattleState {
    private playerAction: BattleAction;
    private enemyAction: BattleAction;

    constructor(context: BattleContext, stack: any, playerAction: BattleAction, enemyAction: BattleAction) {
        super(context, stack);
        this.playerAction = playerAction;
        this.enemyAction = enemyAction;
    }

    async enter(): Promise<void> {
        // 1. Determine Order
        const pSpeed = this.context.playerEntity.stats.speed;
        const eSpeed = this.context.enemyEntity.stats.speed;

        // Priority (Escape > Switch > Item > Attack(Speed))
        // Simplified: actions are just attacks for now
        let first = 'PLAYER';
        if (eSpeed > pSpeed) first = 'ENEMY';
        if (pSpeed === eSpeed && Math.random() < 0.5) first = 'ENEMY';

        const firstAction = first === 'PLAYER' ? this.playerAction : this.enemyAction;
        const secondAction = first === 'PLAYER' ? this.enemyAction : this.playerAction;

        // 2. Execute First
        if (!await this.executeAction(first === 'PLAYER', firstAction)) return;

        // 3. Check Faint
        if (this.checkFaint()) return;

        // 4. Execute Second
        if (!await this.executeAction(first !== 'PLAYER', secondAction)) return;

        // 5. Check Faint
        if (this.checkFaint()) return;

        // 6. End of Turn Effects (Burn, etc)
        // await this.processEndTurn();

        // 7. Done
        this.stack.pop();
    }

    async executeAction(isPlayer: boolean, action: BattleAction): Promise<boolean> {
        const attacker = isPlayer ? this.context.playerEntity : this.context.enemyEntity;
        const defender = isPlayer ? this.context.enemyEntity : this.context.playerEntity;

        if (attacker.hp <= 0) return false;

        let command: ICommand | null = null;
        if (action.type === 'ATTACK' && action.skill) {
            command = new AttackCommand(attacker, defender, action.skill);
        } else if (action.type === 'ITEM' && action.item) {
            // command = new ItemCommand(...)
        } else if (action.type === 'SWITCH') {
            // command = new SwitchCommand(...)
        }

        if (command) {
            await command.execute(this.context);
        }
        return true;
    }

    checkFaint(): boolean {
        if (this.context.playerEntity.hp <= 0) {
            this.stack.push(new BattleEndState(this.context, this.stack, 'ENEMY'));
            return true;
        }
        if (this.context.enemyEntity.hp <= 0) {
            this.stack.push(new BattleEndState(this.context, this.stack, 'PLAYER'));
            return true;
        }
        return false;
    }

    async exit(): Promise<void> { }
    async resume(): Promise<void> { }
}

export class BattleEndState extends BattleState {
    private winner: 'PLAYER' | 'ENEMY';
    constructor(context: BattleContext, stack: any, winner: 'PLAYER' | 'ENEMY') {
        super(context, stack);
        this.winner = winner;
    }

    async enter(): Promise<void> {
        if (this.winner === 'PLAYER') {
            await this.context.showDialog(`Wild ${this.context.enemyEntity.name} fainted!`);
            await this.context.showDialog(`You won!`);
        } else {
            await this.context.showDialog(`${this.context.playerEntity.name} fainted!`);
            await this.context.showDialog(`You lost...`);
        }
        this.context.setBattleOver(this.winner);
        // BattleScene should handle the cleanup via setBattleOver or we call a cleanup method
    }
    async exit(): Promise<void> { }
    async resume(): Promise<void> { }
}
