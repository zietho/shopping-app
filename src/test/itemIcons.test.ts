import { describe, it, expect } from 'vitest';
import { getItemIcon } from '../lib/itemIcons';

describe('getItemIcon', () => {
  it('returns an emoji for known items', () => {
    expect(getItemIcon('Milch')).toBeTruthy();
    expect(getItemIcon('milk')).toBeTruthy();
    expect(getItemIcon('Bread')).toBeTruthy();
    expect(getItemIcon('Beer')).toBeTruthy();
  });

  it('returns a fallback for unknown items', () => {
    const result = getItemIcon('xyzunknownitem123');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('is case-insensitive', () => {
    expect(getItemIcon('MILK')).toBe(getItemIcon('milk'));
    expect(getItemIcon('Bread')).toBe(getItemIcon('bread'));
  });
});
