export interface FetchJsonResult<T> {
  data: T | null;
  error: string | null;
}

const DEFAULT_TIMEOUT_MS = 5000;
const MAX_ATTEMPTS = 2;

export async function fetchJson<T>(path: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<FetchJsonResult<T>> {
  let lastError = 'unknown error';

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(path, { signal: controller.signal });
      if (!response.ok) {
        lastError = `${path} responded with HTTP ${response.status}`;
        continue;
      }
      const data = (await response.json()) as T;
      return { data, error: null };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    } finally {
      clearTimeout(timer);
    }
  }

  return { data: null, error: lastError };
}
