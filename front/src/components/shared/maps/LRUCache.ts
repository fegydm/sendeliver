// File: src/components/maps/utils/LRUCache.ts
// Last change: Implemented Least Recently Used cache for tile management

// Configurable options
const CONFIG = {
    DEFAULT_CAPACITY: 300,     // Default cache capacity
    CLEANUP_INTERVAL: 60000,   // Cleanup old items every minute
    ITEM_MAX_AGE: 300000,      // Max age of items in cache (5 minutes)
    PRIORITY_BONUS: 600000,    // Bonus lifetime for priority items (10 minutes)
    PRIORITY_RADIUS: 3,        // Number of tiles around priority point
  };
  
  // Rozšírená LRU cache s prioritami
  export class LRUCache<K, V> {
    private capacity: number;
    private cache = new Map<K, V>();
    private usage = new Map<K, number>();
    private priorities = new Map<K, number>();
    private lastCleanup = 0;
    
    constructor(capacity: number = CONFIG.DEFAULT_CAPACITY) {
      this.capacity = capacity;
    }
    
    get(key: K): V | undefined {
      const now = performance.now();
      
      if (now - this.lastCleanup > CONFIG.CLEANUP_INTERVAL) {
        this.cleanup();
        this.lastCleanup = now;
      }
      
      if (this.cache.has(key)) {
        this.usage.set(key, now);
        return this.cache.get(key);
      }
      return undefined;
    }
    
    has(key: K): boolean {
      return this.cache.has(key);
    }
    
    // Nastavenie hodnoty s prioritou
    set(key: K, value: V, priority: number = 0): void {
      const now = performance.now();
      
      if (this.cache.size >= this.capacity && !this.cache.has(key)) {
        const oldestKey = this.findOldestKey();
        if (oldestKey) {
          this.cache.delete(oldestKey);
          this.usage.delete(oldestKey);
          this.priorities.delete(oldestKey);
        }
      }
      
      this.cache.set(key, value);
      this.usage.set(key, now);
      
      if (priority > 0) {
        this.priorities.set(key, priority);
      }
    }
    
    // Nastavenie priority pre existujúcu položku
    setPriority(key: K, priority: number): void {
      if (this.cache.has(key)) {
        this.priorities.set(key, priority);
      }
    }
    
    delete(key: K): boolean {
      const deleted = this.cache.delete(key);
      this.usage.delete(key);
      this.priorities.delete(key);
      return deleted;
    }
    
    clear(): void {
      this.cache.clear();
      this.usage.clear();
      this.priorities.clear();
    }
    
    // Veľkosť cache
    size(): number {
      return this.cache.size;
    }
    
    // Vyčistenie starých položiek, berúc do úvahy priority
    private cleanup(): void {
      const now = performance.now();
      const normalMaxAge = CONFIG.ITEM_MAX_AGE;
      
      for (const [key, time] of this.usage.entries()) {
        const priority = this.priorities.get(key) || 0;
        // Čím vyššia priorita, tým dlhší čas do expirácie
        const maxAge = normalMaxAge + (priority * CONFIG.PRIORITY_BONUS);
        
        if (now - time > maxAge) {
          this.cache.delete(key);
          this.usage.delete(key);
          this.priorities.delete(key);
        }
      }
    }
    
    // Nájdenie najstarších položiek s ohľadom na priority
    private findOldestKey(): K | null {
      let oldestKey: K | null = null;
      let oldestAdjustedTime = Infinity;
      const now = performance.now();
      
      for (const [key, time] of this.usage.entries()) {
        const priority = this.priorities.get(key) || 0;
        // Upravený čas berúci do úvahy prioritu
        const adjustedTime = time + (priority * CONFIG.PRIORITY_BONUS);
        
        if (adjustedTime < oldestAdjustedTime) {
          oldestKey = key;
          oldestAdjustedTime = adjustedTime;
        }
      }
      
      return oldestKey;
    }
  }