import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { useTheme } = vi.hoisted(() => ({
  useTheme: vi.fn(() => ({ resolvedTheme: "light", setTheme: vi.fn() })),
}));

vi.mock("next-themes", () => ({
  useTheme,
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
  it("renders the public navigation links and theme toggle", () => {
    const html = renderToStaticMarkup(<Navbar />);

    expect(html).toContain("href=\"/signin\"");
    expect(html).toContain("href=\"/developer\"");
    expect(html).toContain("data-slot=\"theme-toggle\"");
  });
});
