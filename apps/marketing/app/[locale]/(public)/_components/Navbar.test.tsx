import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { WebLocaleProvider } from "@/app/_components/WebLocaleProvider";
import { getWebDictionary } from "@/lib/i18n";

const { useTheme } = vi.hoisted(() => ({
  useTheme: vi.fn(() => ({ resolvedTheme: "light", setTheme: vi.fn() })),
}));
const { useRouter } = vi.hoisted(() => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), refresh: vi.fn() })),
}));
const { getAssistantUrl, getWorkspaceEntryUrl } = vi.hoisted(() => ({
  getAssistantUrl: vi.fn(() => "https://assistant.anan.sa/app"),
  getWorkspaceEntryUrl: vi.fn(() => "https://workspace.anan.sa/signin"),
}));

vi.mock("next-themes", () => ({
  useTheme,
}));

vi.mock("next/navigation", () => ({
  useRouter,
  usePathname: vi.fn(() => "/en"),
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

vi.mock("@/lib/site", () => ({
  getAssistantUrl,
  getWorkspaceEntryUrl,
}));

import Navbar from "./Navbar";

describe("Navbar", () => {
  it("renders the public navigation links, locale switcher, and theme toggle", () => {
    const html = renderToStaticMarkup(
      <WebLocaleProvider locale="en" dictionary={getWebDictionary("en")}>
        <Navbar />
      </WebLocaleProvider>,
    );

    expect(html).toContain("href=\"https://workspace.anan.sa/signin\"");
    expect(html).toContain("href=\"https://assistant.anan.sa/app\"");
    expect(html).toContain("href=\"/en/developer\"");
    expect(html).toContain("Switch language");
    expect(html).toContain("Go to Workspace");
    expect(html).toContain("Go to Assistant");
    expect(html).toContain("data-slot=\"theme-toggle\"");
  });
});
