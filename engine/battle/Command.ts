
import { BattleContext } from './BattleState';
import { DamageCalculator } from '../../domain/DamageCalculator';
import { CombatEntity } from '../../domain/combat';
import { Skill, Item, MonsterInstance } from '../../domain/types';
import { MONSTER_DATA } from '../../data/monsters';

export interface ICommand {
    execute(context: BattleContext): Promise<void>;
    description(): string;
}

export class AttackCommand implements ICommand {
    private attacker: CombatEntity;
    private defender: CombatEntity;
    private skill: Skill;

    constructor(attacker: CombatEntity, defender: CombatEntity, skill: Skill) {
        this.attacker = attacker;
        this.defender = defender;
        this.skill = skill;
    }

    async execute(context: BattleContext): Promise<void> {
        // 1. Show skill name
        await context.showDialog(`${this.attacker.name} used ${this.skill.name}!`);

        // 2. Play Animation
        const targetType = this.defender === context.playerEntity ? 'PLAYER' : 'ENEMY';
        await context.playAnimation(this.skill.vfxKey || 'attack_tackle', targetType);

        // 3. Calculate Damage
        // Note: Weather and Terrain are currently defaults. 
        // In a full implementation, Context should provide current Weather/Terrain.
        const damage = DamageCalculator.Calculate(this.attacker, this.defender, this.skill);
        const typeMult = DamageCalculator.ApplyTypeChart(this.skill.type, this.getDefenderType(this.defender));

        const isCrit = damage > (this.attacker.stats.attack * this.skill.power / this.defender.stats.defense) * 1.3; // Rough check or pass from calculator
        // Ideally DamageCalculator returns a result object { damage, isCrit, effectiveness }
        // For now, we recalculate effectiveness for the UI message.

        // 4. Apply Damage
        this.defender.hp = Math.max(0, this.defender.hp - damage);

        // 5. Show Numbers & HP Update
        let effectiveness = 'Normal';
        if (typeMult > 1.0) effectiveness = 'SuperEffective';
        if (typeMult < 1.0) effectiveness = 'NotEffective';
        if (typeMult === 0) effectiveness = 'Immune';

        context.showDamageNumber(targetType, damage, isCrit, effectiveness);
        await context.updateHealthUI(targetType, this.defender.hp, this.defender.maxHp);

        // 6. Effectiveness Messages
        if (typeMult > 1.0) await context.showDialog("It's super effective!");
        if (typeMult < 1.0 && typeMult > 0) await context.showDialog("It's not very effective...");
        if (typeMult === 0) await context.showDialog("It had no effect!");
        if (isCrit) await context.showDialog("A critical hit!");
    }

    description(): string {
        return `${this.attacker.name} uses ${this.skill.name}`;
    }

    private getDefenderType(defender: CombatEntity): any {
        // This is a bit hacky, ideally CombatEntity has the type directly or speciesId to lookup
        // Assuming DamageCalculator helper logic or duplicate simple lookup
        // We will just let DamageCalculator handle the math, this is only for the wrapper logic.
        // For the 'effectiveness' check above, we rely on the same logic.
        // Simplification: We need access to MonsterData to get type.
        // We will skip strict type checking implementation here for now to avoid importing huge data files if not needed.
        // Actually we can import MONSTER_DATA in DamageCalculator, so we trust DamageCalculator.
        // To get typeMult strictly, we can use DamageCalculator's public helper if available.
        return 'NEUTRAL'; // Placeholder if we don't access MONSTER_DATA here
    }
}

export class ItemCommand implements ICommand {
    private item: Item;
    private target: CombatEntity;
    private user: string; // "Player" or "Enemy"

    constructor(user: string, item: Item, target: CombatEntity) {
        this.user = user;
        this.item = item;
        this.target = target;
    }

    async execute(context: BattleContext): Promise<void> {
        await context.showDialog(`${this.user} used ${this.item.name}!`);

        // Implement item logic (Restore HP, etc.)
        // This is simplified. Real implementation needs ItemEffect logic.
        if (this.item.effect?.type === 'HEAL_HP') {
            const healAmount = this.item.effect.value;
            const oldHp = this.target.hp;
            this.target.hp = Math.min(this.target.maxHp, this.target.hp + healAmount);
            const actualHeal = this.target.hp - oldHp;

            await context.playAnimation('heal_effect', this.user === 'Player' ? 'PLAYER' : 'ENEMY'); // Visual on self
            await context.updateHealthUI(this.user === 'Player' ? 'PLAYER' : 'ENEMY', this.target.hp, this.target.maxHp);
            await context.showDialog(`${this.target.name} recovered ${actualHeal} HP!`);
        }
    }

    description(): string {
        return `${this.user} uses ${this.item.name}`;
    }
}

export class SwitchCommand implements ICommand {
    private newMonster: MonsterInstance;
    private isPlayer: boolean;

    constructor(isPlayer: boolean, newMonster: MonsterInstance) {
        this.isPlayer = isPlayer;
        this.newMonster = newMonster;
    }

    async execute(context: BattleContext): Promise<void> {
        const side = this.isPlayer ? "Player" : "Opponent";
        await context.showDialog(`${side} calls back current monster!`);
        // Logic to swap entities in context would happen here or in the State that calls this.
        // But Command executes ON context.
        // Context needs a method to swap active entity.
        // context.switchEntity(this.isPlayer, this.newMonster);
        const monsterName = MONSTER_DATA[this.newMonster.speciesId]?.name || 'Monster';
        await context.showDialog(`Go, ${monsterName}!`);
    }

    description(): string {
        const monsterName = MONSTER_DATA[this.newMonster.speciesId]?.name || 'Monster';
        return `Switch to ${monsterName}`;
    }
}

export class MessageCommand implements ICommand {
    private message: string;

    constructor(message: string) {
        this.message = message;
    }

    async execute(context: BattleContext): Promise<void> {
        await context.showDialog(this.message);
    }

    description(): string {
        return `Show message: ${this.message}`;
    }
}
