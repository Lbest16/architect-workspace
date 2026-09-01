import { describe, expect, it } from 'vitest';
import type { SessionLoadResult, SessionRecord, SessionSaveResult } from '../src/sessionRecord';

describe('SessionRecord shape', () => {
  it('accepts a fully-formed session record', () => {
    const record: SessionRecord = {
      clientId: 'CLT-1',
      subject: 'A new arrival for you',
      body: 'Thought of you when this landed.',
      queued: true,
      savedAt: '2026-09-01T00:00:00.000Z',
    };

    expect(record.queued).toBe(true);
  });

  it('supports both ok and error save result variants', () => {
    const ok: SessionSaveResult = { ok: true };
    const failed: SessionSaveResult = { ok: false, error: 'could not save' };

    expect(ok.ok).toBe(true);
    expect(failed.ok).toBe(false);
  });

  it('supports both ok and error load result variants, including no saved record', () => {
    const empty: SessionLoadResult = { ok: true, record: null };
    const failed: SessionLoadResult = { ok: false, error: 'corrupted' };

    expect(empty.ok).toBe(true);
    expect(failed.ok).toBe(false);
  });
});
