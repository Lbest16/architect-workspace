import { getDraft, updateDraftStatus } from './draftQueue';
import { logApprovalDecision } from './logApprovalDecision';
import type { ApprovalDecision } from './logApprovalDecision';
import type { Draft } from './draft';

export type DecideDraftResult = { ok: true; draft: Draft } | { ok: false; error: string };

/**
 * The human-approval interface: a reviewer approves or rejects a queued draft. The audit log
 * write happens before the draft's status changes, so a logging failure surfaces as an error
 * result instead of silently letting a decision through unrecorded.
 */
export function decideDraft(
  draftId: string,
  decision: ApprovalDecision,
  approverId: string,
  now: Date = new Date(),
): DecideDraftResult {
  const draft = getDraft(draftId);
  if (!draft) {
    return { ok: false, error: `Draft '${draftId}' was not found in the approval queue.` };
  }
  if (draft.status !== 'pending') {
    return { ok: false, error: `Draft '${draftId}' was already ${draft.status} and cannot be decided again.` };
  }

  try {
    logApprovalDecision({ draftId, decision, approverId, decidedAt: now.toISOString() });
  } catch (err) {
    return {
      ok: false,
      error: `Failed to record approval decision for draft '${draftId}': ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  const updated = updateDraftStatus(draftId, decision);
  if (!updated) {
    return { ok: false, error: `Draft '${draftId}' was removed from the queue while being decided.` };
  }

  return { ok: true, draft: updated };
}
