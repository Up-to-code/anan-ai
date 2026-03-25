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

import BrandWorkspaceTabs from "./BrandWorkspaceTabs";

describe("BrandWorkspaceTabs", () => {
  beforeEach(() => {
    usePathname.mockReset();
    usePathname.mockReturnValue("/ws/offers/inbox");
  });

  it("marks the active route-backed tab", () => {
    const markup = renderToStaticMarkup(
      <BrandWorkspaceTabs
        tabs={[
          { href: "/ws/offers", label: "نظرة عامة" },
          { href: "/ws/offers/inbox", label: "صندوق الربط" },
        ]}
      />,
    );

    expect(markup).toContain("صندوق الربط");
    expect(markup).toContain("border-slate-950 text-slate-950");
  });

  it("supports exact-match tabs without activating them on child routes", () => {
    usePathname.mockReturnValue("/ws/market/cities");

    const markup = renderToStaticMarkup(
      <BrandWorkspaceTabs
        tabs={[
          { href: "/ws/market", label: "الملخص", exact: true },
          { href: "/ws/market/cities", label: "المدن" },
        ]}
      />,
    );

    expect(markup).toContain("الملخص");
    expect(markup).toContain("المدن");
  });
});
