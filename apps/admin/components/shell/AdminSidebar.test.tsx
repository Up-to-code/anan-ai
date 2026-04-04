import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { usePathname } = vi.hoisted(() => ({
  usePathname: vi.fn(() => "/users"),
}));

vi.mock("next/navigation", () => ({
  usePathname,
}));

vi.mock("@/components/auth/LogoutButton", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="logout-button">{children}</div>,
}));

import AdminSidebar from "./AdminSidebar";

describe("AdminSidebar", () => {
  it("renders admin navigation links without workspace paths", () => {
    const html = renderToStaticMarkup(
      <AdminSidebar user={{ name: "Admin", email: "admin@example.com" }} />,
    );

    expect(html).toContain("href=\"/overview\"");
    expect(html).toContain("href=\"/users\"");
    expect(html).toContain("href=\"/organizations\"");
    expect(html).not.toContain("href=\"/ws");
  });

  it("renders compact icon rail when collapsed", () => {
    const html = renderToStaticMarkup(
      <AdminSidebar user={{ name: "Admin", email: "admin@example.com" }} collapsed />,
    );

    expect(html).toContain("aria-label=\"لوحة التحكم\"");
    expect(html).toContain("aria-label=\"مراجعة العروض\"");
    expect(html).not.toContain("admin@example.com");
  });
});
