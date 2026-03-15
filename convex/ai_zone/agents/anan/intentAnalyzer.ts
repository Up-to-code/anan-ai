/**
 * intentAnalyzer.ts — LLM-Based Intent Classification
 *
 * WHY:   Not every message needs every agent. "ما سعر الشقة؟" only needs
 *        team_property, while "ابحث لي عن شقة بتمويل" needs search + finance.
 *        Intent analysis prevents wasting tokens on irrelevant agents.
 * WHAT:  Uses a lightweight LLM call to classify user intent into team names.
 * HOW:   Sends the user message to the LLM with a structured prompt asking
 *        which teams are needed. Parses the JSON array response.
 *
 * TO EDIT:
 * - To add a new team description: Add it to the prompt in analyzeIntent()
 * - To change fallback behavior: Edit the catch block
 */

import type { ActionCtx } from "../../../_generated/server";
import { getChatModel } from "../../../shared_logic/lib/providers";
import { cachedGenerateText } from "../../../shared_logic/llmCache";
import { getAgentLLMConfigSafe } from "../config";

/**
 * WHY:   Platform questions require the dedicated platform agent to avoid noisy routing.
 * WHAT:  Heuristic detector for platform-related keywords in a user prompt.
 * HOW:   Matches Arabic and English keyword lists against the prompt text.
 */
export function shouldIncludePlatformTeam(prompt: string) {
    const text = prompt.toLowerCase();
    const keywords = [
        "convex",
        "schema",
        "table",
        "index",
        "searchindex",
        "withsearchindex",
        "query",
        "mutation",
        "action",
        "httpaction",
        "auth",
        "authz",
        "authorization",
        "permission",
        "policy",
        "zone",
        "architecture",
        "security",
        "webhook",
        "idempotency",
        "performance",
        "agent",
        "tools",
        "orchestrator",
        "rag",
        "vector",
        "rate limit",
        "ratelimit",
        "oauth",
    ];

    const arabicKeywords = [
        "كونفكس",
        "صلاحيات",
        "صلاحية",
        "اذونات",
        "أذونات",
        "تفويض",
        "توثيق",
        "أمن",
        "امان",
        "مخطط",
        "سكيمة",
        "استعلام",
        "ويبهوك",
        "أداء",
        "وكيل",
        "وكلاء",
        "أداة",
        "أدوات",
        "معمارية",
    ];

    return keywords.some((k) => text.includes(k)) || arabicKeywords.some((k) => prompt.includes(k));
}

/**
 * analyzeIntent — Determines which teams to dispatch for a message.
 *
 * WHY:   Saves tokens and latency by only dispatching relevant agents.
 * WHAT:  Classifies user intent → returns team names.
 * HOW:   LLM call with structured prompt → parse JSON array from response.
 *
 * @param ctx - Convex action context
 * @param prompt - The user's message
 * @param availableTeams - Teams the user's role has access to
 * @param modelOverride - Optional model override
 * @returns Array of team names to dispatch
 *
 * @example
 * const teams = await analyzeIntent(ctx, "ابحث لي عن شقة", ["team_search", "team_property"]);
 * // → ["team_search", "team_property", "team_knowledge"]
 */
export async function analyzeIntent(
    ctx: ActionCtx,
    prompt: string,
    availableTeams: string[],
    modelOverride?: string,
): Promise<string[]> {
    try {
        const model = getChatModel(modelOverride);
        const modelName = modelOverride ?? getAgentLLMConfigSafe()?.model ?? "unknown";
        const { text } = await cachedGenerateText(
            ctx,
            {
                model: model as any,
                prompt: `You are an intent classifier for a real estate AI platform.
Given the user's message, determine which teams should handle it.

Available teams: ${availableTeams.join(", ")}
Team descriptions:
- team_search: Property search, web data retrieval
- team_property: Property matching, comparison, analysis, recommendations
- team_finance: Mortgage calculations, financing, bank products
- team_knowledge: Knowledge base retrieval, RAG context
- team_platform: Platform/backend architecture, Convex best practices, authorization, zones, performance, webhooks, agents/tools
- team_trainer: (background) Learning from conversations

User message: "${prompt}"

Respond with ONLY a JSON array of team names. Example: ["team_search", "team_finance"]
Always include "team_knowledge" for context. Never include "team_trainer" (it runs separately).`,
                temperature: 0.1,
            },
            {
                modelName,
                tags: ["intent", "anan_orchestrator"],
                metadata: {
                    availableTeamsCount: availableTeams.length,
                },
            },
        );

        // Parse JSON array from response
        const match = text.match(/\[.*\]/s);
        if (match) {
            const teams = JSON.parse(match[0]) as string[];
            let filtered = teams.filter((t) => availableTeams.includes(t));

            const wantsPlatform = shouldIncludePlatformTeam(prompt);
            if (availableTeams.includes("team_platform")) {
                filtered = wantsPlatform
                    ? Array.from(new Set([...filtered, "team_platform"]))
                    : filtered.filter((t) => t !== "team_platform");
            }

            return filtered;
        }
    } catch (error) {
        console.warn("[anan] Intent analysis failed, dispatching all teams:", error);
    }

    // Fallback: dispatch all available teams (except trainer)
    const wantsPlatform = shouldIncludePlatformTeam(prompt);
    return availableTeams.filter((t) => {
        if (t === "team_trainer") return false;
        if (t === "team_platform") return wantsPlatform;
        return true;
    });
}
