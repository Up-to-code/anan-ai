import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { usePathname, useSearchParams } = vi.hoisted(() => ({
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname,
  useSearchParams,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
    onClick,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
  }) => (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  ),
}));

vi.mock("../(zones)/inbox/InboxPage/useRealtimeInbox", () => ({
  useWorkspaceSignalCounts: () => ({ notificationCount: 0, inboxCount: 0 }),
}));

import WorkspaceShell from "./WorkspaceShell";

describe("WorkspaceShell", () => {
  beforeEach(() => {
    usePathname.mockReset();
    usePathname.mockReturnValue("/ws");
    useSearchParams.mockReset();
    useSearchParams.mockReturnValue(new URLSearchParams());
  });

  it("renders the desktop sidebar shell and mobile nav trigger", () => {
    const markup = renderToStaticMarkup(
      <WorkspaceShell
        user={{ name: "Ahmed", email: "ahmed@example.com" }}
        visibleZoneKeys={["overview", "offers", "inbox", "settings"]}
        organization={{ name: "Alpha", sidebarSubtitle: "لوحة العمل", navbarSubtitle: "مطور · نشط" }}
      >
        <div>Body</div>
      </WorkspaceShell>,
    );

    expect(markup).toContain("data-slot=\"workspace-shell\"");
    expect(markup).toContain("data-slot=\"workspace-sidebar-desktop\"");
    expect(markup).toContain("data-slot=\"workspace-sidebar-trigger\"");
    expect(markup).toContain("Body");
    expect(markup).toContain("Alpha");
    expect(markup).toContain("/ws/notifications");
    expect(markup).toContain("/ws/inbox");
  });
});
