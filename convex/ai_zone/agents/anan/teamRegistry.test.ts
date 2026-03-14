import { describe, expect, it } from "vitest";
import { getAvailableTeams, getTeamAgents, TEAM_REGISTRY } from "./teamRegistry";

describe("teamRegistry", () => {
  it("filters teams by role", () => {
    expect(getAvailableTeams("RED")).toEqual(["team_property", "team_knowledge", "team_platform"]);
  });

  it("creates agents from declarative registry definitions", () => {
    const agents = getTeamAgents(["team_search"]);
    expect(agents.length).toBe(2);
    expect(agents[0]?.definition.team).toBe(TEAM_REGISTRY.team_search.id);
  });
});
