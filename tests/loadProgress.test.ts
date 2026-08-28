import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadProgress } from '../src/loadProgress';

describe('loadProgress', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches .colaberry/progress.json relative to the page', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ stories: [] }) });
    vi.stubGlobal('fetch', fetchMock);
    const result = await loadProgress();
    expect(fetchMock).toHaveBeenCalledWith('./.colaberry/progress.json', expect.anything());
    expect(result.data).toEqual({ stories: [] });
  });

  it('reports an error instead of throwing when the fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const result = await loadProgress();
    expect(result.data).toBeNull();
    expect(result.error).toBe('offline');
  });
});
