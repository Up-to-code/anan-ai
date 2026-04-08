import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { getWorkspaceLocale } = vi.hoisted(() => ({
  getWorkspaceLocale: vi.fn(),
}));

vi.mock("../../_lib/workspaceLocale", () => ({
  getWorkspaceLocale,
}));

vi.mock("./shared/navigation/CrmRouteTabs", () => ({
  default: ({ labels }: { labels: { deals: string; clients: string } }) => (
    <div data-slot="crm-route-tabs">
      <span>{labels.deals}</span>
      <span>{labels.clients}</span>
    </div>
  ),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

import CrmZoneLayout from "./layout";

describe("/ws/crm layout", () => {
  it("renders CRM local navigation without owning the workspace shell", async () => {
    getWorkspaceLocale.mockResolvedValue("ar");

    const element = await CrmZoneLayout({ children: <div>Content</div> });
    const markup = renderToStaticMarkup(element);

    expect(markup).not.toContain("data-slot=\"workspace-shell\"");
    expect(markup).toContain("data-slot=\"crm-route-tabs\"");
    expect(markup).toContain("الصفقات");
    expect(markup).toContain("العملاء");
    expect(markup).toContain("Content");
  });
});
