import { GameState, MonsterInstance, BattleRewards } from '../../domain/types';
import {
    rollLoot,
    addExpToMonster,
    addExpToTamer,
    createMonsterInstance,
    calculateCaptureChance,
    addToInventory,
    consumeItem,
    checkEvolution
} from '../../domain/logic';
import { MONSTER_DATA } from '../../data/monsters';
import { gameRNG } from '../../domain/RNG';
import { gameEvents as bus } from '../EventBus';

/**
 * BattleService
 * 
 * Handles all battle-related logic including:
 * - Battle end processing
 * - Reward distribution
 * - Experience granting
 * - Monster capture mechanics
 * 
 * Extracted from GameStateManager to follow Single Responsibility Principle.
 */
export class BattleService {
    /**
     * Handle the end of a battle
     * @param state Current game state (will be mutated)
     * @param winner Battle outcome
     * @param enemySpeciesId Enemy monster species ID
     * @param enemyLevel Enemy level
     * @param isBoss Whether this was a boss battle
     */
    handleBattleEnd(
        state: GameState,
        winner: 'PLAYER' | 'ENEMY' | 'CAPTURED',
        enemySpeciesId: string,
        enemyLevel: number,
        isBoss: boolean
    ): void {
        if (winner === 'PLAYER') {
            this.grantRewards(state, enemySpeciesId, enemyLevel, isBoss);

            // Story flags for specific bosses
            if (isBoss) {
                if (enemySpeciesId === 'flarelion') state.flags['boss_flarelion_defeated'] = true;
                if (enemySpeciesId === 'krakenwhale') state.flags['boss_krakenwhale_defeated'] = true;
            }

            // Phase 4: Track Combat Achievements
            this.trackAchievement(state, 'combat_first_victory', 1);
            this.trackAchievement(state, 'combat_10_victories', 1);
            this.trackAchievement(state, 'combat_50_victories', 1);
            this.trackAchievement(state, 'combat_100_victories', 1);
        } else if (winner === 'ENEMY') {
            // Reset win streaks
            state.flags['quest_progress_win_streak_10'] = 0;
            state.flags['quest_progress_win_streak_50'] = 0;
        }
        // CAPTURED is already handled by attemptCapture
    }

    /**
     * Grant battle rewards to the player
     * @param state Current game state (will be mutated)
     * @param enemySpeciesId Enemy monster species ID
     * @param enemyLevel Enemy level
     * @param isBoss Whether this was a boss battle
     */
    grantRewards(
        state: GameState,
        enemySpeciesId: string,
        enemyLevel: number,
        isBoss: boolean = false
    ): void {
        const rewards = rollLoot(enemySpeciesId, gameRNG);
        const enemyData = MONSTER_DATA[enemySpeciesId];

        const levelMult = 1 + (enemyLevel - 1) * 0.1;
        rewards.exp = Math.floor(rewards.exp * levelMult);
        rewards.gold = Math.floor(rewards.gold * levelMult);

        if (state.tamer.party.length > 0) {
            this.grantExp(state, state.tamer.party[0].uid, rewards.exp);
        }

        const { tamer: newTamer, leveledUp } = addExpToTamer(state.tamer, rewards.exp);
        newTamer.gold += rewards.gold;

        let updatedInventory = [...newTamer.inventory];
        for (const item of rewards.items) {
            updatedInventory = addToInventory(updatedInventory, item.itemId, item.quantity);
        }
        newTamer.inventory = updatedInventory;

        state.tamer = newTamer;

        // Track quest progress (Wins)
        ['daily_win_3', 'daily_win_5', 'weekly_win_20', 'weekly_win_50', 'win_streak_10', 'win_streak_50'].forEach(qid => {
            const key = `quest_progress_${qid}`;
            state.flags[key] = ((state.flags[key] as number) || 0) + 1;
        });

        if (enemyData) {
            if (enemyData.type === 'FIRE') state.flags['quest_progress_daily_win_fire'] = ((state.flags['quest_progress_daily_win_fire'] as number) || 0) + 1;
            if (enemyData.type === 'WATER') state.flags['quest_progress_daily_win_water'] = ((state.flags['quest_progress_daily_win_water'] as number) || 0) + 1;
            if (enemyData.type === 'GRASS') state.flags['quest_progress_daily_win_grass'] = ((state.flags['quest_progress_daily_win_grass'] as number) || 0) + 1;
            if (enemyData.type === 'ELECTRIC') state.flags['quest_progress_daily_win_electric'] = ((state.flags['quest_progress_daily_win_electric'] as number) || 0) + 1;
            if (enemyData.type === 'NEUTRAL') state.flags['quest_progress_daily_win_neutral'] = ((state.flags['quest_progress_daily_win_neutral'] as number) || 0) + 1;
            if (enemyData.type === 'DARK' || enemyData.type === 'LIGHT') state.flags['quest_progress_daily_win_dark_light'] = ((state.flags['quest_progress_daily_win_dark_light'] as number) || 0) + 1;

            if (enemySpeciesId === 'puffle') state.flags['quest_progress_pesticide_specialist'] = ((state.flags['quest_progress_pesticide_specialist'] as number) || 0) + 1;
        }

        if (isBoss) {
            state.flags['quest_progress_weekly_boss_slayer_3'] = ((state.flags['quest_progress_weekly_boss_slayer_3'] as number) || 0) + 1;
        }

        const goldKey = 'quest_progress_daily_earn_500';
        state.flags[goldKey] = ((state.flags[goldKey] as number) || 0) + rewards.gold;
        const weeklyGoldKey = 'quest_progress_weekly_earn_5000';
        state.flags[weeklyGoldKey] = ((state.flags[weeklyGoldKey] as number) || 0) + rewards.gold;

        bus.emitEvent({ type: 'REWARD_EARNED', rewards });
    }

