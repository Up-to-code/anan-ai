import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { usePathname } = vi.hoisted(() => ({
  usePathname: vi.fn(() => "/organizations"),
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
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="logout-button">{children}</div>,
}));

import AdminTopNavbar from "./AdminTopNavbar";

describe("AdminTopNavbar", () => {
  it("renders the active section title and operator identity", () => {
    const html = renderToStaticMarkup(
      <AdminTopNavbar
        user={{ name: "Nada Admin", email: "nada@example.com" }}
        mobileNavigation={<div data-testid="mobile-nav">menu</div>}
      />,
    );

    expect(html).toContain("التحكم الإداري");
    expect(html).toContain("كل المنظمات");
    expect(html).toContain("Nada Admin");
    expect(html).toContain("Admin");
    expect(html).toContain("مبدل المظهر");
    expect(html).not.toContain("<h1");
  });
});
