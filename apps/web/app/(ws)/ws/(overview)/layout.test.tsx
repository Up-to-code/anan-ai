import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const { requireWorkspaceData, getLayoutSidebarData } = vi.hoisted(() => ({
  requireWorkspaceData: vi.fn(),
  getLayoutSidebarData: vi.fn(),
}));
const { getComplianceRulesetForCurrentOrg } = vi.hoisted(() => ({
  getComplianceRulesetForCurrentOrg: vi.fn(),
}));

vi.mock("../_lib/workspaceData", () => ({
  requireWorkspaceData,
  getLayoutSidebarData,
}));
vi.mock("@/server/domains/compliance/service", () => ({
  getComplianceRulesetForCurrentOrg,
}));

vi.mock("../_components/WorkspaceShell", () => ({
  default: ({
    organization,
    variant,
    headerTitle,
    children,
  }: {
    organization: { name: string };
    variant?: string;
    headerTitle?: string;
    children?: React.ReactNode;
  }) => (
    <div data-slot="workspace-shell" data-variant={variant} data-title={headerTitle}>
      Shell:{organization.name}
      {children}
    </div>
  ),
}));

import WorkspaceOverviewLayout from "./layout";

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
  getComplianceRulesetForCurrentOrg.mockResolvedValue(null);

  const element = await WorkspaceOverviewLayout({ children: <div>Body</div> });
  const markup = renderToStaticMarkup(element);

  expect(markup).toContain("data-slot=\"workspace-shell\"");
  expect(markup).toContain("data-variant=\"assistant\"");
  expect(markup).toContain("Shell:Alpha");
  expect(markup).toContain("Body");
});
