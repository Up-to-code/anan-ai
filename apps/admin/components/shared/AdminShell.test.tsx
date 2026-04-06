import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { usePathname } = vi.hoisted(() => ({
  usePathname: vi.fn(() => "/overview"),
}));

vi.mock("next/navigation", () => ({
  usePathname,
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "system",
    resolvedTheme: "light",
    setTheme: vi.fn(),
  }),
}));

vi.mock("@/components/auth/LogoutButton", () => ({
  default: ({ children }: { children?: React.ReactNode }) => <div data-testid="logout-button">{children ?? "logout"}</div>,
}));

import AdminShell from "./AdminShell";

describe("AdminShell", () => {
  it("renders the shared admin navigation", () => {
    const html = renderToStaticMarkup(
      <AdminShell user={{ id: "u1", isActive: true, name: "Admin" }}>
        <div>content</div>
      </AdminShell>,
    );

    expect(html).toContain("عنان أدمن");
    expect(html).toContain("التحكم الإداري");
    expect(html).toContain("لوحة التحكم");
    expect(html).toContain("المشاريع");
    expect(html).toContain("البنوك");
    expect(html).toContain("العقارات");
    expect(html).toContain("مراجعة العروض");
    expect(html).not.toContain("Docs");
    expect(html).toContain("href=\"#admin-main-content\"");
    expect(html).toContain("id=\"admin-main-content\"");
  });

  it("renders the sidebar toggle controls", () => {
    const html = renderToStaticMarkup(
      <AdminShell user={{ id: "u1", isActive: true, name: "Admin" }}>
        <div>content</div>
      </AdminShell>,
    );

    expect(html).toContain("طي الشريط الجانبي");
    expect(html).toContain("aria-label=\"Admin navigation\"");
    expect(html).toContain("data-slot=\"admin-top-navbar\"");
    expect(html).toContain("w-80");
  });
});
