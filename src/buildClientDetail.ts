import { identifyOpportunity } from './identifyOpportunity';
import { recommendProduct } from './recommendProduct';
import { generateMessage } from './generateMessage';
import { renderClientDetail } from './renderClientDetail';
import { renderClientDetailEmpty } from './renderClientDetailEmpty';
import { logClientDataAccess } from './logClientDataAccess';
import { detectPrivacyBreach } from './detectPrivacyBreach';
import { logSecurityAlert } from './logSecurityAlert';
import { enforceAccessControl } from './enforceAccessControl';
import type { ClientProfile } from './clientProfile';
import type { Product } from './product';

/**
 * Builds the client detail view by running the existing opportunity → recommendation →
 * message pipeline for one client. Falls back to an informative empty state when no
 * opportunity can be identified, rather than a blank or broken panel. Every call is audited;
 * a caller whose role lacks 'view_client_data' is blocked before the privacy check even runs,
 * and a client profile that fails the fictional-data check is blocked before any pipeline
 * stage touches it — each path raises its own alert instead.
 */
export function buildClientDetail(
  client: ClientProfile,
  catalog: Product[],
  now: Date = new Date(),
  role: string = 'advisor',
): string {
  const accessCheck = enforceAccessControl(role, 'view_client_data', now);
  if (!accessCheck.ok) {
    return renderClientDetailEmpty('Access denied', `This role is not permitted to view client data: ${accessCheck.reason}`);
  }

  const breachCheck = detectPrivacyBreach(client);
  if (!breachCheck.ok) {
    logClientDataAccess({ clientId: client.id, accessedAt: now.toISOString(), outcome: 'blocked', reason: breachCheck.reason });
    logSecurityAlert({ clientId: client.id, alertedAt: now.toISOString(), reason: breachCheck.reason });
    return renderClientDetailEmpty('Access blocked', 'This client record failed a privacy check and has been blocked. Security has been alerted.');
  }

  logClientDataAccess({ clientId: client.id, accessedAt: now.toISOString(), outcome: 'allowed' });

  const opportunityResult = identifyOpportunity(client, catalog, now);
  if (!opportunityResult.ok) {
    return renderClientDetailEmpty('No opportunity identified', opportunityResult.error);
  }

  const recommendationResult = recommendProduct(opportunityResult.opportunity, client, catalog, now);
  const messageResult = generateMessage(opportunityResult.opportunity, client, catalog, now);

  return renderClientDetail({
    client,
    opportunity: opportunityResult.opportunity,
    recommendation: recommendationResult.ok ? recommendationResult.recommendation : null,
    recommendationError: recommendationResult.ok ? null : recommendationResult.error,
    message: messageResult.ok ? messageResult.message : null,
    messageError: messageResult.ok ? null : messageResult.error,
  });
}
