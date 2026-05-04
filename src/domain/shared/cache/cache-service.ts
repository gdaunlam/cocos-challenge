import { CacheEntry } from './cache-entry';

const MAX_CACHE_SIZE = 100;

class CacheService {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private order: string[] = [];

  private evictIfNeeded(): void {
    while (this.order.length >= MAX_CACHE_SIZE) {
      const oldest = this.order.shift();
      if (oldest) {
        this.cache.delete(oldest);
      }
    }
  }

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (entry) {
      const idx = this.order.indexOf(key);
      if (idx > -1) {
        this.order.splice(idx, 1);
      }
      this.order.push(key);
      return entry.value;
    }
    return undefined;
  }

  set<T>(key: string, value: T): void {
    if (this.cache.has(key)) {
      const idx = this.order.indexOf(key);
      if (idx > -1) {
        this.order.splice(idx, 1);
      }
    }
    this.cache.set(key, { value, timestamp: Date.now() });
    this.order.push(key);
    this.evictIfNeeded();
  }

  invalidate(key: string): void {
    this.cache.delete(key);
    const idx = this.order.indexOf(key);
    if (idx > -1) {
      this.order.splice(idx, 1);
    }
  }

  invalidatePrefix(prefix: string): void {
    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }
    for (const key of keysToDelete) {
      this.invalidate(key);
    }
  }

  clear(): void {
    this.cache.clear();
    this.order = [];
  }
}

export const cacheService = new CacheService();
