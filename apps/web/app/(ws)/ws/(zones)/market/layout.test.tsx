import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireWorkspaceData, getLayoutSidebarData, redirect, usePathname } = vi.hoisted(() => ({
  requireWorkspaceData: vi.fn(),
  getLayoutSidebarData: vi.fn(),
  redirect: vi.fn(),
  usePathname: vi.fn(),
}));

vi.mock("../../_lib/workspaceData", () => ({
  requireWorkspaceData,
  getLayoutSidebarData,
}));

vi.mock("next/navigation", () => ({
  redirect,
  usePathname,
}));

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("../../_components/WorkspaceTopNavbar", () => ({
  default: ({ organization }: { organization: { name: string; navbarSubtitle: string } }) => (
    <div data-slot="workspace-top-navbar">
      <span>{organization.name}</span>
      <span>{organization.navbarSubtitle}</span>
    </div>
  ),
}));

import MarketZoneLayout from "./layout";

describe("/ws/market layout", () => {
  beforeEach(() => {
    requireWorkspaceData.mockReset();
    getLayoutSidebarData.mockReset();
    redirect.mockReset();
    usePathname.mockReset();
    usePathname.mockReturnValue("/ws/market");
  });

  it("renders the market top-nav shell without the workspace sidebar rail", async () => {
    requireWorkspaceData.mockResolvedValue({
      user: { name: "Ahmed", email: "ahmed@example.com" },
      session: { role: "broker" },
      visibleZoneKeys: ["overview", "market", "projects", "offers", "settings"],
      organizations: [{ id: "broker-1", type: "broker", name: "Broker Org", slug: "broker-org", status: "active", isVerified: true }],
    });
    getLayoutSidebarData.mockResolvedValue({
      user: { name: "Ahmed", email: "ahmed@example.com" },
      organizations: [{ id: "broker-1", type: "broker", name: "Broker Org", slug: "broker-org", status: "active", isVerified: true }],
      recentConversations: [],
      allConversations: [],
      signalCounts: { notificationCount: 0, inboxCount: 0 },
    });

    const element = await MarketZoneLayout({ children: <div>Content</div> });
    const markup = renderToStaticMarkup(element);

    expect(markup).toContain("data-slot=\"market-shell\"");
    expect(markup).toContain("Broker Org");
    expect(markup).toContain("المدن");
    expect(markup).toContain("الأحياء");
    expect(markup).toContain("الفرص");
    expect(markup).toContain("البحث والكلمات");
    expect(markup).not.toContain("نظرة عامة");
    expect(markup).not.toContain("data-slot=\"workspace-sidebar-desktop\"");
    expect(markup).not.toContain("data-slot=\"workspace-sidebar-trigger\"");
  });
});
