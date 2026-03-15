import { describe, expect, it } from "vitest";
import { AGENT_REGISTRY, TEAM_REGISTRY } from "./orchestrationConfig";

describe("anan_workspace orchestrationConfig", () => {
  it("registers workspace teams", () => {
    const ids = Object.keys(TEAM_REGISTRY);
    expect(ids).toEqual(
      expect.arrayContaining([
        "team_workspace_projects",
        "team_workspace_offers",
        "team_workspace_crm",
        "team_workspace_org",
        "team_workspace_inbox",
      ]),
    );
  });

  it("registers workspace agents", () => {
    const ids = Object.keys(AGENT_REGISTRY);
    expect(ids).toEqual(
      expect.arrayContaining([
        "anan_workspace_projects",
        "anan_workspace_offers",
        "anan_workspace_crm",
        "anan_workspace_org",
        "anan_workspace_inbox",
      ]),
    );
  });
});
