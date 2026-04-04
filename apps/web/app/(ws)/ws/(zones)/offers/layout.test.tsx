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
const { useRouter } = vi.hoisted(() => ({
  useRouter: vi.fn(() => ({ replace: vi.fn(), refresh: vi.fn(), push: vi.fn() })),
}));

vi.mock("../../_lib/workspaceData", () => ({
  requireWorkspaceData,
  getLayoutSidebarData,
}));

vi.mock("next/navigation", () => ({
  redirect,
  usePathname,
  useSearchParams,
  useRouter,
}));

vi.mock("convex/react", () => ({
  useQuery,
}));

vi.mock("../inbox/pages/InboxPage/useRealtimeInbox", () => ({
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

import OffersZoneLayout from "./layout";

describe("/ws/offers layout", () => {
  beforeEach(() => {
    requireWorkspaceData.mockReset();
    getLayoutSidebarData.mockReset();
    redirect.mockReset();
    usePathname.mockReset();
    usePathname.mockReturnValue("/ws/offers");
  });

it("renders the focused offers zone shell", async () => {
    requireWorkspaceData.mockResolvedValue({
      user: { name: "Ahmed", email: "ahmed@example.com" },
      session: { role: "broker" },
      visibleZoneKeys: ["overview", "offers", "inbox", "settings"],
      organizations: [{ id: "broker-1", type: "broker", name: "Broker Org", slug: "broker-org", status: "active", isVerified: true }],
    });
    getLayoutSidebarData.mockResolvedValue({
      user: { name: "Ahmed", email: "ahmed@example.com" },
      organizations: [{ id: "broker-1", type: "broker", name: "Broker Org", slug: "broker-org", status: "active", isVerified: true }],
      recentConversations: [],
      allConversations: [],
      signalCounts: { notificationCount: 0, inboxCount: 0 },
    });

    const element = await OffersZoneLayout({ children: <div>Content</div> });
    const markup = renderToStaticMarkup(element);

    expect(markup).toContain("data-slot=\"workspace-shell\"");
    expect(markup).toContain("العروض");
    expect(markup).toContain("العروض كحالات تعاون");
  });
});
