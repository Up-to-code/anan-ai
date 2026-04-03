import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { useTheme } = vi.hoisted(() => ({
  useTheme: vi.fn(() => ({ resolvedTheme: "dark", setTheme: vi.fn() })),
}));

vi.mock("next-themes", () => ({
  useTheme,
}));

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/en/docs/getting-started"),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("../vendor/ui/sidebar", () => ({
  SidebarTrigger: ({ className }: { className?: string }) => (
    <button data-slot="sidebar-trigger" className={className} type="button" />
  ),
}));

import DocsTopNav from "./DocsTopNav";

describe("DocsTopNav", () => {
  it("renders docs navigation controls and the shared theme toggle", () => {
    const html = renderToStaticMarkup(<DocsTopNav />);

    expect(html).toContain("Anan Docs");
    expect(html).toContain("href=\"/en/docs/getting-started\"");
    expect(html).toContain("data-slot=\"theme-toggle\"");
  });
});
