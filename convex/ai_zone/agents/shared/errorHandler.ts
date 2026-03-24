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

export type RetryConfig = typeof DEFAULT_RETRY_CONFIG;

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

const TRANSIENT_ERROR_PATTERNS = [
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

function extractStatusCode(error: unknown): number | undefined {
    const candidate =
        (error as any)?.status ??
        (error as any)?.statusCode ??
        (error as any)?.response?.status;
    return typeof candidate === "number" ? candidate : undefined;
}

function isTransientMessage(error: unknown): boolean {
    const message = (error as any)?.message ?? String(error);
    return TRANSIENT_ERROR_PATTERNS.some((pattern) =>
        message.toLowerCase().includes(pattern.toLowerCase()),
    );
}

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
    const statusCode = extractStatusCode(error);
    if (statusCode !== undefined) {
        return config.retryableStatusCodes.includes(statusCode);
    }
    return isTransientMessage(error);
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

function maybeThrowTerminalRetryError(args: {
    error: unknown;
    agentName: string;
    retryable: boolean;
    attempt: number;
    maxRetries: number;
}) {
    const { error, agentName, retryable, attempt, maxRetries } = args;
    if (retryable && attempt !== maxRetries) {
        return;
    }
    throw {
        agentName,
        statusCode: extractStatusCode(error),
        message: (error as any)?.message ?? String(error),
        retryable,
        attemptsMade: attempt + 1,
    } satisfies AgentError;
}

function logRetryAttempt(args: {
    agentName: string;
    attempt: number;
    maxRetries: number;
    delay: number;
    error: unknown;
}) {
    const { agentName, attempt, maxRetries, delay, error } = args;
    console.warn(
        `[${agentName}] Attempt ${attempt + 1}/${maxRetries + 1} failed. ` +
        `Retrying in ${Math.round(delay)}ms... Error: ${(error as any)?.message ?? error}`,
    );
}

/** Wrap an async operation with retry + backoff behavior. */
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
            const retryable = isRetryableError(error, config);
            maybeThrowTerminalRetryError({ error, agentName, retryable, attempt, maxRetries: config.maxRetries });

            const delay = calculateDelay(attempt, config);
            logRetryAttempt({ agentName, attempt, maxRetries: config.maxRetries, delay, error });
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
