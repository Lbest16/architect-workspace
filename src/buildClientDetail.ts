import { identifyOpportunity } from './identifyOpportunity';
import { recommendProduct } from './recommendProduct';
import { generateMessage } from './generateMessage';
import { renderClientDetail } from './renderClientDetail';
import { renderClientDetailEmpty } from './renderClientDetailEmpty';
import type { ClientProfile } from './clientProfile';
import type { Product } from './product';

/**
 * Builds the client detail view by running the existing opportunity → recommendation →
 * message pipeline for one client. Falls back to an informative empty state when no
 * opportunity can be identified, rather than a blank or broken panel.
 */
export function buildClientDetail(client: ClientProfile, catalog: Product[], now: Date = new Date()): string {
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
