/**
 * DataManager - Centralized game data loader and cache
 * 
 * Singleton pattern for loading and managing all game data from JSON files.
 * Supports:
 * - Lazy loading with in-memory caching
 * - Data validation on load
 * - Mod override system
 * - Error handling with fallbacks
 */

import { MonsterSpecies, Skill, Item, Equipment, Quest, Region, BossEncounter, NPC } from '../domain/types';
import { DataValidator, ValidationReport } from './DataValidator';
import { LRUCache } from './LRUCache';
import { MONSTER_DATA } from '../data/monsters';
import { BOSSES } from '../data/bosses';

export class DataManager {
    private static instance: DataManager;

    // Data caches (LRU for memory efficiency)
    private monsters: LRUCache<string, MonsterSpecies> = new LRUCache(500); // Increased for Phase 5
    private skills: LRUCache<string, Skill> = new LRUCache(200);
    private items: LRUCache<string, Item> = new LRUCache(200);
    private equipment: LRUCache<string, Equipment> = new LRUCache(100);
    private quests: LRUCache<string, Quest> = new LRUCache(100);
    private regions: LRUCache<string, Region> = new LRUCache(20);
    private bosses: LRUCache<string, BossEncounter> = new LRUCache(20);
    private npcs: LRUCache<string, NPC> = new LRUCache(50);

    // Region-based loading
    private loadedRegions: Set<string> = new Set();
    private currentRegion: string | null = null;

    // Observable pattern for data changes
    private monsterListeners: Set<(id: string, data: MonsterSpecies) => void> = new Set();
    private questListeners: Set<(id: string, data: Quest) => void> = new Set();

    private loaded: boolean = false;
    private validator: DataValidator;

    private constructor() {
        this.validator = new DataValidator();
    }

    /**
     * Get singleton instance
     */
    static getInstance(): DataManager {
        if (!DataManager.instance) {
            DataManager.instance = new DataManager();
        }
        return DataManager.instance;
    }

    /**
     * Load all game data from JSON files
     */
    async loadAllData(): Promise<void> {
        if (this.loaded) {
            console.log('Data already loaded');
            return;
        }

        console.log('Loading game data...');
        const startTime = performance.now();

        try {
            // Load base game data
            await Promise.all([
                this.loadMonsters(),
                this.loadSkills(),
                this.loadItems(),
                this.loadEquipment(),
                this.loadQuests(),
                this.loadRegions(),
                this.loadBosses(),
                this.loadNPCs()
            ]);

            // TODO: Load mods (Phase 2)
            // await this.loadMods();

            this.loaded = true;
            const loadTime = performance.now() - startTime;
            console.log(`✅ Data loaded in ${loadTime.toFixed(2)}ms`);

            // Validate data
            const report = this.validateData();
            this.validator.printReport(report);

            if (report.errors.length > 0) {
                console.error('⚠️ Data validation failed! Game may not function correctly.');
            }
        } catch (error) {
            console.error('Failed to load game data:', error);
            throw error;
        }
    }

    /**
     * Load monsters from JSON
     */
    private async loadMonsters(): Promise<void> {
        try {
            try {
                const response = await fetch('/data/json/monsters.json');
                if (response.ok) {
                    const data = await response.json();
                    for (const [id, monster] of Object.entries(data)) {
                        this.monsters.set(id, monster as MonsterSpecies);
                        MONSTER_DATA[id] = monster as MonsterSpecies; // Legacy Sync
                    }
                }
            } catch (e) {
                console.warn('Base monsters JSON not found or invalid');
            }

            // Load Phase 5 monsters (expansion)
            try {
                const p5Response = await fetch('/data/json/phase5_monsters.json');
                if (p5Response.ok) {
                    const p5Data = await p5Response.json();
                    for (const [id, monster] of Object.entries(p5Data)) {
                        this.monsters.set(id, monster as MonsterSpecies);
                        MONSTER_DATA[id] = monster as MonsterSpecies; // Legacy Sync
                    }
                    console.log(`Loaded Phase 5 monsters`);
                }
            } catch (e) {
                console.warn('Phase 5 monsters JSON not found');
            }

            console.log(`Loaded total ${this.monsters.size} monsters`);
        } catch (error) {
            console.error('Error loading monsters:', error);
            // Fallback to TypeScript imports if JSON fails
            await this.loadMonstersFallback();
        }
    }

