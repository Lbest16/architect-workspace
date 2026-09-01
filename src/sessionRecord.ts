export interface SessionRecord {
  clientId: string;
  subject: string;
  body: string;
  queued: boolean;
  savedAt: string;
}

export type SessionSaveResult = { ok: true } | { ok: false; error: string };

export type SessionLoadResult = { ok: true; record: SessionRecord | null } | { ok: false; error: string };
