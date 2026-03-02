/**
 * Agent, channel, request logging – consolidated in one file.
 * Plan: Keep logger + utilities in lib/core together.
 */

export type LogPayload = Record<string, unknown>;

function isTruthy(value: string | undefined): boolean {
  if (value == null || typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return ["1", "true", "yes", "on"].includes(normalized);
}

export function isAgentDebugEnabled(): boolean {
  const env = typeof process !== "undefined" ? process.env?.NODE_ENV : undefined;
  if (env === "production") return false;
  const flag = typeof process !== "undefined" ? process.env?.AGENT_DEBUG_LOGS : undefined;
  return isTruthy(flag);
}

export function debugLog(scope: string, event: string, payload: LogPayload = {}): void {
  if (!isAgentDebugEnabled()) return;
  const timestamp = new Date().toISOString();
  console.debug(`[agent_debug] ${timestamp} ${scope}.${event}`, payload);
}

export async function withDebugTiming<T>(
  scope: string,
  event: string,
  payload: LogPayload,
  fn: () => Promise<T>,
): Promise<T> {
  const startedAt = Date.now();
  debugLog(scope, `${event}_start`, payload);
  try {
    const result = await fn();
    debugLog(scope, `${event}_success`, {
      ...payload,
      durationMs: Date.now() - startedAt,
    });
    return result;
  } catch (error) {
    debugLog(scope, `${event}_error`, {
      ...payload,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/** Search lifecycle – stage, status, source, resultCount. Pass-through for ctx when needed. */
export function logSearchLifecycle(
  _ctx: unknown,
  _appApi: unknown,
  args: { query: string; userId?: string; channel?: string; stage: string; status: string; source?: string; resultCount?: number; errorMessage?: string },
): void {
  debugLog("search_lifecycle", args.stage, {
    query: args.query,
    userId: args.userId,
    channel: args.channel,
    status: args.status,
    source: args.source,
    resultCount: args.resultCount,
    errorMessage: args.errorMessage,
  });
}
