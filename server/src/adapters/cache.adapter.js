// Simple cache adapter (in-memory, can be replaced by Redis, etc.)
class CacheAdapter {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    return this.store.get(key);
  }

  set(key, value, ttl = 60) {
    this.store.set(key, value);
    if (ttl > 0) {
      setTimeout(() => this.store.delete(key), ttl * 1000);
    }
  }

  del(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

export const cacheAdapter = new CacheAdapter();
