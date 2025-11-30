// Recipe caching utilities to reduce backend calls
interface CachedRecipe {
  data: any;
  timestamp: number;
}

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

class RecipeCache {
  private cache: Map<string, CachedRecipe> = new Map();
  private storageKey = 'detailed_recipes_cache';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.entries(parsed).forEach(([key, value]) => {
          // Skip old cache entries without language suffix (migration)
          if (!key.includes('__en') && !key.includes('__fr')) {
            return;
          }
          this.cache.set(key, value as CachedRecipe);
        });
        // Save cleaned cache back to storage
        this.saveToStorage();
      }
    } catch (e) {
      // Failed to load cache, start fresh
    }
  }

  private saveToStorage() {
    try {
      const obj: { [key: string]: CachedRecipe } = {};
      this.cache.forEach((value, key) => {
        obj[key] = value;
      });
      localStorage.setItem(this.storageKey, JSON.stringify(obj));
    } catch (e) {
      // Failed to save cache
    }
  }

  private normalizeKey(key: string, language?: string): string {
    // Normalize the key by trimming and lowercasing, and append language to avoid cross-language duplicates
    const lang = language || localStorage.getItem('app_language') || 'en';
    return `${key.trim().toLowerCase()}__${lang}`;
  }

  get(recipeName: string): any | null {
    const key = this.normalizeKey(recipeName);
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      this.saveToStorage();
      return null;
    }

    return cached.data;
  }

  set(recipeName: string, data: any) {
    const key = this.normalizeKey(recipeName);
    // Add URL to the cached data for better tracking
    const cachedData = {
      ...data,
      _cacheKey: key,
      _searchName: recipeName
    };
    this.cache.set(key, {
      data: cachedData,
      timestamp: Date.now()
    });
    this.saveToStorage();
  }

  clear() {
    this.cache.clear();
    localStorage.removeItem(this.storageKey);
  }

  // Remove old entries
  cleanup() {
    const now = Date.now();
    let cleaned = false;
    this.cache.forEach((value, key) => {
      if (now - value.timestamp > CACHE_DURATION) {
        this.cache.delete(key);
        cleaned = true;
      }
    });
    if (cleaned) this.saveToStorage();
  }
}

export const recipeCache = new RecipeCache();

// Cleanup on app start
recipeCache.cleanup();
