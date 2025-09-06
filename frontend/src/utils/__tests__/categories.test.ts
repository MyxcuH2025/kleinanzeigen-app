import { 
  CATEGORIES, 
  getAllCategories, 
  getCategoryBySlug, 
  getCategoriesByTheme,
  type Category 
} from '../categories';

describe('Categories Utilities', () => {
  describe('CATEGORIES constant', () => {
    it('contains kleinanzeigen categories', () => {
      expect(CATEGORIES.kleinanzeigen).toHaveLength(8);
      expect(CATEGORIES.kleinanzeigen[0]).toEqual({
        id: "1",
        name: "Elektronik",
        slug: "elektronik",
        icon: "devices",
        color: "#1976d2",
        bgColor: "#e3f2fd"
      });
    });

    it('contains autos categories', () => {
      expect(CATEGORIES.autos).toHaveLength(4);
      expect(CATEGORIES.autos[0]).toEqual({
        id: "9",
        name: "Auto Teile",
        slug: "auto-teile",
        icon: "build",
        color: "#607d8b",
        bgColor: "#eceff1"
      });
    });

    it('has valid category structure', () => {
      const allCategories = [...CATEGORIES.kleinanzeigen, ...CATEGORIES.autos];
      
      allCategories.forEach(category => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('slug');
        expect(category).toHaveProperty('icon');
        expect(category).toHaveProperty('color');
        expect(category).toHaveProperty('bgColor');
        
        expect(typeof category.id).toBe('string');
        expect(typeof category.name).toBe('string');
        expect(typeof category.slug).toBe('string');
        expect(typeof category.icon).toBe('string');
        expect(typeof category.color).toBe('string');
        expect(typeof category.bgColor).toBe('string');
      });
    });

    it('has unique IDs across all categories', () => {
      const allCategories = [...CATEGORIES.kleinanzeigen, ...CATEGORIES.autos];
      const ids = allCategories.map(cat => cat.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('has unique slugs across all categories', () => {
      const allCategories = [...CATEGORIES.kleinanzeigen, ...CATEGORIES.autos];
      const slugs = allCategories.map(cat => cat.slug);
      const uniqueSlugs = new Set(slugs);
      
      expect(uniqueSlugs.size).toBe(slugs.length);
    });

    it('has valid color formats', () => {
      const allCategories = [...CATEGORIES.kleinanzeigen, ...CATEGORIES.autos];
      const colorRegex = /^#[0-9A-Fa-f]{6}$/;
      
      allCategories.forEach(category => {
        expect(category.color).toMatch(colorRegex);
        expect(category.bgColor).toMatch(colorRegex);
      });
    });
  });

  describe('getAllCategories', () => {
    it('returns all categories from both themes', () => {
      const result = getAllCategories();
      
      expect(result).toHaveLength(12); // 8 kleinanzeigen + 4 autos
      expect(result).toEqual([
        ...CATEGORIES.kleinanzeigen,
        ...CATEGORIES.autos
      ]);
    });

    it('returns a new array (not reference)', () => {
      const result1 = getAllCategories();
      const result2 = getAllCategories();
      
      expect(result1).toEqual(result2);
      expect(result1).not.toBe(result2); // Different array references
    });

    it('maintains category order', () => {
      const result = getAllCategories();
      
      // First 8 should be kleinanzeigen categories
      expect(result.slice(0, 8)).toEqual(CATEGORIES.kleinanzeigen);
      
      // Last 4 should be autos categories
      expect(result.slice(8)).toEqual(CATEGORIES.autos);
    });
  });

  describe('getCategoryBySlug', () => {
    it('finds category by valid slug', () => {
      const result = getCategoryBySlug('elektronik');
      
      expect(result).toBeDefined();
      expect(result?.name).toBe('Elektronik');
      expect(result?.id).toBe('1');
    });

    it('finds category from autos theme', () => {
      const result = getCategoryBySlug('auto-teile');
      
      expect(result).toBeDefined();
      expect(result?.name).toBe('Auto Teile');
      expect(result?.id).toBe('9');
    });

    it('returns undefined for non-existent slug', () => {
      const result = getCategoryBySlug('non-existent');
      expect(result).toBeUndefined();
    });

    it('handles empty slug', () => {
      const result = getCategoryBySlug('');
      expect(result).toBeUndefined();
    });

    it('handles case-sensitive matching', () => {
      const result = getCategoryBySlug('ELEKTRONIK');
      expect(result).toBeUndefined(); // Should be case-sensitive
    });

    it('finds categories with special characters in slug', () => {
      const result = getCategoryBySlug('mode-beauty');
      expect(result).toBeDefined();
      expect(result?.name).toBe('Mode & Beauty');
    });
  });

  describe('getCategoriesByTheme', () => {
    it('returns kleinanzeigen categories', () => {
      const result = getCategoriesByTheme('kleinanzeigen');
      
      expect(result).toHaveLength(8);
      expect(result).toEqual(CATEGORIES.kleinanzeigen);
    });

    it('returns autos categories', () => {
      const result = getCategoriesByTheme('autos');
      
      expect(result).toHaveLength(4);
      expect(result).toEqual(CATEGORIES.autos);
    });

    it('returns empty array for invalid theme', () => {
      const result = getCategoriesByTheme('invalid-theme' as any);
      expect(result).toEqual([]);
    });

    it('returns array reference', () => {
      const result1 = getCategoriesByTheme('kleinanzeigen');
      const result2 = getCategoriesByTheme('kleinanzeigen');
      
      expect(result1).toEqual(result2);
      expect(result1).toBe(result2); // Same reference
    });
  });

  describe('Category interface validation', () => {
    it('ensures all required properties exist', () => {
      const allCategories = getAllCategories();
      
      allCategories.forEach(category => {
        // Required properties
        expect(category.id).toBeDefined();
        expect(category.name).toBeDefined();
        expect(category.slug).toBeDefined();
        expect(category.icon).toBeDefined();
        expect(category.color).toBeDefined();
        expect(category.bgColor).toBeDefined();
        
        // Non-empty strings
        expect(category.id.length).toBeGreaterThan(0);
        expect(category.name.length).toBeGreaterThan(0);
        expect(category.slug.length).toBeGreaterThan(0);
        expect(category.icon.length).toBeGreaterThan(0);
        expect(category.color.length).toBeGreaterThan(0);
        expect(category.bgColor.length).toBeGreaterThan(0);
      });
    });

    it('has consistent data types', () => {
      const allCategories = getAllCategories();
      
      allCategories.forEach(category => {
        expect(typeof category.id).toBe('string');
        expect(typeof category.name).toBe('string');
        expect(typeof category.slug).toBe('string');
        expect(typeof category.icon).toBe('string');
        expect(typeof category.color).toBe('string');
        expect(typeof category.bgColor).toBe('string');
      });
    });
  });

  describe('Integration tests', () => {
    it('works together with all functions', () => {
      // Get all categories
      const allCategories = getAllCategories();
      
      // Find a specific category by slug
      const elektronik = getCategoryBySlug('elektronik');
      expect(elektronik).toBeDefined();
      
      // Get categories by theme
      const kleinanzeigenCategories = getCategoriesByTheme('kleinanzeigen');
      const autosCategories = getCategoriesByTheme('autos');
      
      // Verify relationships
      expect(allCategories).toHaveLength(kleinanzeigenCategories.length + autosCategories.length);
      expect(allCategories).toContain(elektronik);
      expect(kleinanzeigenCategories).toContain(elektronik);
      expect(autosCategories).not.toContain(elektronik);
    });

    it('handles edge cases gracefully', () => {
      // Empty slug
      expect(getCategoryBySlug('')).toBeUndefined();
      
      // Invalid theme
      expect(getCategoriesByTheme('invalid' as any)).toEqual([]);
      
      // Non-existent slug
      expect(getCategoryBySlug('xyz-123')).toBeUndefined();
    });

    it('maintains data integrity across operations', () => {
      const originalKleinanzeigen = [...CATEGORIES.kleinanzeigen];
      const originalAutos = [...CATEGORIES.autos];
      
      // Perform operations
      const allCategories = getAllCategories();
      const kleinanzeigenByTheme = getCategoriesByTheme('kleinanzeigen');
      const autosByTheme = getCategoriesByTheme('autos');
      
      // Verify original data is unchanged
      expect(CATEGORIES.kleinanzeigen).toEqual(originalKleinanzeigen);
      expect(CATEGORIES.autos).toEqual(originalAutos);
      
      // Verify results are correct
      expect(allCategories).toHaveLength(originalKleinanzeigen.length + originalAutos.length);
      expect(kleinanzeigenByTheme).toEqual(originalKleinanzeigen);
      expect(autosByTheme).toEqual(originalAutos);
    });
  });
});
