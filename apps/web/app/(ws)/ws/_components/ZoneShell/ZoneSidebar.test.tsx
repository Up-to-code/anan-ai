import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { usePathname } = vi.hoisted(() => ({
  usePathname: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname,
}));

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

import ZoneSidebar from "./ZoneSidebar";

describe("ZoneSidebar", () => {
  beforeEach(() => {
    usePathname.mockReset();
    usePathname.mockReturnValue("/ws/crm");
  });

  it("renders the back action and current-zone local links", () => {
    const markup = renderToStaticMarkup(
      <ZoneSidebar
        zone={{
          key: "crm",
          label: "إدارة العملاء",
          description: "Deals and pipeline.",
          localNav: [
            { label: "خط الأنابيب", href: "/ws/crm" },
            { label: "العملاء", href: "/ws/crm/clients" },
          ],
        }}
        user={{ name: "Ahmed", email: "ahmed@example.com" }}
        organization={{ name: "Alpha Dev", sidebarSubtitle: "إدارة العملاء", navbarSubtitle: "مطور · نشط" }}
      />,
    );

    expect(markup).toContain("العودة إلى لوحة العمل");
    expect(markup).toContain("خط الأنابيب");
    expect(markup).toContain("العملاء");
    expect(markup).toContain("Alpha Dev");
    expect(markup).not.toContain("ANAN");
  });
});
