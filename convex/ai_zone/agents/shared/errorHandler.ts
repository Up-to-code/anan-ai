/**
 * errorHandler.ts — Unified Error Handling & Retry Logic
 *
 * WHY:   OpenRouter and LLM providers return 429/5xx errors regularly.
 *        Without retries, a single API hiccup crashes the user's request.
 *        Without fallbacks, a model outage = total service outage.
 * WHAT:  Provides exponential backoff with jitter, fallback model selection,
 *        and partial-failure merging for the multi-agent orchestrator.
 * HOW:   Every agent call is wrapped in withRetry(). If all retries fail,
 *        the agent returns a fallback message instead of crashing.
 *
 * EDIT GUIDE:
 * - To change retry counts: edit DEFAULT_RETRY_CONFIG
 * - To change the fallback model: edit FALLBACK_MODEL
 * - To add new retryable status codes: add to retryableStatusCodes array
 */

// ─── Retry Configuration ─────────────────────────────────────────────────────

/**
 * DEFAULT_RETRY_CONFIG — Applied to every agent by default.
 *
 * WHY:   OpenRouter rate limits (HTTP 429) and temporary server errors
 *        are common. Exponential backoff with jitter avoids thundering herd.
 */
export const DEFAULT_RETRY_CONFIG = {
    /** Maximum number of retry attempts before giving up */
    maxRetries: 3,
    /** Initial delay in milliseconds before first retry */
    initialDelayMs: 1000,
    /** Maximum delay cap (prevents absurdly long waits) */
    maxDelayMs: 10000,
    /** Multiply delay by this factor each retry (1s → 2s → 4s) */
    backoffMultiplier: 2,
    /** Random jitter range in ms, added to prevent synchronized retries */
    jitterMs: 500,
    /** HTTP status codes that should trigger a retry */
    retryableStatusCodes: [429, 408, 500, 502, 503],
};

/**
 * FALLBACK_MODEL — Backup model when the primary is unavailable.
 *
 * WHY:   If the primary model (e.g. gemini-2.5-flash) is down or rate-limited
 *        beyond retries, we still need to respond to the user.
 * WHAT:  A lighter, more available model as a last resort.
 */
export const FALLBACK_MODEL = "google/gemini-2.0-flash";

// ─── Error Types ──────────────────────────────────────────────────────────────

/**
 * AgentError — Structured error from an agent execution.
 *
 * WHY:   We need to distinguish between retryable and non-retryable errors
 *        so the orchestrator knows whether to retry or fallback.
 */
export interface AgentError {
    /** Which agent threw this error */
    agentName: string;
    /** HTTP status code (if applicable) */
    statusCode?: number;
    /** Human-readable error message */
    message: string;
    /** Whether this error is retryable */
    retryable: boolean;
    /** How many retry attempts were made before this error */
    attemptsMade: number;
}

// ─── Retry Logic ──────────────────────────────────────────────────────────────

/**
 * isRetryableError — Determines if an error should trigger a retry.
 *
 * WHY:   Not all errors are retryable. 400 (bad request) means our input is
 *        wrong — retrying won't help. 429 means we're rate-limited — retrying
 *        after a delay will likely succeed.
 * WHAT:  Checks the error's status code against our retryable list.
 * HOW:   Extracts status code from various error shapes (fetch, ConvexError, etc.)
 *
 * @param error - The caught error object
 * @param config - Retry configuration with retryable status codes
 * @returns true if the error should trigger a retry
 */
export function isRetryableError(
    error: unknown,
    config = DEFAULT_RETRY_CONFIG,
): boolean {
    if (!error) return false;

    // Check for HTTP status code in various error shapes
    const statusCode =
        (error as any)?.status ??
        (error as any)?.statusCode ??
        (error as any)?.response?.status;

    if (typeof statusCode === "number") {
        return config.retryableStatusCodes.includes(statusCode);
    }

    // Check for common transient error messages
    const message = (error as any)?.message ?? String(error);
    const transientPatterns = [
        "rate limit",
        "too many requests",
        "timeout",
        "ECONNRESET",
        "ETIMEDOUT",
        "socket hang up",
        "network error",
        "503",
        "502",
        "temporarily unavailable",
    ];

    return transientPatterns.some((p) =>
        message.toLowerCase().includes(p.toLowerCase()),
    );
}

