/**
 * Serper web search internal action. Used with Action Cache for searchSaudiLoans.
 */
import { internalAction } from "../../../../../_generated/server";
import { v } from "convex/values";
import { sanitizeWebText } from "../../../../../shared_logic/lib/core/utilities";
import { fetchJsonWithRetry } from "../../../../../shared_logic/lib/httpFetch";
import { detectPreferredLanguage } from "../../../../../shared_logic/lib/language";

function readPositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const SERPER_TIMEOUT_MS = readPositiveInt(process.env.SERPER_WEB_ACTION_TIMEOUT_MS, 7000);
const SERPER_MAX_RETRIES = readPositiveInt(process.env.SERPER_WEB_ACTION_MAX_RETRIES, 2);

type SerperSearchArgs = { query: string; num?: number; deep?: boolean };
type SerperSearchResult =
  | { ok: true; results: Array<{ title: string; url: string; snippet: string }>; queriesUsed: string[] }
  | { ok: false; error: string };

const DEFAULT_SEARCH_ERROR = "Web search request failed";

function resolveLocaleParams(query: string) {
  const preferredLanguage = detectPreferredLanguage(query);
  return preferredLanguage === "ar" ? { gl: "sa", hl: "ar" } : { gl: "us", hl: "en" };
}

function buildSerperPayload(args: SerperSearchArgs) {
  return {
    q: args.query,
    num: Math.min(args.deep ? 10 : args.num ?? 5, 10),
    ...resolveLocaleParams(args.query),
  };
}

function mapOrganicResults(organic?: Array<{ title?: string; link?: string; snippet?: string }>) {
  return (organic ?? []).map((entry) => ({
    title: sanitizeWebText(entry.title),
    url: entry.link ?? "",
    snippet: sanitizeWebText(entry.snippet),
  }));
}

function toSearchError(error: unknown): string {
  return error instanceof Error ? error.message : DEFAULT_SEARCH_ERROR;
}

export const runSerperWebSearch = internalAction({
  args: {
    query: v.string(),
    num: v.optional(v.number()),
    deep: v.optional(v.boolean()),
  } as any,
  handler: async (
    _ctx: any,
    { query, num = 5, deep = false }: SerperSearchArgs,
  ): Promise<SerperSearchResult> => {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "Web search is not configured (missing SERPER_API_KEY)." };
    }
    try {
      const data = await fetchJsonWithRetry<{
        organic?: Array<{ title?: string; link?: string; snippet?: string }>;
      }>(
        "https://google.serper.dev/search",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-API-KEY": apiKey },
          body: JSON.stringify(buildSerperPayload({ query, num, deep })),
        },
        { timeoutMs: SERPER_TIMEOUT_MS, maxRetries: SERPER_MAX_RETRIES }
      );
      return {
        ok: true as const,
        results: mapOrganicResults(data.organic),
        queriesUsed: [query],
      };
    } catch (e) {
      return {
        ok: false as const,
        error: toSearchError(e),
      };
    }
  },
} as any);
