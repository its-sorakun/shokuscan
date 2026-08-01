/**
 * LRU Cache implementation using JavaScript's Map.
 *
 * Map maintains insertion order, so the first entry is the least-recently-used.
 * On `get()`, we delete and re-insert the entry to move it to the end (most-recent).
 * On `set()`, if capacity is exceeded, we evict the first entry (least-recent).
 *
 * Time complexity:
 *   - get:  O(1)
 *   - set:  O(1)
 *   - has:  O(1)
 *
 * Space complexity: O(capacity)
 */
export class LRUCache<V> {
  private cache: Map<string, V>;
  private readonly capacity: number;

  constructor(capacity: number = 50) {
    if (capacity < 1) {
      throw new Error('LRUCache capacity must be at least 1');
    }
    this.capacity = capacity;
    this.cache = new Map<string, V>();
  }

  /**
   * Retrieve a value by key. Returns undefined on cache miss.
   * On hit, the entry is promoted to most-recently-used.
   */
  get(key: string): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }

    // Promote to most-recently-used by re-inserting
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  /**
   * Insert or update a key-value pair.
   * If the key already exists, it is updated and promoted.
   * If the cache is full, the least-recently-used entry is evicted.
   */
  set(key: string, value: V): void {
    // If key exists, delete first so re-insert moves it to the end
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict the least-recently-used entry (first key in Map iteration order)
      const lruKey = this.cache.keys().next().value;
      if (lruKey !== undefined) {
        this.cache.delete(lruKey);
      }
    }

    this.cache.set(key, value);
  }

  /**
   * Check if a key exists in the cache without promoting it.
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Remove a specific key from the cache.
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries from the cache.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Current number of entries in the cache.
   */
  get size(): number {
    return this.cache.size;
  }
}
