import { describe, expect, it } from 'vitest';
import type { KeyValueStore } from '../src/keyValueStore';

describe('KeyValueStore shape', () => {
  it('accepts an in-memory implementation that round-trips a value', () => {
    const backing = new Map<string, string>();
    const store: KeyValueStore = {
      getItem: (key) => backing.get(key) ?? null,
      setItem: (key, value) => backing.set(key, value),
      removeItem: (key) => backing.delete(key),
    };

    store.setItem('a', '1');
    expect(store.getItem('a')).toBe('1');
    store.removeItem('a');
    expect(store.getItem('a')).toBeNull();
  });
});
