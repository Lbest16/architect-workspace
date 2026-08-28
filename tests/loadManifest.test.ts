import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadManifest } from '../src/loadManifest';

describe('loadManifest', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches .colaberry/manifest.json relative to the page', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 200, json: async () => ({ generated_at: '2026-08-24T00:00:00.000Z' }) });
    vi.stubGlobal('fetch', fetchMock);
    const result = await loadManifest();
    expect(fetchMock).toHaveBeenCalledWith('./.colaberry/manifest.json', expect.anything());
    expect(result.data).toEqual({ generated_at: '2026-08-24T00:00:00.000Z' });
  });

  it('reports an error instead of throwing when the fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const result = await loadManifest();
    expect(result.data).toBeNull();
    expect(result.error).toBe('offline');
  });
});
