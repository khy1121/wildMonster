import { describe, it, expect } from 'vitest';
import { calculateDamage, updateCombatState, CombatEntity } from '../combat';
import { ElementType } from '../types';

describe('Combat Logic', () => {
    const mockAttacker: CombatEntity = {
        uid: 'player',
        name: 'Pyrocat',
        speciesId: 'pyrocat',
        level: 10,
        hp: 100,
        maxHp: 100,
        stats: {
            hp: 100, maxHp: 100, attack: 20, defense: 10,
            specialAttack: 25, skillResistance: 15, speed: 15
        },
        skills: ['scratch', 'ember'],
        cooldowns: {},
        buffs: [],
        enhancementLevel: 0
    };

    const mockDefender: CombatEntity = {
        uid: 'enemy',
        name: 'Droplet',
        speciesId: 'droplet',
        level: 10,
        hp: 100,
        maxHp: 100,
        stats: {
            hp: 100, maxHp: 100, attack: 15, defense: 20,
            specialAttack: 15, skillResistance: 25, speed: 10
        },
        skills: ['tackle', 'bubble'],
        cooldowns: {},
        buffs: [],
        enhancementLevel: 0
    };

    it('calculates physical damage correctly', () => {
        // scratch is BASIC, power 15
        const damage = calculateDamage(mockAttacker, mockDefender, 'scratch');
        // rawDamage = (20 * 15) / 20 = 15
        // 15 * 0.85 = 12.75, 15 * 1.15 = 17.25
        expect(damage).toBeGreaterThanOrEqual(12);
        expect(damage).toBeLessThanOrEqual(18);
    });

    it('calculates special damage correctly', () => {
        // ember is SPECIAL, power 45
        const damage = calculateDamage(mockAttacker, mockDefender, 'ember');
        // rawDamage = (25 * 45) / 25 = 45
        // 45 * 0.85 = 38.25, 45 * 1.15 = 51.75
        expect(damage).toBeGreaterThanOrEqual(38);
        expect(damage).toBeLessThanOrEqual(52);
    });

    it('applies attack buffs to damage', () => {
        const buffedAttacker = {
            ...mockAttacker,
            buffs: [{ id: '1', source: 'cheer', effect: 'BUFF_ATK', power: 10, duration: 5000 } as any]
        };
        const damage = calculateDamage(buffedAttacker, mockDefender, 'scratch');
        // rawDamage = ((20 + 10) * 15) / 20 = 22.5
        // 22.5 * 0.85 = 19.125, 22.5 * 1.15 = 25.875
        expect(damage).toBeGreaterThanOrEqual(19);
        expect(damage).toBeLessThanOrEqual(26);
    });

    it('updates combat state and expires buffs', () => {
        const entity: CombatEntity = {
            ...mockAttacker,
            cooldowns: { 'ember': 2000 },
            buffs: [{ id: '1', source: 'cheer', effect: 'BUFF_ATK', power: 10, duration: 1000 } as any]
        };

        const nextState = updateCombatState(entity, 500);
        expect(nextState.cooldowns['ember']).toBe(1500);
        expect(nextState.buffs[0].duration).toBe(500);

        const finalState = updateCombatState(nextState, 600);
        expect(finalState.buffs.length).toBe(0);
    });
});