    /**
     * Fallback: Load from TypeScript files (for gradual migration)
     */
    /**
     * Fallback: Load from TypeScript imports
     */
    private async loadMonstersFallback(): Promise<void> {
        console.warn('Using TypeScript fallback for monsters');
        const { MONSTER_DATA } = await import('../data/monsters');

        // Also try to load phase 5 monsters if available
        try {
            const { PHASE5_MONSTERS } = await import('../data/phase5Monsters');
            Object.assign(MONSTER_DATA, PHASE5_MONSTERS);
        } catch (e) {
            console.log('Phase 5 monsters not found/loaded in fallback');
        }

        for (const [id, monster] of Object.entries(MONSTER_DATA)) {
            this.monsters.set(id, monster as MonsterSpecies);
        }

        console.log(`Loaded ${this.monsters.size} monsters (fallback)`);
    }

    /**
     * Load region data dynamically
     */
    async loadRegion(regionId: string): Promise<void> {
        if (this.loadedRegions.has(regionId)) {
            // Already loaded, just update current
            this.currentRegion = regionId;
            return;
        }

        console.log(`Loading region: ${regionId}`);

        // In a real implementation, we would fetch specific region JSONs
        // For now, we ensure base data is loaded and mark region as active
        if (!this.loaded) {
            await this.loadAllData();
        }

        this.loadedRegions.add(regionId);
        this.currentRegion = regionId;

        // Simulate region-specific data loading
        const region = this.regions.get(regionId);
        if (region) {
            console.log(`Region ${region.name} loaded with ${region.encounterPool.common.length} common monsters`);
        }
    }

    /**
     * Unload region to free memory
     */
    unloadRegion(regionId: string): void {
        if (!this.loadedRegions.has(regionId)) return;

        // Don't unload current region
        if (regionId === this.currentRegion) return;

        console.log(`Unloading region: ${regionId}`);
        this.loadedRegions.delete(regionId);

        // In a full implementation, we would remove region-specific monsters/NPCs from cache
        // if they are not used in other loaded regions
    }

    /**
     * Subscribe to monster data changes
     */
    onMonsterChange(listener: (id: string, data: MonsterSpecies) => void): () => void {
        this.monsterListeners.add(listener);
        return () => this.monsterListeners.delete(listener);
    }

    /**
     * Update monster data and notify listeners
     */
    updateMonster(id: string, newData: MonsterSpecies): void {
        this.monsters.set(id, newData);
        this.monsterListeners.forEach(listener => listener(id, newData));
    }

    /**
     * Load skills from JSON
     */
    private async loadSkills(): Promise<void> {
        try {
            const response = await fetch('/data/json/skills.json');
            if (!response.ok) {
                throw new Error(`Failed to load skills: ${response.statusText}`);
            }

            const data = await response.json();

            for (const [id, skill] of Object.entries(data)) {
                this.skills.set(id, skill as Skill);
            }

            console.log(`Loaded ${this.skills.size} skills`);
        } catch (error) {
            console.error('Error loading skills:', error);
            await this.loadSkillsFallback();
        }
    }

    private async loadSkillsFallback(): Promise<void> {
        console.warn('Using TypeScript fallback for skills');
        const { SKILL_DATA } = await import('../data/skills');

        for (const [id, skill] of Object.entries(SKILL_DATA)) {
            this.skills.set(id, skill);
        }

        console.log(`Loaded ${this.skills.size} skills (fallback)`);
    }

    /**
     * Load items from JSON
     */
    private async loadItems(): Promise<void> {
        try {
            const response = await fetch('/data/json/items.json');
            if (!response.ok) {
                throw new Error(`Failed to load items: ${response.statusText}`);
            }

            const data = await response.json();

            for (const [id, item] of Object.entries(data)) {
                this.items.set(id, item as Item);
            }

            console.log(`Loaded ${this.items.size} items`);
        } catch (error) {
            console.error('Error loading items:', error);
            await this.loadItemsFallback();
        }
    }

    private async loadItemsFallback(): Promise<void> {
        console.warn('Using TypeScript fallback for items');
        const { ITEM_DATA } = await import('../data/items');

        for (const item of Object.values(ITEM_DATA)) {
            this.items.set(item.id, item);
        }

        console.log(`Loaded ${this.items.size} items (fallback)`);
    }

    /**
     * Load equipment from JSON
     */
    private async loadEquipment(): Promise<void> {
        try {
            const response = await fetch('/data/json/equipment.json');
            if (!response.ok) {
                throw new Error(`Failed to load equipment: ${response.statusText}`);
            }

            const data = await response.json();

            for (const [id, equip] of Object.entries(data)) {
                this.equipment.set(id, equip as Equipment);
            }

            console.log(`Loaded ${this.equipment.size} equipment`);
        } catch (error) {
            console.error('Error loading equipment:', error);
            await this.loadEquipmentFallback();
        }
    }

