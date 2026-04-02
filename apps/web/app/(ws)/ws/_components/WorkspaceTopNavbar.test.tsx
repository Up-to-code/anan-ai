import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { WebLocaleProvider } from "@/app/_components/WebLocaleProvider";
import { getWebDictionary } from "@/lib/i18n";

const { usePathname, useRouter, useWorkspaceSignalCounts } = vi.hoisted(() => ({
  usePathname: vi.fn(() => "/ws/inbox"),
  useRouter: vi.fn(() => ({ refresh: vi.fn() })),
  useWorkspaceSignalCounts: vi.fn(() => ({ notificationCount: 2, inboxCount: 5 })),
}));

vi.mock("next/navigation", () => ({
  usePathname,
  useRouter,
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
  it("renders the organization context control with signal actions", () => {
    const html = renderToStaticMarkup(
      <WebLocaleProvider locale="fr" dictionary={getWebDictionary("fr")}>
        <WorkspaceTopNavbar
          user={{ name: "Ahmed", email: "ahmed@example.com", image: "https://example.com/user.png" }}
          organization={{
            name: "شركة الواحة",
            navbarSubtitle: "Espace promoteur",
            sidebarSubtitle: "Boîte de réception",
            logoUrl: "https://example.com/logo.png",
            isVerified: false,
          }}
          visibleZoneKeys={["inbox", "projects", "settings"]}
          initialSignalCounts={{ notificationCount: 0, inboxCount: 0 }}
        />
      </WebLocaleProvider>,
    );

    expect(html).toContain("شركة الواحة");
    expect(html).toContain("Espace promoteur");
    expect(html).toContain("Boîte de réception");
    expect(html).toContain("href=\"/ws/settings?tab=org\"");
    expect(html).toContain("href=\"/ws/settings\"");
    expect(html).toContain("href=\"/ws/notifications\"");
    expect(html).toContain("href=\"/ws/inbox\"");
    expect(html).toContain("https://example.com/logo.png");
    expect(html).toContain("https://example.com/user.png");
    expect(html).toContain("Changer de langue");
    expect(html).toContain("data-slot=\"theme-toggle\"");
  });
});
