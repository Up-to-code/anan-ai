import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import SectionScaffold from "./SectionScaffold";

vi.mock("@/components/shared/PageHeader", () => ({
  default: ({ variant }: { variant: string }) => <div data-slot="page-header" data-variant={variant} />,
}));

vi.mock("@/components/shared/RouteTabs", () => ({
  default: ({ mode }: { mode: string }) => <div data-slot="route-tabs" data-mode={mode} />,
}));

vi.mock("@/components/shared/AdminPageLayout", () => ({
  default: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
    <div data-slot="admin-page-layout" data-props={JSON.stringify(props)}>
      {children}
    </div>
  ),
}));

describe("SectionScaffold", () => {
  it("renders compact headers without tabs by default", () => {
    const markup = renderToStaticMarkup(
      <SectionScaffold eyebrow="المستخدمون" title="كل المستخدمين" description="وصف">
        <div>body</div>
      </SectionScaffold>,
    );

    expect(markup).toContain('data-slot="page-header"');
    expect(markup).toContain('data-variant="compact"');
    expect(markup).not.toContain('data-slot="route-tabs"');
  });

  it("auto-selects segmented and subnav tab modes", () => {
    const segmentedMarkup = renderToStaticMarkup(
      <SectionScaffold
        eyebrow="المستخدمون"
        title="كل المستخدمين"
        description="وصف"
        tabs={[
          { href: "/one", label: "one" },
          { href: "/two", label: "two" },
          { href: "/three", label: "three" },
          { href: "/four", label: "four" },
        ]}
      >
        <div>body</div>
      </SectionScaffold>,
    );

    const subnavMarkup = renderToStaticMarkup(
      <SectionScaffold
        eyebrow="التحليلات"
        title="لوحة"
        description="وصف"
        tabs={[
          { href: "/one", label: "one" },
          { href: "/two", label: "two" },
          { href: "/three", label: "three" },
          { href: "/four", label: "four" },
          { href: "/five", label: "five" },
        ]}
      >
        <div>body</div>
      </SectionScaffold>,
    );

    expect(segmentedMarkup).toContain('data-mode="segmented"');
    expect(subnavMarkup).toContain('data-mode="subnav"');
  });
});
