import { useState, useEffect } from 'react';

// Intelligente Suchlogik mit Fuzzy Matching und Auto-Complete

interface SearchSuggestion {
  text: string;
  type: 'category' | 'location' | 'product' | 'service';
  confidence: number;
  metadata?: Record<string, unknown>;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  price?: number;
  score: number;
}

// Fuzzy Matching Algorithm
export function fuzzyMatch(query: string, text: string): number {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  if (textLower.includes(queryLower)) {
    return 1.0; // Exact substring match
  }
  
  let score = 0;
  let queryIndex = 0;
  let consecutiveMatches = 0;
  
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      score += 1;
      consecutiveMatches += 1;
      queryIndex++;
      
      // Bonus für aufeinanderfolgende Matches
      if (consecutiveMatches > 1) {
        score += 0.1;
      }
    } else {
      consecutiveMatches = 0;
    }
  }
  
  // Normalisiere Score basierend auf Query-Länge
  return score / queryLower.length;
}

// Smart Search mit verschiedenen Algorithmen
export function smartSearch(query: string, data: Record<string, unknown>[]): SearchResult[] {
  const results: SearchResult[] = [];
  
  for (const item of data) {
    let score = 0;
    
    // Titel Match (höchste Priorität)
    if (item.title) {
      score += fuzzyMatch(query, String(item.title)) * 3;
    }
    
    // Beschreibung Match
    if (item.description) {
      score += fuzzyMatch(query, String(item.description)) * 1.5;
    }
    
    // Kategorie Match
    if (item.category) {
      score += fuzzyMatch(query, String(item.category)) * 2;
    }
    
    // Location Match
    if (item.location) {
      score += fuzzyMatch(query, String(item.location)) * 1.8;
    }
    
    // Tags Match
    if (item.tags && Array.isArray(item.tags)) {
      for (const tag of item.tags) {
        score += fuzzyMatch(query, tag) * 1.2;
      }
    }
    
    if (score > 0) {
      results.push({
        id: String(item.id),
        title: String(item.title),
        description: String(item.description),
        category: String(item.category),
        location: String(item.location),
        price: item.price as number | undefined,
        score
      });
    }
  }
  
  // Sortiere nach Score (höchste zuerst)
  return results.sort((a, b) => b.score - a.score);
}

// Auto-Complete mit ML-basierten Vorschlägen
export function generateIntelligentSuggestions(
  partialQuery: string, 
  searchHistory: Array<{query: string; category: string}>,
  popularSearches: Array<{query: string; count: number}>
): SearchSuggestion[] {
  const suggestions: SearchSuggestion[] = [];
  
  // 1. Vorschläge aus Suchhistorie
  const historySuggestions = searchHistory
    .filter(entry => 
      entry.query.toLowerCase().includes(partialQuery.toLowerCase())
    )
    .map(entry => ({
      text: entry.query,
      type: 'category' as const,
      confidence: 0.9,
      metadata: { source: 'history', category: entry.category }
    }));
  
  suggestions.push(...historySuggestions);
  
  // 2. Beliebte Suchen
  const popularSuggestions = popularSearches
    .filter(entry => 
      entry.query.toLowerCase().includes(partialQuery.toLowerCase())
    )
    .map(entry => ({
      text: entry.query,
      type: 'product' as const,
      confidence: 0.8,
      metadata: { source: 'popular', count: entry.count }
    }));
  
  suggestions.push(...popularSuggestions);
  
  // 3. Intelligente Kategorie-Vorschläge
  const categorySuggestions = generateCategorySuggestions(partialQuery);
  suggestions.push(...categorySuggestions);
  
  // 4. Location-basierte Vorschläge
  const locationSuggestions = generateLocationSuggestions(partialQuery);
  suggestions.push(...locationSuggestions);
  
  // Entferne Duplikate und sortiere nach Confidence
  const uniqueSuggestions = suggestions.filter((suggestion, index, self) =>
    index === self.findIndex(s => s.text === suggestion.text)
  );
  
  return uniqueSuggestions.sort((a, b) => b.confidence - a.confidence);
}

