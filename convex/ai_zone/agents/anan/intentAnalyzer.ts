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
import type { OrchestratorId } from "../types";

const PLATFORM_KEYWORDS = [
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
] as const;

const PLATFORM_ARABIC_KEYWORDS = [
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
] as const;

const GREETING_PATTERN =
  /^(hi|hello|hey|good morning|good evening|السلام عليكم|اهلا|أهلا|مرحبا|صباح الخير|مساء الخير)[\s!.؟?]*$/i;

const SEARCH_INTENT_KEYWORDS = [
  "search",
  "find",
  "property",
  "apartment",
  "villa",
  "unit",
  "شقة",
  "فيلا",
  "عقار",
  "وحدة",
  "ابحث",
  "دور",
  "عايز",
  "أريد",
];

const FINANCE_INTENT_KEYWORDS = [
  "mortgage",
  "finance",
  "loan",
  "bank",
  "installment",
  "تمويل",
  "قرض",
  "بنك",
  "تقسيط",
  "قسط",
];

function includesAnyKeyword(source: string, keywords: readonly string[]) {
  return keywords.some((keyword) => source.includes(keyword));
}

function buildIntentPrompt(prompt: string, availableTeams: string[]) {
  return `You are an intent classifier for a real estate AI platform.
Given the user's message, determine which teams should handle it.

Available teams: ${availableTeams.join(", ")}
Team descriptions:
- team_search: Property search, web data retrieval
- team_property: Property matching, comparison, analysis, recommendations
- team_finance: Mortgage calculations, financing, bank products
- team_knowledge: Knowledge base retrieval, RAG context
- team_platform: Platform/backend architecture, Convex best practices, authorization, zones, performance, webhooks, agents/tools

User message: "${prompt}"

Respond with ONLY a JSON array of team names. Example: ["team_search", "team_finance"]
Always include "team_knowledge" for context.`;
}

async function runIntentModel(
  ctx: ActionCtx,
  prompt: string,
  availableTeams: string[],
  modelOverride: string | undefined,
  orchestratorId: OrchestratorId,
) {
  const model = getChatModel(modelOverride, orchestratorId);
  const modelName = modelOverride ?? getAgentLLMConfigSafe(orchestratorId)?.model ?? "unknown";
  const { text } = await cachedGenerateText(
    ctx,
    {
      model: model as any,
      prompt: buildIntentPrompt(prompt, availableTeams),
      temperature: 0.1,
    },
    {
      modelName,
      tags: [orchestratorId === "anan_workspace" ? "anan_workspace_orchestrator" : "anan_orchestrator", "intent"],
      metadata: { availableTeamsCount: availableTeams.length },
    },
  );
  return text;
}

function parseIntentTeams(text: string) {
  const match = text.match(/\[.*\]/s);
  if (!match) return null;
  return JSON.parse(match[0]) as string[];
}

function applyPlatformTeamFilter(teams: string[], availableTeams: string[], prompt: string) {
  const wantsPlatform = shouldIncludePlatformTeam(prompt);
  if (!availableTeams.includes("team_platform")) return teams;
  if (wantsPlatform) return Array.from(new Set([...teams, "team_platform"]));
  return teams.filter((team) => team !== "team_platform");
}

function fallbackTeams(availableTeams: string[], prompt: string) {
  const deterministic = resolveDeterministicIntentTeams(prompt, availableTeams);
  if (deterministic) return deterministic;

  const wantsPlatform = shouldIncludePlatformTeam(prompt);
  return availableTeams.filter((team) => {
    if (team === "team_platform") return wantsPlatform;
    return true;
  });
}

function includeKnowledge(teams: string[], availableTeams: string[]) {
  return Array.from(new Set([
    ...teams.filter((team) => availableTeams.includes(team)),
    ...(availableTeams.includes("team_knowledge") ? ["team_knowledge"] : []),
  ]));
}

/**
 * WHY:   Obvious small turns should not need a classifier LLM, especially when provider auth is degraded.
 * WHAT:  Returns role-safe teams for greetings and clear keyword intents, or null when the LLM should decide.
 * HOW:   Uses conservative keyword checks and always includes knowledge when available.
 */
export function resolveDeterministicIntentTeams(prompt: string, availableTeams: string[]) {
  const normalizedPrompt = prompt.toLowerCase().trim();
  if (!normalizedPrompt) return includeKnowledge([], availableTeams);

  if (GREETING_PATTERN.test(prompt.trim())) {
    return includeKnowledge([], availableTeams);
  }

  if (shouldIncludePlatformTeam(prompt)) {
    return includeKnowledge(["team_platform"], availableTeams);
  }

  const teams: string[] = [];
  if (includesAnyKeyword(normalizedPrompt, SEARCH_INTENT_KEYWORDS)) {
    teams.push("team_search", "team_property");
  }
  if (includesAnyKeyword(normalizedPrompt, FINANCE_INTENT_KEYWORDS)) {
    teams.push("team_finance");
  }

  return teams.length > 0 ? includeKnowledge(teams, availableTeams) : null;
}

/**
 * WHY:   Platform questions require the dedicated platform agent to avoid noisy routing.
 * WHAT:  Heuristic detector for platform-related keywords in a user prompt.
 * HOW:   Matches Arabic and English keyword lists against the prompt text.
 */
export function shouldIncludePlatformTeam(prompt: string) {
  const normalizedPrompt = prompt.toLowerCase();
  return (
    includesAnyKeyword(normalizedPrompt, PLATFORM_KEYWORDS) ||
    includesAnyKeyword(prompt, PLATFORM_ARABIC_KEYWORDS)
  );
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
  orchestratorId: OrchestratorId = "anan",
): Promise<string[]> {
  const deterministicTeams = resolveDeterministicIntentTeams(prompt, availableTeams);
  if (deterministicTeams) return deterministicTeams;

  try {
    const text = await runIntentModel(ctx, prompt, availableTeams, modelOverride, orchestratorId);
    const parsedTeams = parseIntentTeams(text);
    if (parsedTeams) {
      const availableParsedTeams = parsedTeams.filter((team) => availableTeams.includes(team));
      return applyPlatformTeamFilter(availableParsedTeams, availableTeams, prompt);
    }
  } catch (error) {
    console.warn("[anan] Intent analysis failed, dispatching all teams:", error);
  }
  return fallbackTeams(availableTeams, prompt);
}
