import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadPlan } from '../src/loadPlan';

describe('loadPlan', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches .colaberry/plan.json relative to the page', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ project_name: 'x' }) });
    vi.stubGlobal('fetch', fetchMock);
    const result = await loadPlan();
    expect(fetchMock).toHaveBeenCalledWith('./.colaberry/plan.json', expect.anything());
    expect(result.data).toEqual({ project_name: 'x' });
  });

  it('reports an error instead of throwing when the fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const result = await loadPlan();
    expect(result.data).toBeNull();
    expect(result.error).toBe('offline');
  });
});
