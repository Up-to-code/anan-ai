import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { usePathname, useSearchParams } = vi.hoisted(() => ({
  usePathname: vi.fn(() => "/dashboard"),
  useSearchParams: vi.fn(() => new URLSearchParams("range=90d")),
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
    expect(html).toContain("لوحة المتابعة");
    expect(html).toContain("التحليلات");
    expect(html).toContain("الطلبات");
    expect(html).toContain("العقارات");
    expect(html).toContain("90 يوم");
    expect(html).not.toContain("Docs");
  });
});
