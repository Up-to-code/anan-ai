import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

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

beforeEach(() => {
  usePathname.mockReset();
  usePathname.mockReturnValue("/ws");
  useSearchParams.mockReset();
  useSearchParams.mockReturnValue(new URLSearchParams());
  useQuery.mockReset();
  useQuery.mockReturnValue(undefined);
});

it("shows the projects navigation entry for developer roles", () => {
  const markup = renderToStaticMarkup(
    <Sidebar
      user={{ name: "Ahmed", email: "ahmed@example.com" }}
      organization={{ name: "Alpha Dev", sidebarSubtitle: "لوحة العمل", navbarSubtitle: "مطور · نشط" }}
      visibleZoneKeys={["overview", "market", "projects", "offers", "crm", "inbox", "settings"]}
    />,
  );

  expect(markup).toContain("/ws/projects");
  expect(markup).toContain("المشاريع");
  expect(markup).toContain("/ws/offers");
  expect(markup).toContain("/ws/crm");
  expect(markup).toContain("/ws/inbox");
  expect(markup).toContain("data-slot=\"workspace-sidebar-desktop\"");
  expect(markup).not.toContain("Alpha Dev");
  expect(markup).toContain("المحادثات");
  expect(markup).not.toContain("ANAN");
  expect(markup).not.toContain("Institutional");
});

it("shows the core zones for broker roles", () => {
  const markup = renderToStaticMarkup(
    <Sidebar
      user={{ name: "Ahmed", email: "ahmed@example.com" }}
      organization={{ name: "Broker Org", sidebarSubtitle: "لوحة العمل", navbarSubtitle: "وسيط · نشط" }}
      visibleZoneKeys={["overview", "market", "projects", "offers", "crm", "inbox", "settings"]}
    />,
  );

  expect(markup).toContain("/ws/projects");
  expect(markup).toContain("/ws/offers");
  expect(markup).toContain("/ws/crm");
  expect(markup).not.toContain("Broker Org");
});

it("falls back to overview/settings and AI when the role has no business zones", () => {
  const markup = renderToStaticMarkup(
    <Sidebar
      user={{ name: "Ahmed", email: "ahmed@example.com" }}
      organization={{ name: "Admin Org", sidebarSubtitle: "لوحة العمل", navbarSubtitle: "وسيط · نشط" }}
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
  const markup = renderToStaticMarkup(
    <Sidebar
      user={{ name: "Ahmed", email: "ahmed@example.com" }}
      organization={{ name: "Alpha Dev", sidebarSubtitle: "لوحة العمل", navbarSubtitle: "مطور · نشط" }}
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
  const markup = renderToStaticMarkup(
    <Sidebar
      user={{ name: "Ahmed", email: "ahmed@example.com" }}
      organization={{ name: "Alpha Dev", sidebarSubtitle: "لوحة العمل", navbarSubtitle: "مطور · نشط" }}
      visibleZoneKeys={["overview", "settings"]}
      allAssistantThreads={[
        { id: "thread-1", title: "A", updatedAt: 10 },
      ]}
    />,
  );

  expect(markup).toContain("href=\"/ws\"");
  expect(markup).toContain("h-4 w-4");
});

it("highlights an assistant thread only when the URL threadId is valid", () => {
  usePathname.mockReturnValue("/ws");
  useSearchParams.mockReturnValue(new URLSearchParams("threadId=thread-2"));

  const markup = renderToStaticMarkup(
    <Sidebar
      user={{ name: "Ahmed", email: "ahmed@example.com" }}
      organization={{ name: "Alpha Dev", sidebarSubtitle: "لوحة العمل", navbarSubtitle: "مطور · نشط" }}
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
  expect(markup).toContain("border-blue-500/20 bg-blue-500/10");
});

it("does not highlight any thread when threadId is missing or invalid", () => {
  usePathname.mockReturnValue("/ws");
  useSearchParams.mockReturnValue(new URLSearchParams("threadId=missing"));

  const markup = renderToStaticMarkup(
    <Sidebar
      user={{ name: "Ahmed", email: "ahmed@example.com" }}
      organization={{ name: "Alpha Dev", sidebarSubtitle: "لوحة العمل", navbarSubtitle: "مطور · نشط" }}
      visibleZoneKeys={["overview", "settings"]}
      allAssistantThreads={[
        { id: "thread-1", title: "A", updatedAt: 11 },
        { id: "thread-2", title: "B", updatedAt: 12 },
      ]}
    />,
  );

  expect(markup).not.toContain("border-white/10 bg-white/5");
});
