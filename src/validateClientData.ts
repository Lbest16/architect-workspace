import type { ClientPreferences, ClientProfile, Purchase } from './clientProfile';

export type ClientValidationResult = { ok: true; data: ClientProfile } | { ok: false; error: string };

function isIsoDateString(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function validatePurchase(purchase: unknown, index: number): string | null {
  if (typeof purchase !== 'object' || purchase === null) {
    return `purchaseHistory[${index}] must be an object; received ${typeof purchase}.`;
  }
  const p = purchase as Record<string, unknown>;
  if (typeof p.productId !== 'string' || p.productId.trim() === '') {
    return `purchaseHistory[${index}] is missing a valid 'productId'.`;
  }
  if (typeof p.category !== 'string' || p.category.trim() === '') {
    return `purchaseHistory[${index}] is missing a valid 'category'.`;
  }
  if (typeof p.house !== 'string' || p.house.trim() === '') {
    return `purchaseHistory[${index}] is missing a valid 'house'.`;
  }
  if (typeof p.priceUsd !== 'number' || !Number.isFinite(p.priceUsd) || p.priceUsd < 0) {
    return `purchaseHistory[${index}] has an invalid 'priceUsd' — expected a non-negative number.`;
  }
  if (!isIsoDateString(p.purchasedOn)) {
    return `purchaseHistory[${index}] has an invalid 'purchasedOn' date.`;
  }
  return null;
}

function validatePreferences(preferences: unknown): string | null {
  if (typeof preferences !== 'object' || preferences === null) {
    return `Client profile is missing required field 'preferences'.`;
  }
  const prefs = preferences as Record<string, unknown>;
  if (!Array.isArray(prefs.preferredCategories) || !prefs.preferredCategories.every((c) => typeof c === 'string')) {
    return `Client profile field 'preferences.preferredCategories' must be an array of strings.`;
  }
  if (!Array.isArray(prefs.preferredHouses) || !prefs.preferredHouses.every((h) => typeof h === 'string')) {
    return `Client profile field 'preferences.preferredHouses' must be an array of strings.`;
  }
  return null;
}

export function validateClientData(input: unknown): ClientValidationResult {
  if (typeof input !== 'object' || input === null) {
    return { ok: false, error: `Client profile must be an object; received ${typeof input}.` };
  }
  const client = input as Record<string, unknown>;

  if (typeof client.id !== 'string' || client.id.trim() === '') {
    return { ok: false, error: `Client profile is missing required field 'id'.` };
  }
  if (typeof client.name !== 'string' || client.name.trim() === '') {
    return { ok: false, error: `Client profile is missing required field 'name'.` };
  }

  const prefsError = validatePreferences(client.preferences);
  if (prefsError) return { ok: false, error: prefsError };

  if (!Array.isArray(client.purchaseHistory)) {
    return {
      ok: false,
      error: `Client profile field 'purchaseHistory' must be an array; received ${typeof client.purchaseHistory}.`,
    };
  }
  for (let i = 0; i < client.purchaseHistory.length; i++) {
    const err = validatePurchase(client.purchaseHistory[i], i);
    if (err) return { ok: false, error: err };
  }

  if (!isIsoDateString(client.lastContactedOn)) {
    return { ok: false, error: `Client profile is missing a valid 'lastContactedOn' date.` };
  }

  return {
    ok: true,
    data: {
      id: client.id,
      name: client.name,
      preferences: client.preferences as ClientPreferences,
      purchaseHistory: client.purchaseHistory as Purchase[],
      lastContactedOn: client.lastContactedOn,
    },
  };
}
