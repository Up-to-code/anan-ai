import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { useWorkspaceSignalCounts } = vi.hoisted(() => ({
  useWorkspaceSignalCounts: vi.fn(() => ({ notificationCount: 0, inboxCount: 0 })),
}));
const { useQuery } = vi.hoisted(() => ({
  useQuery: vi.fn(() => undefined),
}));

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

vi.mock("convex/react", () => ({
  useQuery,
}));

vi.mock("../inbox/InboxPage/useRealtimeInbox", () => ({
  useWorkspaceSignalCounts,
}));

const { getComplianceRulesetForCurrentOrg } = vi.hoisted(() => ({
  getComplianceRulesetForCurrentOrg: vi.fn(() => Promise.resolve(null)),
}));

vi.mock("@/server/domains/compliance/service", () => ({
  getComplianceRulesetForCurrentOrg,
}));

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

import CrmZoneLayout from "./layout";

describe("/ws/crm layout", () => {
  beforeEach(() => {
    requireWorkspaceData.mockReset();
    getLayoutSidebarData.mockReset();
    redirect.mockReset();
    usePathname.mockReset();
    usePathname.mockReturnValue("/ws/crm");
  });

  it("renders the focused CRM zone shell with local navigation", async () => {
    requireWorkspaceData.mockResolvedValue({
      user: { name: "Ahmed", email: "ahmed@example.com" },
      session: { role: "developer" },
      visibleZoneKeys: ["overview", "crm", "settings"],
      organizations: [{ id: "red-1", type: "red", name: "Alpha Dev", slug: "alpha-dev", status: "active", isVerified: true }],
    });
    getLayoutSidebarData.mockResolvedValue({
      user: { name: "Ahmed", email: "ahmed@example.com" },
      organizations: [{ id: "red-1", type: "red", name: "Alpha Dev", slug: "alpha-dev", status: "active", isVerified: true }],
      recentConversations: [],
      allConversations: [],
      signalCounts: { notificationCount: 0, inboxCount: 0 },
    });

    const element = await CrmZoneLayout({ children: <div>Content</div> });
    const markup = renderToStaticMarkup(element);

    expect(markup).toContain("data-slot=\"workspace-shell\"");
    expect(markup).toContain("إدارة الصفقات");
    expect(markup).toContain("/ws/crm");
    expect(markup).toContain("الصفقات");
    expect(markup).toContain("العملاء");
    expect(markup).not.toContain("الوسطاء");
  });
});
