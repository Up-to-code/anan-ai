import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireWorkspaceData, getLayoutSidebarData, redirect, usePathname, useSearchParams } = vi.hoisted(() => ({
  requireWorkspaceData: vi.fn(),
  getLayoutSidebarData: vi.fn(),
  redirect: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock("../../_lib/workspaceData", () => ({
  requireWorkspaceData,
  getLayoutSidebarData,
}));

vi.mock("next/navigation", () => ({
  redirect,
  usePathname,
  useSearchParams,
}));

const { useWorkspaceSignalCounts } = vi.hoisted(() => ({
  useWorkspaceSignalCounts: vi.fn(() => ({ notificationCount: 0, inboxCount: 0 })),
}));

vi.mock("../inbox/InboxPage/useRealtimeInbox", () => ({
  useWorkspaceSignalCounts,
}));

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
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

  it("renders the market layout inside the main workspace shell", async () => {
    requireWorkspaceData.mockResolvedValue({
      user: { name: "Ahmed", email: "ahmed@example.com" },
      session: { role: "broker" },
      visibleZoneKeys: ["overview", "market", "projects", "offers", "settings"],
      organizations: [{ id: "broker-1", type: "broker", name: "Broker Org", slug: "broker-org", status: "active", isVerified: true }],
    });
    getLayoutSidebarData.mockResolvedValue({
      user: { name: "Ahmed", email: "ahmed@example.com" },
      organizations: [{ id: "broker-1", type: "broker", name: "Broker Org", slug: "broker-org", status: "active", isVerified: true }],
      recentAssistantThreads: [],
      allAssistantThreads: [],
      signalCounts: { notificationCount: 0, inboxCount: 0 },
    });

    const element = await MarketZoneLayout({ children: <div>Content</div> });
    const markup = renderToStaticMarkup(element);

    expect(markup).toContain("data-slot=\"market-shell\"");
    expect(markup).toContain("data-slot=\"workspace-shell\"");
    expect(markup).toContain("data-slot=\"workspace-sidebar-desktop\"");
    expect(markup).toContain("المدن");
    expect(markup).toContain("الأحياء");
    expect(markup).toContain("الفرص");
    expect(markup).toContain("البحث والكلمات");
    expect(markup).not.toContain("نظرة عامة");
  });
});