function generateCategorySuggestions(query: string): SearchSuggestion[] {
  const categories = [
    'Elektronik', 'Auto & Motorrad', 'Immobilien', 'Mode & Beauty',
    'Sport & Freizeit', 'Haus & Garten', 'Bücher & Medien',
    'Spielzeug & Hobby', 'Tiere', 'Musik & Instrumente'
  ];
  
  return categories
    .filter(category => 
      category.toLowerCase().includes(query.toLowerCase())
    )
    .map(category => ({
      text: category,
      type: 'category' as const,
      confidence: 0.7,
      metadata: { source: 'category' }
    }));
}

function generateLocationSuggestions(query: string): SearchSuggestion[] {
  const locations = [
    'Berlin', 'München', 'Hamburg', 'Köln', 'Frankfurt',
    'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig'
  ];
  
  return locations
    .filter(location => 
      location.toLowerCase().includes(query.toLowerCase())
    )
    .map(location => ({
      text: location,
      type: 'location' as const,
      confidence: 0.6,
      metadata: { source: 'location' }
    }));
}

// Debounced Search Hook
export function useDebouncedSearch<T>(
  searchFunction: (query: string) => T[],
  delay: number = 300
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      if (query.trim()) {
        setIsLoading(true);
        try {
          const searchResults = searchFunction(query);
          setResults(searchResults);
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsLoading(false);
      }
    }, delay);
    
    return () => clearTimeout(handler);
  }, [query, searchFunction, delay]);
  
  return {
    query,
    setQuery,
    results,
    isLoading
  };
}

// Advanced Filter System
export interface FilterConfig {
  type: 'range' | 'select' | 'date' | 'boolean' | 'multi-select';
  key: string;
  label: string;
  options?: Array<{value: string; label: string; count?: number}>;
  validation?: (value: any) => boolean;
  defaultValue?: any;
}

export function createDynamicFilter(config: FilterConfig) {
  return {
    ...config,
    validate: (value: unknown) => {
      if (config.validation) {
        return config.validation(value);
      }
      return true;
    },
    getDisplayValue: (value: unknown) => {
      if (config.type === 'select' && config.options) {
        const option = config.options.find(opt => opt.value === value);
        return option ? option.label : value;
      }
      return value;
    }
  };
}

// Search Query Builder
export function buildSearchQuery(filters: Record<string, unknown>): string {
  const parts: string[] = [];
  
  for (const [key, value] of Object.entries(filters)) {
    if (value && value !== '') {
      if (Array.isArray(value)) {
        parts.push(`${key}:${value.join(',')}`);
      } else {
        parts.push(`${key}:${value}`);
      }
    }
  }
  
  return parts.join(' ');
}

// Search Query Parser
export function parseSearchQuery(query: string): Record<string, unknown> {
  const filters: Record<string, unknown> = {};
  const parts = query.split(' ');
  
  for (const part of parts) {
    const [key, value] = part.split(':');
    if (key && value) {
      if (value.includes(',')) {
        filters[key] = value.split(',');
      } else {
        filters[key] = value;
      }
    }
  }
  
  return filters;
}

// Performance-optimierte Suchfunktion mit Caching
export class SearchCache {
  private cache = new Map<string, {results: unknown[]; timestamp: number}>();
  private maxAge = 5 * 60 * 1000; // 5 Minuten
  
  search(query: string, searchFunction: (query: string) => unknown[]): unknown[] {
    const cacheKey = query.toLowerCase().trim();
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.maxAge) {
      return cached.results;
    }
    
    const results = searchFunction(query);
    this.cache.set(cacheKey, {
      results,
      timestamp: Date.now()
    });
    
    return results;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  getCacheSize(): number {
    return this.cache.size;
  }
}

export const searchCache = new SearchCache(); 
