import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { usePathname, useSearchParams, useQuery } = vi.hoisted(() => ({
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname,
  useSearchParams,
}));

vi.mock("convex/react", () => ({
  useQuery,
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: vi.fn() }),
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
    onClick?: (event: unknown) => void;
  }) => (
    <a href={href} className={className} onClick={onClick as never}>
      {children}
    </a>
  ),
}));

vi.mock("../(zones)/inbox/InboxPage/useRealtimeInbox", () => ({
  useWorkspaceSignalCounts: () => ({ notificationCount: 0, inboxCount: 0 }),
}));

vi.mock("@/app/ConvexClientProvider", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import WorkspaceShell from "./WorkspaceShell";

describe("WorkspaceShell", () => {
  beforeEach(() => {
    usePathname.mockReset();
    usePathname.mockReturnValue("/ws");
    useSearchParams.mockReset();
    useSearchParams.mockReturnValue(new URLSearchParams());
    useQuery.mockReset();
    useQuery.mockReturnValue(undefined);
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
    expect(markup).toContain("data-variant=\"default\"");
    expect(markup).toContain("data-slot=\"workspace-sidebar-desktop\"");
    expect(markup).toContain("data-slot=\"workspace-sidebar-trigger\"");
    expect(markup).toContain("data-slot=\"workspace-top-navbar\"");
    expect(markup).toContain("data-slot=\"theme-toggle\"");
    expect(markup).toContain("Body");
    expect(markup).toContain("Alpha");
    expect(markup).toContain("/ws/notifications");
    expect(markup).toContain("/ws/inbox");
  });

  it("renders assistant-first chrome when the overview variant is requested", () => {
    const markup = renderToStaticMarkup(
      <WorkspaceShell
        user={{ name: "Ahmed", email: "ahmed@example.com" }}
        visibleZoneKeys={["overview", "offers", "inbox", "settings"]}
        organization={{ name: "Alpha", sidebarSubtitle: "لوحة العمل", navbarSubtitle: "مطور · نشط" }}
        variant="assistant"
        headerTitle="مساعد عنان"
      >
        <div>Assistant Body</div>
      </WorkspaceShell>,
    );

    expect(markup).toContain("data-slot=\"workspace-shell\"");
    expect(markup).toContain("data-variant=\"assistant\"");
    expect(markup).toContain("data-slot=\"workspace-top-navbar\"");
    expect(markup).toContain("مساعد عنان");
    expect(markup).toContain("Assistant Body");
    expect(markup).toContain("data-slot=\"workspace-sidebar-desktop\"");
    expect(markup).toContain("data-slot=\"workspace-sidebar-trigger\"");
    expect(markup).toContain("data-slot=\"theme-toggle\"");
  });
});
