import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { usePathname, useSearchParams } = vi.hoisted(() => ({
  usePathname: vi.fn(() => "/overview"),
  useSearchParams: vi.fn(() => new URLSearchParams("range=30d")),
}));

vi.mock("next/navigation", () => ({
  usePathname,
  useSearchParams,
}));

vi.mock("@/components/auth/LogoutButton", () => ({
  default: () => <div data-testid="logout-button">logout</div>,
}));

import AdminShell from "./AdminShell";

describe("AdminShell", () => {
  it("renders the shared admin navigation", () => {
    const html = renderToStaticMarkup(
      <AdminShell user={{ id: "u1", isActive: true, name: "Admin" }}>
        <div>content</div>
      </AdminShell>,
    );

    expect(html).toContain("إدارة عنان");
    expect(html).toContain("لوحة التحكم");
    expect(html).toContain("المشاريع");
    expect(html).toContain("البنوك");
    expect(html).toContain("العقارات");
    expect(html).toContain("مراجعة العروض");
    expect(html).not.toContain("Docs");
  });

  it("renders the sidebar toggle controls", () => {
    const html = renderToStaticMarkup(
      <AdminShell user={{ id: "u1", isActive: true, name: "Admin" }}>
        <div>content</div>
      </AdminShell>,
    );

    expect(html).toContain("طي الشريط الجانبي");
    expect(html).toContain("aria-label=\"Admin navigation\"");
  });
});
