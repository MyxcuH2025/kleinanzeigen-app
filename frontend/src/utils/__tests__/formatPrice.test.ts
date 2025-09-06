import { formatPrice } from '../formatPrice';

describe('formatPrice Utility', () => {
  it('formats whole numbers correctly', () => {
    expect(formatPrice(100)).toMatch(/^100,00\s*€$/);
    expect(formatPrice(0)).toMatch(/^0,00\s*€$/);
    expect(formatPrice(999)).toMatch(/^999,00\s*€$/);
  });

  it('formats decimal numbers correctly', () => {
    expect(formatPrice(99.99)).toMatch(/^99,99\s*€$/);
    expect(formatPrice(10.50)).toMatch(/^10,50\s*€$/);
    expect(formatPrice(0.01)).toMatch(/^0,01\s*€$/);
  });

  it('formats large numbers correctly', () => {
    expect(formatPrice(1000)).toMatch(/^1\.000,00\s*€$/);
    expect(formatPrice(10000)).toMatch(/^10\.000,00\s*€$/);
    expect(formatPrice(100000)).toMatch(/^100\.000,00\s*€$/);
  });

  it('formats negative numbers correctly', () => {
    expect(formatPrice(-100)).toMatch(/^-100,00\s*€$/);
    expect(formatPrice(-99.99)).toMatch(/^-99,99\s*€$/);
  });

  it('handles edge cases', () => {
    expect(formatPrice(Number.MAX_SAFE_INTEGER)).toContain('€');
    expect(formatPrice(Number.MIN_SAFE_INTEGER)).toContain('€');
  });

  it('uses German locale formatting', () => {
    const result = formatPrice(1234.56);
    // German format: comma as decimal separator, dot as thousands separator
    expect(result).toMatch(/^1\.234,56\s*€$/);
  });

  it('always includes currency symbol', () => {
    expect(formatPrice(0)).toContain('€');
    expect(formatPrice(100)).toContain('€');
    expect(formatPrice(999.99)).toContain('€');
  });
});
