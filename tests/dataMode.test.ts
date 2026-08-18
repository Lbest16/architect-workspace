import { describe, expect, it } from 'vitest';
import { getStoredMode, setStoredMode, type ModeStorage } from '../src/dataMode';

function createFakeStorage(): ModeStorage {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

describe('dataMode', () => {
  it('defaults to real when nothing has been stored', () => {
    expect(getStoredMode(createFakeStorage())).toBe('real');
  });

  it('remembers sample once it has been set', () => {
    const storage = createFakeStorage();
    setStoredMode(storage, 'sample');
    expect(getStoredMode(storage)).toBe('sample');
  });

  it('falls back to real for any unrecognized stored value', () => {
    const storage = createFakeStorage();
    storage.setItem('commandCenter.dataMode', 'garbage');
    expect(getStoredMode(storage)).toBe('real');
  });
});
