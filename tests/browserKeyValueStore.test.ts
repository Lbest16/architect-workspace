import { afterEach, describe, expect, it, vi } from 'vitest';
import { getBrowserKeyValueStore } from '../src/browserKeyValueStore';

describe('getBrowserKeyValueStore', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reports a meaningful error when no window/localStorage is available', () => {
    const result = getBrowserKeyValueStore();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('not available');
    }
  });

  it('returns a working store when localStorage is present and functional', () => {
    const backing = new Map<string, string>();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => backing.get(key) ?? null,
        setItem: (key: string, value: string) => backing.set(key, value),
        removeItem: (key: string) => backing.delete(key),
      },
    });

    const result = getBrowserKeyValueStore();
    expect(result.ok).toBe(true);
    if (result.ok) {
      result.store.setItem('a', '1');
      expect(result.store.getItem('a')).toBe('1');
    }
    expect(backing.has('__advisor_storage_probe__')).toBe(false);
  });

  it('reports a meaningful error when localStorage throws on the availability probe', () => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => null,
        setItem: () => {
          throw new Error('QuotaExceededError');
        },
        removeItem: () => {},
      },
    });

    const result = getBrowserKeyValueStore();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('QuotaExceededError');
    }
  });
});