    /**
     * Grant experience to a specific monster
     * @param state Current game state (will be mutated)
     * @param monsterUid Monster unique ID
     * @param amount Experience amount
     */
    grantExp(state: GameState, monsterUid: string, amount: number): void {
        const partyIndex = state.tamer.party.findIndex(m => m.uid === monsterUid);
        if (partyIndex !== -1) {
            const { monster, leveledUp } = addExpToMonster(state.tamer.party[partyIndex], amount, state);
            state.tamer.party[partyIndex] = monster;
            if (leveledUp) {
                const options = checkEvolution(monster, state);
                if (options.length > 0) {
                    bus.emitEvent({ type: 'EVOLUTION_READY', monsterUid, options });
                }
            }
        }
    }

    /**
     * Attempt to capture an enemy monster
     * @param state Current game state (will be mutated)
     * @param enemySpeciesId Enemy species ID
     * @param enemyLevel Enemy level
     * @param currentHp Enemy current HP
     * @param maxHp Enemy max HP
     * @param updateReputation Callback to update faction reputation
     * @returns true if capture was successful, false otherwise
     */
    attemptCapture(
        state: GameState,
        enemySpeciesId: string,
        enemyLevel: number,
        currentHp: number,
        maxHp: number,
        updateReputation: (faction: string, delta: number) => void
    ): boolean {
        const inv = state.tamer.inventory;
        const orbIndex = inv.findIndex(i => i.itemId === 'capture_orb');
        if (orbIndex === -1 || inv[orbIndex].quantity <= 0) return false;

        state.tamer.inventory = consumeItem(state.tamer.inventory, 'capture_orb', 1);

        const chance = calculateCaptureChance(enemySpeciesId, currentHp, maxHp);
        const success = gameRNG.chance(chance);

        if (success) {
            const monster = createMonsterInstance(enemySpeciesId, enemyLevel);
            if (state.tamer.party.length < state.tamer.unlockedPartySlots) {
                state.tamer.party.push(monster);
            } else if (state.tamer.storage.length < state.tamer.unlockedStorageSlots) {
                state.tamer.storage.push(monster);
            } else {
                // Storage full!
                bus.emitEvent({ type: 'LOG_MESSAGE', message: 'Storage is full! Captured monster escaped.' });
                return true; // Still technically a "successful" capture act but result is loss
            }

            if (!state.tamer.collection.includes(enemySpeciesId)) {
                state.tamer.collection.push(enemySpeciesId);
            }

            const enemyData = MONSTER_DATA[enemySpeciesId];
            if (enemyData) {
                updateReputation(enemyData.faction, 5);

                // Track Rare Hunter progress
                const isRareOrHigher = ['Rare', 'Epic', 'Legendary'].includes(enemyData.rarity);
                if (isRareOrHigher) {
                    state.flags['captured_rare_or_higher'] = true;
                }
                if (enemyData.rarity === 'Legendary') {
                    state.flags['captured_legendary'] = true;
                }
            }

            // First Capture story quest flag
            state.flags['first_capture_done'] = true;

            // Track weekly monster capture progress
            ['daily_capture_1', 'daily_capture_3', 'weekly_monster_collector', 'weekly_capture_5_rare'].forEach(qid => {
                if (qid === 'weekly_capture_5_rare' && !['Rare', 'Epic', 'Legendary'].includes(enemyData?.rarity || '')) return;
                const captureKey = `quest_progress_${qid}`;
                state.flags[captureKey] = ((state.flags[captureKey] as number) || 0) + 1;
            });

            // Captures count as wins for streaks
            ['daily_win_3', 'daily_win_5', 'weekly_win_20', 'weekly_win_50', 'win_streak_10', 'win_streak_50'].forEach(qid => {
                const key = `quest_progress_${qid}`;
                state.flags[key] = ((state.flags[key] as number) || 0) + 1;
            });

            // Phase 4: Track Achievements
            this.trackAchievement(state, 'collection_first_capture', 1);
            this.trackAchievement(state, 'collection_' + state.tamer.collection.length + '_species', 0);
            const speciesCount = state.tamer.collection.length;
            if (speciesCount >= 5) this.trackAchievement(state, 'collection_5_species', 0);
            if (speciesCount >= 10) this.trackAchievement(state, 'collection_10_species', 0);
        }

        return success;
    }

    /**
     * Track achievement progress
     * @param state Current game state (will be mutated)
     * @param achievementId Achievement ID
     * @param incrementBy Amount to increment
     */
    private trackAchievement(state: GameState, achievementId: string, incrementBy: number = 1): void {
        const current = state.tamer.achievementProgress[achievementId] || 0;
        state.tamer.achievementProgress[achievementId] = current + incrementBy;
    }
}

// Export singleton instance for backward compatibility
export const battleService = new BattleService();
