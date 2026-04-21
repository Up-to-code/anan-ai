import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { requireWorkspaceData, getLayoutSidebarData } = vi.hoisted(() => ({
  requireWorkspaceData: vi.fn(),
  getLayoutSidebarData: vi.fn(),
}));
const { getComplianceRulesetForCurrentOrg } = vi.hoisted(() => ({
  getComplianceRulesetForCurrentOrg: vi.fn(),
}));
const { getWorkspaceLocale } = vi.hoisted(() => ({
  getWorkspaceLocale: vi.fn(),
}));

vi.mock("./_lib/workspaceData", () => ({
  requireWorkspaceData,
  getLayoutSidebarData,
}));

vi.mock("@/server/domains/compliance/service", () => ({
  getComplianceRulesetForCurrentOrg,
}));

vi.mock("./_lib/workspaceLocale", () => ({
  getWorkspaceLocale,
}));

vi.mock("./_components/WorkspaceShell", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-slot="workspace-shell">{children}</div>,
}));

import WorkspaceRootLayout from "./layout";

describe("workspace root layout", () => {
  it("mounts the shared workspace shell once at the /ws root", async () => {
    requireWorkspaceData.mockResolvedValue({
      visibleZoneKeys: ["overview", "inbox", "settings"],
    });
    getLayoutSidebarData.mockResolvedValue({
      user: { name: "Ahmed", email: "ahmed@example.com" },
      organizations: [{ id: "org-1", type: "red", name: "Alpha", slug: "alpha", status: "active", isVerified: true }],
      recentAssistantThreads: [],
      allAssistantThreads: [],
      signalCounts: { notificationCount: 0, inboxCount: 0 },
    });
    getComplianceRulesetForCurrentOrg.mockResolvedValue(null);
    getWorkspaceLocale.mockResolvedValue("ar");

    const element = await WorkspaceRootLayout({
      children: <div>Body</div>,
    });
    const markup = renderToStaticMarkup(
      element,
    );

    expect(markup).toContain("Body");
    expect(markup).toContain("data-slot=\"workspace-root-layout\"");
    expect(markup).toContain("workspace-root-chrome");
    expect(markup).toContain("data-slot=\"workspace-shell\"");
  });
});
