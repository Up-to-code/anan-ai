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

import WorkspaceTopNavbar from "./WorkspaceTopNavbar";

describe("WorkspaceTopNavbar", () => {
  it("renders links to the account and organization settings", () => {
    const html = renderToStaticMarkup(
      <WorkspaceTopNavbar
        user={{ name: "Ahmed", email: "ahmed@example.com" }}
        organization={{
          name: "شركة الواحة",
          navbarSubtitle: "مساحة المطور",
        }}
        visibleZoneKeys={["inbox", "projects", "settings"]}
        initialSignalCounts={{ notificationCount: 0, inboxCount: 0 }}
      />,
    );

    expect(html).toContain("شركة الواحة");
    expect(html).toContain("مساحة المطور");
    expect(html).toContain("Ahmed");
    expect(html).toContain("ahmed@example.com");
    expect(html).toContain("href=\"/ws/me\"");
    expect(html).toContain("href=\"/ws/settings\"");
  });
});
