import { agentFactory, type TeamDefinition } from "../core";
import { TEAM_REGISTRY } from "./orchestrationConfig";

export { TEAM_REGISTRY };

export function getAvailableTeams(role: string): string[] {
  return Object.values(TEAM_REGISTRY)
    .filter((team) => team.allowedRoles.includes(role as any))
    .map((team) => team.id);
}

export function getTeamDefinitions(teamNames: string[]): TeamDefinition[] {
  return teamNames.map((teamName) => TEAM_REGISTRY[teamName]).filter(Boolean);
}

export function getTeamAgents(teamNames: string[]) {
  return agentFactory.createMany(
    getTeamDefinitions(teamNames).flatMap((team) => team.agents),
  );
}
