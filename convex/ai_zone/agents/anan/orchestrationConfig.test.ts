import { describe, expect, it } from "vitest";
import { AGENT_REGISTRY, TEAM_REGISTRY } from "./orchestrationConfig";

describe("anan orchestrationConfig", () => {
  it("registers expected teams", () => {
    const ids = Object.keys(TEAM_REGISTRY);
    expect(ids).toEqual(
      expect.arrayContaining([
        "team_search",
        "team_property",
        "team_finance",
        "team_knowledge",
        "team_platform",
        "team_trainer",
      ]),
    );
  });

  it("registers expected agents", () => {
    const ids = Object.keys(AGENT_REGISTRY);
    expect(ids).toEqual(
      expect.arrayContaining([
        "anan_search",
        "anan_web",
        "anan_property",
        "anan_recommender",
        "anan_finance",
        "anan_banks",
        "anan_knowledge",
        "anan_memory",
        "anan_platform_docs",
        "anan_trainer",
      ]),
    );
  });
});