/**
 * calculateDelay — Computes the delay before the next retry attempt.
 *
 * WHY:   Exponential backoff prevents hammering a recovering server.
 *        Jitter prevents all clients from retrying at the exact same moment.
 * WHAT:  delay = min(initialDelay * multiplier^attempt + random_jitter, maxDelay)
 * HOW:   Pure math, no side effects.
 *
 * @param attempt - Current attempt number (0-indexed)
 * @param config - Retry configuration
 * @returns Delay in milliseconds
 */
export function calculateDelay(
    attempt: number,
    config = DEFAULT_RETRY_CONFIG,
): number {
    const exponentialDelay =
        config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt);
    const jitter = Math.random() * config.jitterMs;
    return Math.min(exponentialDelay + jitter, config.maxDelayMs);
}

/**
 * sleep — Async delay utility.
 * @param ms - Milliseconds to wait
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * withRetry — Wraps an async function with retry logic.
 *
 * WHY:   Every LLM call can fail transiently. This wrapper ensures
 *        automatic retries with exponential backoff before giving up.
 * WHAT:  Calls the function, retries on retryable errors, gives up after
 *        maxRetries attempts and throws the last error.
 * HOW:   Loop with try/catch, sleep between attempts.
 *
 * @param fn - The async function to execute with retries
 * @param agentName - Name of the agent (for error reporting)
 * @param config - Retry configuration (defaults to DEFAULT_RETRY_CONFIG)
 * @returns The result of the function if it succeeds within retry limits
 * @throws AgentError if all retry attempts are exhausted
 *
 * @example
 * const result = await withRetry(
 *   () => generateText({ model, prompt }),
 *   "anan_search",
 * );
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    agentName: string,
    config = DEFAULT_RETRY_CONFIG,
): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (!isRetryableError(error, config) || attempt === config.maxRetries) {
                throw {
                    agentName,
                    statusCode:
                        (error as any)?.status ?? (error as any)?.statusCode ?? undefined,
                    message: (error as any)?.message ?? String(error),
                    retryable: isRetryableError(error, config),
                    attemptsMade: attempt + 1,
                } satisfies AgentError;
            }

            const delay = calculateDelay(attempt, config);
            console.warn(
                `[${agentName}] Attempt ${attempt + 1}/${config.maxRetries + 1} failed. ` +
                `Retrying in ${Math.round(delay)}ms... Error: ${(error as any)?.message ?? error}`,
            );
            await sleep(delay);
        }
    }

    // Should never reach here, but TypeScript needs it
    throw lastError;
}

// ─── Fallback Messages ────────────────────────────────────────────────────────

/**
 * FALLBACK_MESSAGES — User-facing error messages per failure scenario.
 *
 * WHY:   When an agent fails, we need to tell the user in Arabic.
 * WHAT:  Predefined messages for different error scenarios.
 */
export const FALLBACK_MESSAGES = {
    /** Single agent failed but others succeeded */
    partialFailure: "بعض البيانات غير متاحة مؤقتاً، تم عرض النتائج المتوفرة.",
    /** All agents failed */
    totalFailure: "الخدمة غير متاحة حالياً، يرجى المحاولة مرة أخرى لاحقاً.",
    /** Orchestrator itself failed */
    orchestratorFailure: "حدث خطأ في المعالجة، يرجى المحاولة مرة أخرى.",
    /** Rate limited */
    rateLimited: "تم تجاوز الحد المسموح من الطلبات، يرجى الانتظار لحظات.",
} as const;
