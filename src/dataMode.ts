export type DataMode = 'sample' | 'real';

const STORAGE_KEY = 'commandCenter.dataMode';

export interface ModeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function getStoredMode(storage: ModeStorage): DataMode {
  return storage.getItem(STORAGE_KEY) === 'sample' ? 'sample' : 'real';
}

export function setStoredMode(storage: ModeStorage, mode: DataMode): void {
  storage.setItem(STORAGE_KEY, mode);
}
