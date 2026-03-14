import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireWorkspaceData, getLayoutSidebarData } = vi.hoisted(() => ({
  requireWorkspaceData: vi.fn(),
  getLayoutSidebarData: vi.fn(),
}));

vi.mock("../_lib/workspaceData", () => ({
  requireWorkspaceData,
  getLayoutSidebarData,
}));

vi.mock("../_components/WorkspaceShell", () => ({
  default: ({
    organization,
    children,
  }: {
    organization: { name: string };
    children?: React.ReactNode;
  }) => <div data-slot="workspace-shell">Shell:{organization.name}{children}</div>,
}));

import WorkspaceOverviewLayout from "./layout";

describe("workspace overview layout", () => {
  beforeEach(() => {
    requireWorkspaceData.mockReset();
    getLayoutSidebarData.mockReset();
  });

  it("renders the shared workspace shell for overview routes", async () => {
    requireWorkspaceData.mockResolvedValue({
      user: { name: "Ahmed", email: "ahmed@example.com" },
      session: { role: "developer" },
      organizations: [
        {
          id: "org-1",
          type: "red",
          name: "Alpha",
          slug: "alpha",
          status: "active",
          isVerified: true,
        },
      ],
    });
    getLayoutSidebarData.mockResolvedValue({
      user: { name: "Ahmed", email: "ahmed@example.com" },
      organizations: [
        {
          id: "org-1",
          type: "red",
          name: "Alpha",
          slug: "alpha",
          status: "active",
          isVerified: true,
        },
      ],
      recentConversations: [],
      allConversations: [],
      signalCounts: { notificationCount: 0, inboxCount: 0 },
    });

    const element = await WorkspaceOverviewLayout({ children: <div>Body</div> });
    const markup = renderToStaticMarkup(element);

    expect(markup).toContain("data-slot=\"workspace-shell\"");
    expect(markup).toContain("Shell:Alpha");
    expect(markup).toContain("Body");
  });
});
