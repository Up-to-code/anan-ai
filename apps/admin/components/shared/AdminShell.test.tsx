import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { usePathname } = vi.hoisted(() => ({
  usePathname: vi.fn(() => "/dashboard"),
}));

vi.mock("next/navigation", () => ({
  usePathname,
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

    expect(html).toContain("مركز إدارة المنصة");
    expect(html).toContain("لوحة التحكم");
    expect(html).toContain("التحليلات");
    expect(html).toContain("العقارات");
    expect(html).not.toContain("Docs");
  });
});