    private async loadEquipmentFallback(): Promise<void> {
        console.warn('Using TypeScript fallback for equipment');
        const { EQUIPMENT_DATA } = await import('../data/equipment');

        for (const equip of EQUIPMENT_DATA) {
            this.equipment.set(equip.id, equip);
        }

        console.log(`Loaded ${this.equipment.size} equipment (fallback)`);
    }

    /**
     * Load quests, regions, bosses, NPCs (similar pattern)
     */
    private async loadQuests(): Promise<void> {
        // TODO: Implement when quests.json is created
        console.log('Quests: Using TypeScript data');
    }

    private async loadRegions(): Promise<void> {
        try {
            // First load base regions
            const response = await fetch('/data/json/regions.json');
            if (response.ok) {
                const data = await response.json();
                for (const [id, region] of Object.entries(data)) {
                    this.regions.set(id, region as Region);

                    // Add to region inded if needed
                    this.loadedRegions.add(id);
                }
                console.log(`Loaded ${this.regions.size} regions`);
            }
        } catch (error) {
            console.error('Error loading regions:', error);
            // Fallback logic could go here
        }
    }

    private async loadBosses(): Promise<void> {
        try {
            const response = await fetch('/data/json/bosses.json');
            if (response.ok) {
                const data = await response.json();
                for (const [id, boss] of Object.entries(data)) {
                    this.bosses.set(id, boss as BossEncounter);
                    BOSSES[id] = boss as BossEncounter; // Legacy Sync
                }
                console.log(`Loaded ${this.bosses.size} bosses`);
            }
        } catch (error) {
            console.error('Error loading bosses:', error);
            // Fallback could be implemented here if needed
            await this.loadBossesFallback();
        }
    }

    private async loadBossesFallback(): Promise<void> {
        console.warn('Using TypeScript fallback for bosses');
        const { BOSS_DATA } = await import('../data/bosses');
        for (const boss of BOSS_DATA) {
            this.bosses.set(boss.id, boss);
        }
    }

    private async loadNPCs(): Promise<void> {
        // TODO: Implement when npcs.json is created
        console.log('NPCs: Using TypeScript data');
    }

    /**
     * Get monster species by ID
     */
    getMonsterSpecies(id: string): MonsterSpecies | null {
        return this.monsters.get(id) || null;
    }

    /**
     * Get all monsters
     */
    getAllMonsters(): MonsterSpecies[] {
        return Array.from(this.monsters.values());
    }

    /**
     * Get skill by ID
     */
    getSkill(id: string): Skill | null {
        return this.skills.get(id) || null;
    }

    /**
     * Get all skills
     */
    getAllSkills(): Skill[] {
        return Array.from(this.skills.values());
    }

    /**
     * Get item by ID
     */
    getItem(id: string): Item | null {
        return this.items.get(id) || null;
    }

    /**
     * Get equipment by ID
     */
    getEquipment(id: string): Equipment | null {
        return this.equipment.get(id) || null;
    }

    /**
     * Get quest by ID
     */
    getQuest(id: string): Quest | null {
        return this.quests.get(id) || null;
    }

    /**
     * Get region by ID
     */
    getRegion(id: string): Region | null {
        return this.regions.get(id) || null;
    }

    /**
     * Get boss by ID
     */
    getBoss(id: string): BossEncounter | null {
        return this.bosses.get(id) || null;
    }

    /**
     * Get NPC by ID
     */
    getNPC(id: string): NPC | null {
        return this.npcs.get(id) || null;
    }

    /**
     * Validate all loaded data
     */
    validateData(): ValidationReport {
        const monstersObj = Object.fromEntries(this.monsters);
        const skillsObj = Object.fromEntries(this.skills);
        const itemsObj = Object.fromEntries(this.items);
        const equipmentObj = Object.fromEntries(this.equipment);
        const questsObj = Object.fromEntries(this.quests);

        return this.validator.generateReport(
            monstersObj,
            skillsObj,
            itemsObj,
            equipmentObj,
            questsObj
        );
    }

    /**
     * Reload data (for development/modding)
     */
    async reload(): Promise<void> {
        this.monsters.clear();
        this.skills.clear();
        this.items.clear();
        this.equipment.clear();
        this.quests.clear();
        this.regions.clear();
        this.bosses.clear();
        this.npcs.clear();

        this.loaded = false;
        await this.loadAllData();
    }

    /**
     * Check if data is loaded
     */
    isLoaded(): boolean {
        return this.loaded;
    }
}

// Export singleton instance
export const dataManager = DataManager.getInstance();
