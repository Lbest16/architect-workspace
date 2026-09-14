import type { OutreachMessage } from './message';

export type DraftStatus = 'pending' | 'approved' | 'rejected';

export interface Draft {
  id: string;
  message: OutreachMessage;
  status: DraftStatus;
  queuedAt: string;
}
