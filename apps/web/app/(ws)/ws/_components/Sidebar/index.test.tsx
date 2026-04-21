import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import { WebLocaleProvider } from "@/app/_components/WebLocaleProvider";
import { getWebDictionary } from "@/lib/i18n";

const { usePathname, useSearchParams, useConvexAuth, useQuery } = vi.hoisted(() => ({
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
  useConvexAuth: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname,
  useSearchParams,
}));

vi.mock("convex/react", () => ({
  useConvexAuth,
  useQuery,
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

import Sidebar from "./index";

function renderSidebar(element: React.ReactNode) {
  return renderToStaticMarkup(
    <WebLocaleProvider locale="ar" dictionary={getWebDictionary("ar")}>
      {element}
    </WebLocaleProvider>,
  );
}

beforeEach(() => {
  usePathname.mockReset();
  usePathname.mockReturnValue("/ws");
  useSearchParams.mockReset();
  useSearchParams.mockReturnValue(new URLSearchParams());
  useConvexAuth.mockReset();
  useConvexAuth.mockReturnValue({ isLoading: false, isAuthenticated: true });
  useQuery.mockReset();
  useQuery.mockReturnValue(undefined);
});

it("shows the projects navigation entry for developer roles", () => {
  const markup = renderSidebar(
    <Sidebar
      user={{ name: "Ahmed", email: "ahmed@example.com", image: "https://example.com/user.png" }}
      organization={{ name: "Alpha Dev", sidebarSubtitle: "لوحة العمل", navbarSubtitle: "مطور · نشط", logoUrl: "https://example.com/org.png", isVerified: false }}
      visibleZoneKeys={["overview", "market", "projects", "offers", "crm", "inbox", "settings"]}
    />,
  );

  expect(markup).toContain("/ws/projects");
  expect(markup).toContain("المشاريع");
  expect(markup).toContain("/ws/offers");
  expect(markup).toContain("/ws/crm");
  expect(markup).toContain("/ws/inbox");
  expect(markup.indexOf("/ws/inbox")).toBeLessThan(markup.indexOf("/ws/crm"));
  expect(markup.indexOf("/ws/crm")).toBeLessThan(markup.indexOf("/ws/projects"));
  expect(markup).toContain("data-slot=\"workspace-sidebar-desktop\"");
  expect(markup).not.toContain("Alpha Dev");
  expect(markup).not.toContain("أحدث المحادثات");
  expect(markup).not.toContain("ANAN");
  expect(markup).not.toContain("Institutional");
  expect(markup).not.toContain("https://example.com/user.png");
  expect(markup).not.toContain("https://example.com/org.png");
});

it("shows the core zones for broker roles", () => {
  const markup = renderSidebar(
    <Sidebar
      user={{ name: "Ahmed", email: "ahmed@example.com" }}
      organization={{ name: "Broker Org", sidebarSubtitle: "لوحة العمل", navbarSubtitle: "وسيط · نشط", logoUrl: null, isVerified: true }}
      visibleZoneKeys={["overview", "market", "projects", "offers", "crm", "inbox", "settings"]}
    />,
  );

  expect(markup).toContain("/ws/projects");
  expect(markup).toContain("/ws/offers");
  expect(markup).toContain("/ws/crm");
  expect(markup).not.toContain("Broker Org");
});

it("falls back to overview/settings and AI when the role has no business zones", () => {
  const markup = renderSidebar(
    <Sidebar
      user={{ name: "Ahmed", email: "ahmed@example.com" }}
      organization={{ name: "Admin Org", sidebarSubtitle: "لوحة العمل", navbarSubtitle: "وسيط · نشط", logoUrl: null, isVerified: true }}
      visibleZoneKeys={["overview", "settings"]}
    />,
  );

  expect(markup).toContain("/ws");
  expect(markup).toContain("/ws/settings");
  expect(markup).not.toContain("/ws/projects");
  expect(markup).not.toContain("/ws/offers");
  expect(markup).not.toContain("/ws/crm");
  expect(markup).not.toContain("Admin Org");
});

it("renders the drawer variant with the shared navigation content", () => {
  const markup = renderSidebar(
    <Sidebar
      user={{ name: "Ahmed", email: "ahmed@example.com" }}
      organization={{ name: "Alpha Dev", sidebarSubtitle: "لوحة العمل", navbarSubtitle: "مطور · نشط", logoUrl: null, isVerified: true }}
      visibleZoneKeys={["overview", "market", "projects", "offers", "crm", "inbox", "settings"]}
      mode="drawer"
      titleId="mobile-sidebar-title"
    />,
  );

  expect(markup).toContain("data-slot=\"workspace-sidebar-drawer\"");
  expect(markup).toContain("mobile-sidebar-title");
  expect(markup).toContain("/ws/projects");
});

it("keeps the new-thread entry as a bare /ws draft action", () => {
  const markup = renderSidebar(
    <Sidebar
      user={{ name: "Ahmed", email: "ahmed@example.com" }}
      organization={{ name: "Alpha Dev", sidebarSubtitle: "لوحة العمل", navbarSubtitle: "مطور · نشط", logoUrl: null, isVerified: true }}
      visibleZoneKeys={["overview", "settings"]}
      allAssistantThreads={[
        { id: "thread-1", title: "A", updatedAt: 10 },
      ]}
    />,
  );

  expect(markup).toContain("href=\"/ws\"");
  expect(markup).toContain("h-4 w-4");
});

it("renders the last three threads in the sidebar rail when available", () => {
  usePathname.mockReturnValue("/ws");
  useSearchParams.mockReturnValue(new URLSearchParams("threadId=thread-2"));

  const markup = renderSidebar(
    <Sidebar
      user={{ name: "Ahmed", email: "ahmed@example.com" }}
      organization={{ name: "Alpha Dev", sidebarSubtitle: "لوحة العمل", navbarSubtitle: "مطور · نشط", logoUrl: null, isVerified: true }}
      visibleZoneKeys={["overview", "settings"]}
      recentAssistantThreads={[
        { id: "thread-1", title: "A", updatedAt: 11 },
        { id: "thread-2", title: "B", updatedAt: 12 },
      ]}
      allAssistantThreads={[
        { id: "thread-1", title: "A", updatedAt: 11 },
        { id: "thread-2", title: "B", updatedAt: 12 },
      ]}
    />,
  );

  expect(markup).toContain("/ws?threadId=thread-2");
  expect(markup).toContain("آخر 3 محادثات");
  expect(markup).toContain(">2/2<");
  expect(markup).toContain("bg-[var(--workspace-highlight-soft)]");
});

it("removes the sidebar identity subtitle and keeps the organization name out of the rail", () => {
  const markup = renderSidebar(
    <Sidebar
      user={{ name: "Ahmed", email: "ahmed@example.com" }}
      organization={{ name: "Alpha Dev", sidebarSubtitle: "لوحة العمل", navbarSubtitle: "مطور · نشط", logoUrl: null, isVerified: true }}
      visibleZoneKeys={["overview", "settings"]}
    />,
  );

  expect(markup).not.toContain("لوحة العمل");
  expect(markup).not.toContain("Alpha Dev");
});
