import type { ClientProfile } from './clientProfile';

export type PrivacyBreachResult = { ok: true } | { ok: false; reason: string };

const CLIENT_ID_PATTERN = /^CLT-\d+$/;
const EMAIL_PATTERN = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const SSN_PATTERN = /\b\d{3}-\d{2}-\d{4}\b/;
const PHONE_PATTERN = /\b\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/;
const CREDIT_CARD_PATTERN = /\b(?:\d[ -]?){13,16}\b/;

function findPiiPattern(value: string): string | null {
  if (EMAIL_PATTERN.test(value)) return 'an email address';
  if (SSN_PATTERN.test(value)) return 'a Social Security Number';
  if (CREDIT_CARD_PATTERN.test(value)) return 'a credit card number';
  if (PHONE_PATTERN.test(value)) return 'a phone number';
  return null;
}

function collectStrings(client: ClientProfile): string[] {
  const strings: string[] = [client.name];
  strings.push(...client.preferences.preferredCategories, ...client.preferences.preferredHouses);
  for (const purchase of client.purchaseHistory) {
    strings.push(purchase.productId, purchase.category, purchase.house);
  }
  return strings;
}

/**
 * Flags client data that does not look like the system's fictional sample data — either an
 * id outside the synthetic id space, or a field shaped like real PII (email, SSN, phone,
 * card number) that the fictional schema never produces. Used to gate processing before it
 * runs, not just to log after the fact.
 */
export function detectPrivacyBreach(client: ClientProfile): PrivacyBreachResult {
  if (!CLIENT_ID_PATTERN.test(client.id)) {
    return { ok: false, reason: `Client id '${client.id}' does not match the fictional sample-data id pattern.` };
  }

  for (const value of collectStrings(client)) {
    const pii = findPiiPattern(value);
    if (pii) {
      return {
        ok: false,
        reason: `Client data contains what looks like ${pii}, which the fictional sample data never includes.`,
      };
    }
  }

  return { ok: true };
}
