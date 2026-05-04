import { describe, expect, it } from "vitest";
import {
  getWorkspaceChromeState,
  matchesWorkspacePath,
  resolveWorkspaceShellVariant,
} from "./workspaceChrome";

describe("workspaceChrome", () => {
  it("centralizes assistant-route detection", () => {
    expect(resolveWorkspaceShellVariant("/ws")).toBe("assistant");
    expect(resolveWorkspaceShellVariant("/ws/settings")).toBe("assistant");
    expect(resolveWorkspaceShellVariant("/ws/projects")).toBe("default");
  });

  it("uses one shared active-route matcher for exact and section routes", () => {
    expect(matchesWorkspacePath("/ws", "/ws")).toBe(true);
    expect(matchesWorkspacePath("/ws/thread", "/ws")).toBe(false);
    expect(matchesWorkspacePath("/ws/inbox", "/ws/inbox")).toBe(true);
    expect(matchesWorkspacePath("/ws/inbox/thread-1", "/ws/inbox")).toBe(true);
  });

  it("derives assistant titles and default zone titles from one helper", () => {
    expect(
      getWorkspaceChromeState({
        pathname: "/ws/notifications",
        visibleZoneKeys: ["overview", "inbox", "settings"],
        locale: "en",
        organizationSubtitle: "Developer workspace",
      }).headerTitle,
    ).toBe("Anan AI");

    expect(
      getWorkspaceChromeState({
        pathname: "/ws/inbox",
        visibleZoneKeys: ["overview", "inbox", "settings"],
        locale: "en",
        organizationSubtitle: "Developer workspace",
      }).headerTitle,
    ).toBe("Inbox");
  });
});
