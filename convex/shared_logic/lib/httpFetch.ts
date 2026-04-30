import { fetchJsonWithRetry as sharedFetchJsonWithRetry } from "../../../packages/base-logic/src/http";

type Options = { timeoutMs?: number; maxRetries?: number };

export async function fetchJsonWithRetry<T>(
  url: string,
  init: RequestInit,
  options: Options = {},
): Promise<T> {
  return sharedFetchJsonWithRetry<T>(url, init, {
    ...options,
    env: {
      WEB_FETCH_TIMEOUT_MS: process.env.WEB_FETCH_TIMEOUT_MS,
      WEB_FETCH_MAX_RETRIES: process.env.WEB_FETCH_MAX_RETRIES,
    },
  });
}
