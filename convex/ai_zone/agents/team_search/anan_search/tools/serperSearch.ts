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

export const runSerperWebSearch = internalAction({
  args: {
    query: v.string(),
    num: v.optional(v.number()),
    deep: v.optional(v.boolean()),
  } as any,
  handler: async (
    _ctx: any,
    { query, num = 5, deep = false }: { query: string; num?: number; deep?: boolean },
  ): Promise<
    | { ok: true; results: Array<{ title: string; url: string; snippet: string }>; queriesUsed: string[] }
    | { ok: false; error: string }
  > => {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "Web search is not configured (missing SERPER_API_KEY)." };
    }
    try {
      const preferredLanguage = detectPreferredLanguage(query);
      const localeParams =
        preferredLanguage === "ar" ? { gl: "sa", hl: "ar" } : { gl: "us", hl: "en" };
      const data = await fetchJsonWithRetry<{
        organic?: Array<{ title?: string; link?: string; snippet?: string }>;
      }>(
        "https://google.serper.dev/search",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-API-KEY": apiKey },
          body: JSON.stringify({
            q: query,
            num: Math.min(deep ? 10 : num, 10),
            ...localeParams,
          }),
        },
        { timeoutMs: SERPER_TIMEOUT_MS, maxRetries: SERPER_MAX_RETRIES }
      );
      const results = (data.organic ?? []).map((o) => ({
        title: sanitizeWebText(o.title),
        url: o.link ?? "",
        snippet: sanitizeWebText(o.snippet),
      }));
      return {
        ok: true as const,
        results,
        queriesUsed: [query],
      };
    } catch (e) {
      return {
        ok: false as const,
        error: e instanceof Error ? e.message : "Web search request failed",
      };
    }
  },
} as any);
