/**
 * teamRegistry.ts — Team Registry & Role Access Control
 *
 * WHY:   The orchestrator needs to know which agents belong to which team,
 *        and which roles have access to which teams. Centralizing this
 *        makes it easy to add new teams or change role permissions.
 * WHAT:  Two config objects: TEAM_REGISTRY and ROLE_ACCESS.
 * HOW:   Import agent configs from team folders, register them here.
 *
 * TO ADD A NEW TEAM:
 *   1. Import the team's agents from their config files
 *   2. Add a new entry to TEAM_REGISTRY
 *   3. Add the team name to relevant roles in ROLE_ACCESS
 *
 * TO ADD A NEW AGENT TO EXISTING TEAM:
 *   1. Import the agent from its config file
 *   2. Add it to the team's array in TEAM_REGISTRY
 */

import type { AnanAgent } from "../AnanAgent";

// ─── Agent Imports ────────────────────────────────────────────────────────────
import { ananSearch } from "../team_search/anan_search/config";
import { ananWeb } from "../team_search/anan_web/config";
import { ananProperty } from "../team_property/anan_property/config";
import { ananRecommender } from "../team_property/anan_recommender/config";
import { ananFinance } from "../team_finance/anan_finance/config";
import { ananBanks } from "../team_finance/anan_banks/config";
import { ananKnowledge } from "../team_knowledge/anan_knowledge/config";
import { ananMemory } from "../team_knowledge/anan_memory/config";
import { ananTrainer } from "../team_trainer/anan_trainer/config";

// ─── Team Registry ────────────────────────────────────────────────────────────

/**
 * TEAM_REGISTRY — Maps team names to their agents.
 *
 * WHY:   The orchestrator needs to know which agents belong to which team
 *        so it can dispatch the right agents for each task.
 * WHAT:  A lookup table: team name → array of AnanAgent instances.
 *
 * TO ADD A NEW TEAM: Add a new entry here with the team name and its agents.
 */
export const TEAM_REGISTRY: Record<string, AnanAgent[]> = {
    team_search: [ananSearch, ananWeb],
    team_property: [ananProperty, ananRecommender],
    team_finance: [ananFinance, ananBanks],
    team_knowledge: [ananKnowledge, ananMemory],
    team_trainer: [ananTrainer],
};

// ─── Role Access Control ──────────────────────────────────────────────────────

/**
 * ROLE_ACCESS — Defines which teams each role can access.
 *
 * WHY:   Not every role should access every team. Users shouldn't see
 *        admin analytics, and brokers have different tools than developers.
 * WHAT:  Maps role → list of allowed team names.
 *
 * TO EDIT: Add/remove team names to change role permissions.
 */
export const ROLE_ACCESS: Record<string, string[]> = {
    user: ["team_search", "team_property", "team_finance", "team_knowledge"],
    broker: ["team_search", "team_property", "team_knowledge"],
    RED: ["team_property", "team_knowledge"],
    admin: [
        "team_search",
        "team_property",
        "team_finance",
        "team_knowledge",
        "team_trainer",
    ],
};

/**
 * getTeamAgents — Returns all agents for the given team names.
 *
 * WHY:   The orchestrator and intent analyzer both need to resolve
 *        team names into lists of agents.
 * WHAT:  Looks up each team in the registry and returns a flat array.
 *
 * @param teamNames - Array of team names to resolve
 * @returns Flat array of agents from all requested teams
 */
export function getTeamAgents(teamNames: string[]): AnanAgent[] {
    const agents: AnanAgent[] = [];
    for (const teamName of teamNames) {
        const teamAgents = TEAM_REGISTRY[teamName];
        if (teamAgents) agents.push(...teamAgents);
    }
    return agents;
}

/**
 * getAvailableTeams — Returns teams available for a given role.
 *
 * @param role - User role
 * @returns Array of team names accessible by this role
 */
export function getAvailableTeams(role: string): string[] {
    return ROLE_ACCESS[role] ?? ROLE_ACCESS.user;
}

/** Re-export trainer for background use in orchestrate */
export { ananTrainer };
