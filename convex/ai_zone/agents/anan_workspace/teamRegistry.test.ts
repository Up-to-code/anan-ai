import { describe, expect, it } from "vitest";
import { getAvailableTeams, getTeamAgents, TEAM_REGISTRY } from "./teamRegistry";

describe("workspace teamRegistry", () => {
  it("filters teams by role", () => {
    expect(getAvailableTeams("RED")).toEqual([
      "team_workspace_projects",
      "team_workspace_offers",
      "team_workspace_crm",
      "team_workspace_org",
      "team_workspace_inbox",
    ]);
  });

  it("creates agents from declarative registry definitions", () => {
    const agents = getTeamAgents(["team_workspace_projects"]);
    expect(agents.length).toBe(1);
    expect(agents[0]?.definition.team).toBe(TEAM_REGISTRY.team_workspace_projects.id);
  });
});
