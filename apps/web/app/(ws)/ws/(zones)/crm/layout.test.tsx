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
    expect(markup).toContain("إدارة العملاء");
    expect(markup).toContain("/ws/crm");
    expect(markup).toContain("خط الأنابيب");
    expect(markup).toContain("العملاء");
    expect(markup).toContain("الوسطاء");
  });
});
