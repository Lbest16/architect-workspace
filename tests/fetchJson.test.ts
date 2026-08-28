import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchJson } from '../src/fetchJson';

describe('fetchJson', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns parsed data on a successful response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ hello: 'world' }) }),
    );
    const result = await fetchJson<{ hello: string }>('./thing.json');
    expect(result.data).toEqual({ hello: 'world' });
    expect(result.error).toBeNull();
  });

  it('retries once then reports the HTTP status on repeated non-ok responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 404, json: async () => ({}) });
    vi.stubGlobal('fetch', fetchMock);
    const result = await fetchJson('./missing.json');
    expect(result.data).toBeNull();
    expect(result.error).toContain('404');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('retries once then reports the error on repeated network failures', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network down'));
    vi.stubGlobal('fetch', fetchMock);
    const result = await fetchJson('./broken.json');
    expect(result.data).toBeNull();
    expect(result.error).toBe('network down');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('succeeds on the second attempt after one failure', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('flaky'))
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', fetchMock);
    const result = await fetchJson<{ ok: boolean }>('./retry.json');
    expect(result.data).toEqual({ ok: true });
    expect(result.error).toBeNull();
  });
});
