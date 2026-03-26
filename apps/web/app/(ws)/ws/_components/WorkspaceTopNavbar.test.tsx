import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { usePathname, useWorkspaceSignalCounts } = vi.hoisted(() => ({
  usePathname: vi.fn(() => "/ws/inbox"),
  useWorkspaceSignalCounts: vi.fn(() => ({ notificationCount: 2, inboxCount: 5 })),
}));

vi.mock("next/navigation", () => ({
  usePathname,
}));

vi.mock("../(zones)/inbox/InboxPage/useRealtimeInbox", () => ({
  useWorkspaceSignalCounts,
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "dark", setTheme: vi.fn() }),
}));

vi.mock("@/app/ConvexClientProvider", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import WorkspaceTopNavbar from "./WorkspaceTopNavbar";

describe("WorkspaceTopNavbar", () => {
  it("renders the unified account button with user and organization info", () => {
    const html = renderToStaticMarkup(
      <WorkspaceTopNavbar
        user={{ name: "Ahmed", email: "ahmed@example.com" }}
        organization={{
          name: "شركة الواحة",
          navbarSubtitle: "مساحة المطور",
          sidebarSubtitle: "لوحة العمل",
        }}
        visibleZoneKeys={["inbox", "projects", "settings"]}
        initialSignalCounts={{ notificationCount: 0, inboxCount: 0 }}
      />,
    );

    expect(html).toContain("شركة الواحة");
    expect(html).toContain("Ahmed");
    expect(html).toContain("href=\"/ws/me\"");
    expect(html).toContain("href=\"/ws/notifications\"");
    expect(html).toContain("href=\"/ws/inbox\"");
    expect(html).toContain("data-slot=\"theme-toggle\"");
  });
});
