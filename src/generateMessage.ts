import { findMessageTemplate } from './messageTemplates';
import { logMessageGeneration } from './logMessageGeneration';
import type { Opportunity } from './opportunity';
import type { ClientProfile } from './clientProfile';
import type { Product } from './product';
import type { MessageGenerationResult, OutreachMessage } from './message';

function fillTemplate(text: string, values: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => values[key] ?? match);
}

/**
 * Turns an identified opportunity into a personalized, editable draft message.
 * Never sends anything — callers are responsible for routing the returned draft
 * through human approval. Every successful generation is logged via
 * logMessageGeneration for audit.
 */
export function generateMessage(
  opportunity: Opportunity,
  client: ClientProfile,
  catalog: Product[],
  now: Date = new Date(),
): MessageGenerationResult {
  if (!opportunity) {
    return { ok: false, error: 'No opportunity was provided to generate a message for.' };
  }
  if (opportunity.clientId !== client.id) {
    return {
      ok: false,
      error: `Opportunity belongs to client '${opportunity.clientId}', not '${client.id}'.`,
    };
  }

  const templateResult = findMessageTemplate(opportunity.type);
  if (!templateResult.ok) {
    return { ok: false, error: templateResult.error };
  }
  const { template } = templateResult;

  let product: Product | undefined;
  if (opportunity.productId) {
    product = catalog.find((p) => p.id === opportunity.productId);
    if (!product) {
      return {
        ok: false,
        error: `Opportunity references product '${opportunity.productId}', which was not found in the catalog.`,
      };
    }
  }

  const needsProduct = template.subject.includes('{{productName}}') || template.bodyTemplate.includes('{{productName}}');
  if (needsProduct && !product) {
    return {
      ok: false,
      error: `Opportunity type '${opportunity.type}' requires a product, but none was provided.`,
    };
  }

  const preferredCategory =
    (product && client.preferences.preferredCategories.includes(product.category)
      ? product.category
      : client.preferences.preferredCategories[0]) ??
    product?.category ??
    '';

  const values: Record<string, string> = {
    clientName: client.name,
    productName: product?.name ?? '',
    productHouse: product?.house ?? '',
    preferredCategory,
  };

  const subject = fillTemplate(template.subject, values);
  const body = fillTemplate(template.bodyTemplate, values);

  const message: OutreachMessage = {
    clientId: client.id,
    opportunityType: opportunity.type,
    productId: product?.id ?? null,
    subject,
    body,
    characterCount: body.length,
    generatedAt: now.toISOString(),
  };

  logMessageGeneration({ clientId: client.id, loggedAt: now.toISOString(), message });

  return { ok: true, message };
}
