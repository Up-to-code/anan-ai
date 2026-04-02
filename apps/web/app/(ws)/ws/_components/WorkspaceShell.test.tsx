import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WebLocaleProvider } from "@/app/_components/WebLocaleProvider";
import { getWebDictionary } from "@/lib/i18n";

const { usePathname, useSearchParams, useRouter, useQuery } = vi.hoisted(() => ({
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
  useRouter: vi.fn(() => ({ refresh: vi.fn() })),
  useQuery: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname,
  useSearchParams,
  useRouter,
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
      <WebLocaleProvider locale="ar" dictionary={getWebDictionary("ar")}>
        <WorkspaceShell
          user={{ name: "Ahmed", email: "ahmed@example.com", image: "https://example.com/user.png" }}
          visibleZoneKeys={["overview", "offers", "inbox", "settings"]}
          organization={{ name: "Alpha", sidebarSubtitle: "لوحة العمل", navbarSubtitle: "مطور · نشط", logoUrl: "https://example.com/org.png", isVerified: false }}
        >
          <div>Body</div>
        </WorkspaceShell>
      </WebLocaleProvider>,
    );

    expect(markup).toContain("data-slot=\"workspace-shell\"");
    expect(markup).toContain("data-variant=\"default\"");
    expect(markup).toContain("flex h-full min-h-0 w-full flex-col overflow-hidden");
    expect(markup).toContain("data-slot=\"workspace-sidebar-desktop\"");
    expect(markup).toContain("data-slot=\"workspace-sidebar-trigger\"");
    expect(markup).toContain("data-slot=\"workspace-top-navbar\"");
    expect(markup).toContain("data-slot=\"theme-toggle\"");
    expect(markup).toContain("Body");
    expect(markup).toContain("Alpha");
    expect(markup).toContain("/ws/notifications");
    expect(markup).toContain("/ws/inbox");
    expect(markup).toContain("data-slot=\"workspace-content\"");
    expect(markup).toContain("flex h-full min-h-0 min-w-0 flex-1 basis-0 flex-col");
  });

  it("renders assistant-first chrome when the overview variant is requested", () => {
    const markup = renderToStaticMarkup(
      <WebLocaleProvider locale="ar" dictionary={getWebDictionary("ar")}>
        <WorkspaceShell
          user={{ name: "Ahmed", email: "ahmed@example.com" }}
          visibleZoneKeys={["overview", "offers", "inbox", "settings"]}
          organization={{ name: "Alpha", sidebarSubtitle: "لوحة العمل", navbarSubtitle: "مطور · نشط", logoUrl: null, isVerified: true }}
          variant="assistant"
          headerTitle="مساعد عنان"
        >
          <div>Assistant Body</div>
        </WorkspaceShell>
      </WebLocaleProvider>,
    );

    expect(markup).toContain("data-slot=\"workspace-shell\"");
    expect(markup).toContain("data-variant=\"assistant\"");
    expect(markup).toContain("data-slot=\"workspace-top-navbar\"");
    expect(markup).toContain("مساعد عنان");
    expect(markup).toContain("Assistant Body");
    expect(markup).toContain("app-shell-fixed-height");
    expect(markup).toContain("lg:flex-row");
    expect(markup).toContain("data-slot=\"workspace-sidebar-desktop\"");
    expect(markup).toContain("data-slot=\"workspace-sidebar-trigger\"");
    expect(markup).toContain("data-slot=\"theme-toggle\"");
  });

  it("renders compliance messaging as a compact in-content card instead of a full-width strip", () => {
    const markup = renderToStaticMarkup(
      <WebLocaleProvider locale="ar" dictionary={getWebDictionary("ar")}>
        <WorkspaceShell
          user={{ name: "Ahmed", email: "ahmed@example.com" }}
          visibleZoneKeys={["overview", "offers", "inbox", "settings"]}
          organization={{ name: "Alpha", sidebarSubtitle: "لوحة العمل", navbarSubtitle: "مطور · نشط", logoUrl: null, isVerified: true }}
          complianceBanner={{
            title: "التوثيق مطلوب قبل النشر",
            body: "يرجى إكمال مستندات التحقق لإظهار العقارات ونشرها.",
            ctaLabel: "إكمال التوثيق",
            ctaHref: "/ws/settings?tab=verification",
          }}
        >
          <div>Body</div>
        </WorkspaceShell>
      </WebLocaleProvider>,
    );

    expect(markup).toMatch(/data-slot="workspace-compliance-banner-rail"[^>]*dir="rtl"/);
    expect(markup).toContain("data-slot=\"workspace-compliance-banner\"");
    expect(markup).toContain("mx-auto w-full max-w-6xl");
    expect(markup).toContain("data-slot=\"workspace-compliance-banner-action\"");
    expect(markup).toContain("inline-flex w-full shrink-0 items-center justify-center");
    expect(markup).not.toContain("ms-auto w-full max-w-3xl");
    expect(markup).toContain("التوثيق مطلوب قبل النشر");
    expect(markup).toContain("إكمال التوثيق");
    expect(markup).toContain("/ws/settings?tab=verification");
  });
});
