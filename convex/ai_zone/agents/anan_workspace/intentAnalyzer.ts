/**
 * intentAnalyzer.ts — Workspace Intent Classification
 *
 * WHY:   Partner workflows should dispatch only the relevant operational teams.
 * WHAT:  Uses a lightweight LLM call to classify intent into workspace teams.
 * HOW:   Sends the message with a structured prompt and parses the JSON array.
 */

import type { ActionCtx } from "../../../_generated/server";
import { getChatModel } from "../../../shared_logic/lib/providers";
import { cachedGenerateText } from "../../../shared_logic/llmCache";
import { getAgentLLMConfigSafe } from "../config";

export async function analyzeWorkspaceIntent(
  ctx: ActionCtx,
  prompt: string,
  availableTeams: string[],
  modelOverride?: string,
): Promise<string[]> {
  try {
    const model = getChatModel(modelOverride, "anan_workspace");
    const modelName =
      modelOverride ?? getAgentLLMConfigSafe("anan_workspace")?.model ?? "unknown";

    const { text } = await cachedGenerateText(
      ctx,
      {
        model: model as any,
        prompt: `You are an intent classifier for a partner workspace AI assistant.
Given the user's message, determine which teams should handle it.

Available teams: ${availableTeams.join(", ")}
Team descriptions:
- team_workspace_projects: Project creation, updates, publishing, and project ops
- team_workspace_offers: Offer creation, updates, approvals, and commission policy
- team_workspace_crm: CRM pipelines, stages, and follow-ups
- team_workspace_org: Organization setup, access, permissions, and policies
- team_workspace_inbox: Inbox triage, message prioritization, and response steps

User message: "${prompt}"

Respond with ONLY a JSON array of team names. Example: ["team_workspace_projects", "team_workspace_offers"]`,
        temperature: 0.1,
      },
      {
        modelName,
        tags: ["intent", "anan_workspace_orchestrator"],
        metadata: {
          availableTeamsCount: availableTeams.length,
        },
      },
    );

    const match = text.match(/\[.*\]/s);
    if (match) {
      const teams = JSON.parse(match[0]) as string[];
      return teams.filter((t) => availableTeams.includes(t));
    }
  } catch (error) {
    console.warn("[anan_workspace] Intent analysis failed, dispatching all teams:", error);
  }

  return availableTeams;
}
