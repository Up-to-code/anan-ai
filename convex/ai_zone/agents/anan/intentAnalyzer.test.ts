import { describe, expect, it } from "vitest";
import { resolveDeterministicIntentTeams, shouldIncludePlatformTeam } from "./intentAnalyzer";

describe("intentAnalyzer platform gating", () => {
  it("detects platform/backend questions (english)", () => {
    expect(shouldIncludePlatformTeam("How do I write a Convex mutation safely?")).toBe(true);
    expect(shouldIncludePlatformTeam("Explain withSearchIndex and searchIndex")).toBe(true);
    expect(shouldIncludePlatformTeam("How should authz and ownership checks work?")).toBe(true);
  });

  it("detects platform/backend questions (arabic)", () => {
    expect(shouldIncludePlatformTeam("عايز قواعد الصلاحيات في كونفكس")).toBe(true);
    expect(shouldIncludePlatformTeam("إزاي أعمل ويبهوك idempotent؟")).toBe(true);
  });

  it("does not trigger for normal user intent", () => {
    expect(shouldIncludePlatformTeam("ابحث عن شقة في الرياض بـ 800 ألف")).toBe(false);
    expect(shouldIncludePlatformTeam("عايز أفضل مشروع في جدة")).toBe(false);
  });
});

describe("intentAnalyzer deterministic routing", () => {
  const availableTeams = ["team_search", "team_property", "team_finance", "team_knowledge"];

  it("routes simple greetings to knowledge without classifier fanout", () => {
    expect(resolveDeterministicIntentTeams("hi", availableTeams)).toEqual(["team_knowledge"]);
    expect(resolveDeterministicIntentTeams("مرحبا", availableTeams)).toEqual(["team_knowledge"]);
  });

  it("routes clear search and finance terms without classifier dependency", () => {
    expect(resolveDeterministicIntentTeams("ابحث عن شقة بتمويل", availableTeams)).toEqual([
      "team_search",
      "team_property",
      "team_finance",
      "team_knowledge",
    ]);
  });
});
