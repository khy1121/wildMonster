/**
 * LRU (Least Recently Used) Cache Implementation
 * 
 * Automatically evicts least recently used items when capacity is reached.
 * Used for memory-efficient data caching in DataManager.
 */

export class LRUCache<K, V> {
    private cache: Map<K, V> = new Map();
    private maxSize: number;

    constructor(maxSize: number = 100) {
        this.maxSize = maxSize;
    }

    /**
     * Get value from cache (marks as recently used)
     */
    get(key: K): V | undefined {
        const value = this.cache.get(key);
        if (value !== undefined) {
            // Move to end (most recently used)
            this.cache.delete(key);
            this.cache.set(key, value);
        }
        return value;
    }

    /**
     * Set value in cache (evicts LRU if at capacity)
     */
    set(key: K, value: V): void {
        if (this.cache.has(key)) {
            // Update existing
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            // Evict least recently used (first item)
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
            console.log(`[LRU] Evicted: ${String(firstKey)}`);
        }
        this.cache.set(key, value);
    }

    /**
     * Check if key exists
     */
    has(key: K): boolean {
        return this.cache.has(key);
    }

    /**
     * Delete specific key
     */
    delete(key: K): boolean {
        return this.cache.delete(key);
    }

    /**
     * Clear all entries
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get current size
     */
    get size(): number {
        return this.cache.size;
    }

    /**
     * Get all values
     */
    values(): IterableIterator<V> {
        return this.cache.values();
    }

    /**
     * Iterate over entries
     */
    forEach(callback: (value: V, key: K) => void): void {
        this.cache.forEach(callback);
    }

    /**
     * Get iterator
     */
    [Symbol.iterator](): IterableIterator<[K, V]> {
        return this.cache.entries();
    }

    /**
     * Get entries
     */
    entries(): IterableIterator<[K, V]> {
        return this.cache.entries();
    }
}
