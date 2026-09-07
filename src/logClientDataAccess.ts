export type ClientDataAccessOutcome = 'allowed' | 'blocked';

export interface ClientDataAccessEntry {
  clientId: string;
  accessedAt: string;
  outcome: ClientDataAccessOutcome;
  reason?: string;
}

const accessLog: ClientDataAccessEntry[] = [];

/** Append-only audit trail of every access to client data, so usage stays inspectable. */
export function logClientDataAccess(entry: ClientDataAccessEntry): void {
  accessLog.push(entry);
}

export function getClientDataAccessLog(): readonly ClientDataAccessEntry[] {
  return accessLog;
}

export function clearClientDataAccessLog(): void {
  accessLog.length = 0;
}
