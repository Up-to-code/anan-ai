import { expect, it } from "vitest";
import { getWorkspaceAssistantBadges } from "./WorkspaceAssistantBadges";

it("pins the primary workspace assistant badge to Anan AI", () => {
  const badges = getWorkspaceAssistantBadges({
    content: "Ready",
    meta: {
      routing: {
        assistantLabel: "Legacy Label",
        agentName: "anan_workspace_projects",
        primaryTeamId: "team_workspace_projects",
        teamIds: ["team_workspace_projects"],
      },
    },
  });

  expect(badges[0]).toEqual({
    id: "assistant",
    label: "Anan AI",
    tone: "assistant",
  });
  expect(badges[1]).toEqual({
    id: "team_workspace_projects",
    label: "Projects Team",
    tone: "projects",
  });
});

it("keeps Arabic team labels while hiding raw agent names", () => {
  const badges = getWorkspaceAssistantBadges({
    content: "تم تجهيز الرد",
    fallbackAgentName: "anan_workspace_crm",
    fallbackTeamId: "team_workspace_crm",
  });

  expect(badges.map((badge) => badge.label)).toEqual(["Anan AI", "فريق CRM"]);
});
