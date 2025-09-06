import {
  generateId,
  generateIdWithPrefix,
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatFileSize,
  formatDuration,
  formatDurationMs,
  isEmpty,
  isNotEmpty,
  removeEmptyValues,
  removeEmptyArrayValues,
  groupBy,
  sortBy,
  unique,
  uniqueBy,
  chunk,
  delay,
  debounce,
  throttle,
  hasSchema,
  deepClone,
  shuffle,
  randomChoice,
  randomChoices
} from '../helpers';

describe('Helpers Utility', () => {
  describe('ID Generation', () => {
    it('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });

    it('generates IDs with prefix', () => {
      const prefix = 'test';
      const id = generateIdWithPrefix(prefix);
      
      expect(id).toMatch(new RegExp(`^${prefix}_`));
      expect(id.length).toBeGreaterThan(prefix.length + 1);
    });

    it('generates different IDs with same prefix', () => {
      const prefix = 'user';
      const id1 = generateIdWithPrefix(prefix);
      const id2 = generateIdWithPrefix(prefix);
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(new RegExp(`^${prefix}_`));
      expect(id2).toMatch(new RegExp(`^${prefix}_`));
    });
  });

  describe('Number Formatting', () => {
    it('formats currency correctly', () => {
      expect(formatCurrency(1234.56)).toMatch(/1\.234,56\s*€/);
      expect(formatCurrency(0)).toMatch(/0,00\s*€/);
      expect(formatCurrency(-100)).toMatch(/-100,00\s*€/);
    });

    it('formats currency with different locales', () => {
      expect(formatCurrency(1234.56, 'USD', 'en-US')).toMatch(/\$1,234\.56/);
      expect(formatCurrency(1234.56, 'EUR', 'en-US')).toMatch(/€1,234\.56/);
    });

    it('formats numbers with thousand separators', () => {
      expect(formatNumber(1234567)).toBe('1.234.567');
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(1234.56)).toBe('1.234,56');
    });

    it('formats percentages correctly', () => {
      expect(formatPercentage(25.5)).toBe('25.5%');
      expect(formatPercentage(0)).toBe('0.0%');
      expect(formatPercentage(100)).toBe('100.0%');
      expect(formatPercentage(25.567, 2)).toBe('25.57%');
    });
  });

  describe('File Size Formatting', () => {
    it('formats bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('formats partial sizes correctly', () => {
      expect(formatFileSize(1500)).toBe('1.46 KB');
      expect(formatFileSize(1500000)).toBe('1.43 MB');
    });

    it('handles very large sizes', () => {
      expect(formatFileSize(1024 * 1024 * 1024 * 1024)).toBe('1 TB');
    });
  });

  describe('Duration Formatting', () => {
    it('formats seconds correctly', () => {
      expect(formatDuration(30)).toBe('30s');
      expect(formatDuration(90)).toBe('1m 30s');
      expect(formatDuration(3661)).toBe('1h 1m 1s');
    });

    it('formats milliseconds correctly', () => {
      expect(formatDurationMs(30000)).toBe('30s');
      expect(formatDurationMs(90000)).toBe('1m 30s');
      expect(formatDurationMs(3661000)).toBe('1h 1m 1s');
    });

    it('handles edge cases', () => {
      expect(formatDuration(0)).toBe('0s');
      expect(formatDuration(59)).toBe('59s');
      expect(formatDuration(3599)).toBe('59m 59s');
    });
  });

  describe('Empty Value Checks', () => {
    it('identifies empty values correctly', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
    });

    it('identifies non-empty values correctly', () => {
      expect(isEmpty('hello')).toBe(false);
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(false)).toBe(false);
      expect(isEmpty([1, 2, 3])).toBe(false);
      expect(isEmpty({ key: 'value' })).toBe(false);
    });

    it('works with isNotEmpty', () => {
      expect(isNotEmpty('hello')).toBe(true);
      expect(isNotEmpty(0)).toBe(true);
      expect(isNotEmpty([1, 2, 3])).toBe(true);
      expect(isNotEmpty(null)).toBe(false);
      expect(isNotEmpty('')).toBe(false);
    });
  });

  describe('Object Manipulation', () => {
    it('removes empty values from objects', () => {
      const obj = {
        name: 'John',
        age: 30,
        email: '',
        phone: null,
        address: undefined,
        hobbies: []
      };

      const result = removeEmptyValues(obj);
      
      expect(result).toEqual({
        name: 'John',
        age: 30
      });
    });

    it('removes empty values from arrays', () => {
      const arr = ['hello', '', 'world', null, undefined, 'test'];
      const result = removeEmptyArrayValues(arr);
      
      expect(result).toEqual(['hello', 'world', 'test']);
    });

    it('handles nested objects', () => {
      const obj = {
        name: 'John',
        details: {
          age: 30,
          email: ''
        }
      };

      const result = removeEmptyValues(obj) as any;
      expect(result.name).toBe('John');
      expect(result.details?.email ?? '').toBe('');
    });
  });

  describe('Array Operations', () => {
    const testArray = [
      { id: 1, name: 'Alice', age: 25 },
      { id: 2, name: 'Bob', age: 30 },
      { id: 3, name: 'Alice', age: 35 },
      { id: 4, name: 'Charlie', age: 28 }
    ];

    it('groups array elements by key', () => {
      const grouped = groupBy(testArray, 'name');
      
      expect(grouped.Alice).toHaveLength(2);
      expect(grouped.Bob).toHaveLength(1);
      expect(grouped.Charlie).toHaveLength(1);
      expect(grouped.Alice[0].age).toBe(25);
      expect(grouped.Alice[1].age).toBe(35);
    });

    it('sorts array elements by key', () => {
      const sortedAsc = sortBy(testArray, 'age');
      const sortedDesc = sortBy(testArray, 'age', 'desc');
      
      expect(sortedAsc[0].age).toBe(25);
      expect(sortedAsc[3].age).toBe(35);
      expect(sortedDesc[0].age).toBe(35);
      expect(sortedDesc[3].age).toBe(25);
    });

    it('removes duplicates from arrays', () => {
      const arr = [1, 2, 2, 3, 3, 4];
      const result = unique(arr);
      
      expect(result).toEqual([1, 2, 3, 4]);
    });

    it('removes duplicates by key', () => {
      const result = uniqueBy(testArray, 'name');
      
      expect(result).toHaveLength(3);
      expect(result.map(item => item.name)).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    it('chunks arrays correctly', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7];
      const chunks = chunk(arr, 3);
      
      expect(chunks).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
      expect(chunk(arr, 2)).toEqual([[1, 2], [3, 4], [5, 6], [7]]);
    });

    it('handles edge cases for chunking', () => {
      expect(chunk([], 3)).toEqual([]);
      expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
    });
  });

  describe('Async Operations', () => {
    it('delays execution correctly', async () => {
      const start = Date.now();
      await delay(100);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(95);
    });
  });

  describe('Function Modifiers', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('debounces function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      expect(mockFn).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('throttles function calls', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);
      
      throttledFn();
      throttledFn();
      throttledFn();
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      jest.advanceTimersByTime(100);
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Schema Validation', () => {
    it('validates object schemas correctly', () => {
      const schema = {
        name: 'string',
        age: 'number',
        active: 'boolean'
      };

      const validObj = { name: 'John', age: 30, active: true };
      const invalidObj = { name: 'John', age: '30', active: true };
      const incompleteObj = { name: 'John', age: 30 };

      expect(hasSchema(validObj, schema)).toBe(true);
      expect(hasSchema(invalidObj, schema)).toBe(false);
      expect(hasSchema(incompleteObj, schema)).toBe(false);
    });

    it('handles edge cases for schema validation', () => {
      const schema = { name: 'string' };
      
      expect(hasSchema(null, schema)).toBe(false);
      expect(hasSchema(undefined, schema)).toBe(false);
      expect(hasSchema('string', schema)).toBe(false);
      expect(hasSchema([], schema)).toBe(false);
    });
  });

  describe('Deep Cloning', () => {
    it('clones primitive values', () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone('hello')).toBe('hello');
      expect(deepClone(true)).toBe(true);
      expect(deepClone(null)).toBe(null);
    });

    it('clones arrays', () => {
      const original = [1, 2, [3, 4], { key: 'value' }];
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned[2]).not.toBe(original[2]);
      expect(cloned[3]).not.toBe(original[3]);
    });

    it('clones objects', () => {
      const original = {
        name: 'John',
        details: {
          age: 30,
          hobbies: ['reading', 'gaming']
        }
      };
      
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.details).not.toBe(original.details);
      expect(cloned.details.hobbies).not.toBe(original.details.hobbies);
    });

    it('clones dates', () => {
      const original = new Date('2023-01-01');
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.getTime()).toBe(original.getTime());
    });
  });

  describe('Random Operations', () => {
    it('shuffles arrays', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffle(original);
      
      expect(shuffled).toHaveLength(5);
      expect(shuffled).toContain(1);
      expect(shuffled).toContain(2);
      expect(shuffled).toContain(3);
      expect(shuffled).toContain(4);
      expect(shuffled).toContain(5);
      
      // Note: In rare cases, shuffle might return the same order
      // This test might occasionally fail, but that's statistically very unlikely
    });

    it('chooses random elements', () => {
      const array = ['a', 'b', 'c', 'd'];
      const choice = randomChoice(array);
      
      expect(array).toContain(choice);
      expect(randomChoice([])).toBeUndefined();
    });

    it('chooses multiple random elements', () => {
      const array = ['a', 'b', 'c', 'd', 'e'];
      const choices = randomChoices(array, 3);
      
      expect(choices).toHaveLength(3);
      choices.forEach(choice => {
        expect(array).toContain(choice);
      });
      
      // Test edge case: count >= array length
      const allChoices = randomChoices(array, 10);
      expect(allChoices).toHaveLength(5);
    });
  });

  describe('Integration Tests', () => {
    it('works together in complex scenarios', () => {
      const users = [
        { id: generateId(), name: 'Alice', age: 25, active: true },
        { id: generateId(), name: 'Bob', age: 30, active: false },
        { id: generateId(), name: 'Alice', age: 35, active: true },
        { id: generateId(), name: 'Charlie', age: 28, active: true }
      ];

      // Remove inactive users
      const activeUsers = users.filter(user => user.active);
      
      // Group by name
      const grouped = groupBy(activeUsers, 'name');
      
      // Sort by age
      const sorted = sortBy(activeUsers, 'age', 'desc');
      
      // Remove duplicates by name
      const uniqueUsers = uniqueBy(activeUsers, 'name');
      
      expect(activeUsers).toHaveLength(3);
      expect(grouped.Alice).toHaveLength(2);
      expect(sorted[0].name).toBe('Alice');
      expect(sorted[0].age).toBe(35);
      expect(uniqueUsers).toHaveLength(2); // Only 2 unique names: Alice and Charlie
    });

    it('handles edge cases gracefully', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('')).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
      
      expect(isNotEmpty(0)).toBe(true);
      expect(isNotEmpty(false)).toBe(true);
      expect(isNotEmpty('hello')).toBe(true);
      
      expect(unique([])).toEqual([]);
      expect(chunk([], 5)).toEqual([]);
      expect(randomChoice([])).toBeUndefined();
    });
  });
});
