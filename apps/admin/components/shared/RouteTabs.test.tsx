import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { usePathname } = vi.hoisted(() => ({
  usePathname: vi.fn(() => "/overview"),
}));

vi.mock("next/navigation", () => ({
  usePathname,
}));

import RouteTabs from "./RouteTabs";

describe("RouteTabs", () => {
  it("marks the active segmented tab with the institutional highlight", () => {
    const markup = renderToStaticMarkup(
      <RouteTabs tabs={[{ href: "/overview", label: "نظرة عامة" }, { href: "/users", label: "المستخدمون" }]} />,
    );

    expect(markup).toContain("aria-current=\"page\"");
    expect(markup).toContain("bg-[var(--workspace-highlight)]");
    expect(markup).toContain("pb-3");
  });

  it("renders subnav tabs with structural borders", () => {
    const markup = renderToStaticMarkup(
      <RouteTabs
        mode="subnav"
        tabs={[{ href: "/overview", label: "نظرة عامة" }, { href: "/users", label: "المستخدمون" }]}
      />,
    );

    expect(markup).toContain("border-b");
    expect(markup).toContain("rounded-sm");
  });
});
