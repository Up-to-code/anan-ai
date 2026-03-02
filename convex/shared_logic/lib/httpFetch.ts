/**
 * HTTP fetch with retry and timeout for Serper/upstream calls.
 */
import { HTTP_RETRY_POLICY, withRetry } from "./retry";

function readPositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const DEFAULT_TIMEOUT_MS = readPositiveInt(process.env.WEB_FETCH_TIMEOUT_MS, 8000);
const DEFAULT_MAX_RETRIES = readPositiveInt(process.env.WEB_FETCH_MAX_RETRIES, 2);

type Options = { timeoutMs?: number; maxRetries?: number };

export async function fetchJsonWithRetry<T>(
  url: string,
  init: RequestInit,
  options: Options = {}
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES; // retries after first attempt

  return await withRetry<T>(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      if (response.ok) return (await response.json()) as T;
      const text = await response.text().catch(() => "");
      throw new Error(`http_${response.status} ${text.slice(0, 120)}`);
    } catch (error) {
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }, {
    ...HTTP_RETRY_POLICY,
    maxAttempts: maxRetries + 1,
  });
}
