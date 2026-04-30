import { expect, it } from "vitest";
import {
  buildWorkspaceAssistantHref,
  getAssistantStageLabel,
  normalizeAssistantTeamLabel,
} from "./useWorkspaceAssistant.shared";

it("builds a thread URL by replacing draft state and preserving unrelated params", () => {
  expect(
    buildWorkspaceAssistantHref({
      pathname: "/ws",
      search: "newThread=1&tab=signals",
      hash: "#section",
      threadId: "thread-A",
    }),
  ).toBe("/ws?tab=signals&threadId=thread-A#section");
});

it("builds a draft URL by removing threadId and stale draft params while keeping the rest of the query", () => {
  expect(
    buildWorkspaceAssistantHref({
      pathname: "/ws",
      search: "threadId=thread-A&newThread=1&tab=signals",
      threadId: null,
    }),
  ).toBe("/ws?tab=signals");
});

it("normalizes workspace team ids into readable Arabic labels", () => {
  expect(normalizeAssistantTeamLabel("team_workspace_projects")).toBe("فريق المشاريع");
  expect(normalizeAssistantTeamLabel("team_workspace_crm")).toBe("فريق CRM");
});

it("uses readable team labels in live assistant stage copy", () => {
  expect(
    getAssistantStageLabel(
      true,
      {
        seq: 1,
        phase: "team_started",
        status: "running",
        teamId: "team_workspace_projects",
        timestamp: 1,
      },
      "running",
    ),
  ).toBe("فريق المشاريع يعمل الآن...");
});
