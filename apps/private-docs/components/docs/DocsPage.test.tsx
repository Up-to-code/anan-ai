/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    className,
  }: {
    src: string | { src: string };
    alt: string;
    className?: string;
  }) => <img src={typeof src === "string" ? src : src.src} alt={alt} className={className} />,
}));

import DocsPage from "./DocsPage";

describe("DocsPage", () => {
  it("renders a foundation page with visual and table content", () => {
    const markup = renderToStaticMarkup(<DocsPage pageKey="overview" />);

    expect(markup).toContain("Anan Developer Handbook");
    expect(markup).toContain("Repo Map At A Glance");
    expect(markup).toContain('src="/handbook/platform-flow.png"');
    expect(markup).toContain("Deep Source References");
  });

  it("renders a runtime page with the documented real-time exception", () => {
    const markup = renderToStaticMarkup(<DocsPage pageKey="web" />);

    expect(markup).toContain("Workspace + Public Web");
    expect(markup).toContain("Real-Time Exception");
    expect(markup).toContain("Use direct Convex hooks only when live subscription behavior is intrinsic");
  });

  it("renders a build recipe page with implementation guidance", () => {
    const markup = renderToStaticMarkup(<DocsPage pageKey="add-web-domain" />);

    expect(markup).toContain("Recipe: Add a Web Domain Service");
    expect(markup).toContain("Required Layers");
    expect(markup).toContain("Define input and output schemas");
  });

  it("renders an audit page with findings and surrounding pagination links", () => {
    const markup = renderToStaticMarkup(<DocsPage pageKey="convex-review" />);

    expect(markup).toContain("Convex Review");
    expect(markup).toContain("Market snapshot query scans three growing tables");
    expect(markup).toContain('href="/docs/audit-overview"');
    expect(markup).toContain('href="/docs/web-review"');
  });
});
