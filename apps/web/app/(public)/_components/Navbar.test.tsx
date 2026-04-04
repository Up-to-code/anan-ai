import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { WebLocaleProvider } from "@/app/_components/WebLocaleProvider";
import { getWebDictionary } from "@/lib/i18n";

const { useTheme } = vi.hoisted(() => ({
  useTheme: vi.fn(() => ({ resolvedTheme: "light", setTheme: vi.fn() })),
}));
const { useRouter } = vi.hoisted(() => ({
  useRouter: vi.fn(() => ({ refresh: vi.fn() })),
}));
const { usePathname } = vi.hoisted(() => ({
  usePathname: vi.fn(() => "/"),
}));

vi.mock("next-themes", () => ({
  useTheme,
}));

vi.mock("next/navigation", () => ({
  useRouter,
  usePathname,
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

vi.mock("next/image", () => ({
  default: ({
    alt,
    className,
  }: {
    alt: string;
    className?: string;
  }) => <img alt={alt} className={className} />,
}));

import Navbar from "./Navbar";

describe("Navbar", () => {
  it("renders the public navigation links, locale switcher, and theme toggle", () => {
    const html = renderToStaticMarkup(
      <WebLocaleProvider locale="en" dictionary={getWebDictionary("en")}>
        <Navbar locale="en" />
      </WebLocaleProvider>,
    );

    expect(html).toContain("href=\"/signin\"");
    expect(html).toContain("href=\"/developer\"");
    expect(html).toContain("Switch language");
    expect(html).toContain("Get Started");
    expect(html).toContain("data-slot=\"theme-toggle\"");
  });
});
