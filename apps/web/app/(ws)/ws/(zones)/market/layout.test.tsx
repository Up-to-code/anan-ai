import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("./shared/navigation/MarketRouteTabs", () => ({
  default: () => (
    <div data-slot="market-route-tabs">
      <span>الملخص</span>
      <span>المدن</span>
      <span>المناطق الساخنة</span>
      <span>نتائج السوق</span>
      <span>مساعد الكلمات</span>
    </div>
  ),
}));

import MarketZoneLayout from "./layout";

describe("/ws/market layout", () => {
  it("renders market local navigation without recreating the workspace shell", async () => {
    const element = await MarketZoneLayout({ children: <div>Content</div> });
    const markup = renderToStaticMarkup(element);

    expect(markup).toContain("data-slot=\"market-shell\"");
    expect(markup).not.toContain("data-slot=\"workspace-shell\"");
    expect(markup).toContain("الملخص");
    expect(markup).toContain("المدن");
    expect(markup).toContain("المناطق الساخنة");
    expect(markup).toContain("نتائج السوق");
    expect(markup).toContain("مساعد الكلمات");
    expect(markup).toContain("Content");
  });
});
