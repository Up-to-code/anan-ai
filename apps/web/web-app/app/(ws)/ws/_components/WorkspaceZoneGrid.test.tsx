import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import WorkspaceZoneGrid from "./WorkspaceZoneGrid";
import { getWorkspaceZones } from "../_lib/zones";

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe("WorkspaceZoneGrid", () => {
  it("renders the branded AI welcome mark and input prompt", () => {
    const markup = renderToStaticMarkup(
      <WorkspaceZoneGrid
        organizationName="Alpha Dev"
        userName="Ahmed"
        zones={getWorkspaceZones("developer")}
      />,
    );

    expect(markup).toContain("data-ai-motion-logo=\"true\"");
    expect(markup).toContain("اسأل أنان، أو ابدأ بإنشاء عرض، أو ابحث في مشاريعك...");
    expect(markup).toContain("Alpha Dev");
  });

  it("renders visible workspace quick-action cards", () => {
    const markup = renderToStaticMarkup(
      <WorkspaceZoneGrid
        organizationName="Broker Org"
        userName="Ahmed"
        zones={getWorkspaceZones("broker")}
      />,
    );

    expect(markup).toContain("المشاريع");
    expect(markup).toContain("العروض");
    expect(markup).toContain("إدارة العملاء");
  });
});
