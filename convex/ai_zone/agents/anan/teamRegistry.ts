import { agentFactory, type TeamDefinition } from "../core";
import { ananSearchDefinition } from "../team_search/anan_search/config";
import { ananWebDefinition } from "../team_search/anan_web/config";
import { ananPropertyDefinition } from "../team_property/anan_property/config";
import { ananRecommenderDefinition } from "../team_property/anan_recommender/config";
import { ananFinanceDefinition } from "../team_finance/anan_finance/config";
import { ananBanksDefinition } from "../team_finance/anan_banks/config";
import { ananKnowledgeDefinition } from "../team_knowledge/anan_knowledge/config";
import { ananMemoryDefinition } from "../team_knowledge/anan_memory/config";
import { ananTrainerDefinition } from "../team_trainer/anan_trainer/config";

export const TEAM_REGISTRY: Record<string, TeamDefinition> = {
    team_search: {
        id: "team_search",
        allowedRoles: ["user", "broker", "admin"],
        failureMode: "soft",
        agents: [ananSearchDefinition, ananWebDefinition],
    },
    team_property: {
        id: "team_property",
        allowedRoles: ["user", "broker", "RED", "admin"],
        failureMode: "soft",
        agents: [ananPropertyDefinition, ananRecommenderDefinition],
    },
    team_finance: {
        id: "team_finance",
        allowedRoles: ["user", "admin"],
        failureMode: "soft",
        agents: [ananFinanceDefinition, ananBanksDefinition],
    },
    team_knowledge: {
        id: "team_knowledge",
        allowedRoles: ["user", "broker", "RED", "admin"],
        failureMode: "soft",
        agents: [ananKnowledgeDefinition, ananMemoryDefinition],
    },
    team_trainer: {
        id: "team_trainer",
        allowedRoles: ["admin"],
        failureMode: "soft",
        agents: [ananTrainerDefinition],
    },
};

export function getAvailableTeams(role: string): string[] {
    return Object.values(TEAM_REGISTRY)
        .filter((team) => team.allowedRoles.includes(role as any))
        .map((team) => team.id);
}

export function getTeamDefinitions(teamNames: string[]): TeamDefinition[] {
    return teamNames
        .map((teamName) => TEAM_REGISTRY[teamName])
        .filter(Boolean);
}

export function getTeamAgents(teamNames: string[]) {
    return agentFactory.createMany(
        getTeamDefinitions(teamNames).flatMap((team) => team.agents),
    );
}
