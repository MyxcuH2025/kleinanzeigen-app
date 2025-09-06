// Einfaches Caching-System für API-Aufrufe
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class APICache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL = 5 * 60 * 1000; // 5 Minuten

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Cache-Schlüssel für verschiedene Endpoints
  static keys = {
    categories: 'api:categories',
    listings: 'api:listings',
    userFavorites: (userId: string) => `api:favorites:${userId}`,
    listing: (id: string) => `api:listing:${id}`,
    userListings: (userId: string) => `api:user-listings:${userId}`,
  };
}

export const apiCache = new APICache();

// Hilfsfunktionen für gecachte API-Aufrufe
export const cachedFetch = async <T>(
  url: string, 
  cacheKey: string, 
  ttl: number = 5 * 60 * 1000
): Promise<T> => {
  // Prüfe Cache
  const cached = apiCache.get<T>(cacheKey);
  if (cached) {
    return cached;
  }

  // API-Aufruf
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Cache setzen
  apiCache.set(cacheKey, data, ttl);
  
  return data;
};

// Cache invalidieren
export const invalidateCache = (pattern: string): void => {
  const keys = Array.from(apiCache['cache'].keys());
  keys.forEach(key => {
    if (key.includes(pattern)) {
      apiCache.delete(key);
    }
  });
}; 