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
  it("renders organization context without exposing the signed-in account identity", () => {
    const html = renderToStaticMarkup(
      <WorkspaceTopNavbar
        organization={{
          name: "شركة الواحة",
          navbarSubtitle: "مساحة المطور",
        }}
        visibleZoneKeys={["inbox", "projects"]}
        initialSignalCounts={{ notificationCount: 0, inboxCount: 0 }}
      />,
    );

    expect(html).toContain("شركة الواحة");
    expect(html).toContain("مساحة المطور");
    expect(html).not.toContain("Ahmed");
    expect(html).not.toContain("@");
  });
});
