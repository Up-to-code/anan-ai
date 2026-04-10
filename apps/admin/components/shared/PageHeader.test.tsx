import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import PageHeader from "./PageHeader";

describe("PageHeader", () => {
  it("renders the compact variant by default", () => {
    const markup = renderToStaticMarkup(
      <PageHeader eyebrow="المستخدمون" title="كل المستخدمين" description="وصف مختصر" actions={<button>إضافة</button>} />,
    );

    expect(markup).toContain("text-4xl");
    expect(markup).toContain("pb-4");
    expect(markup).toContain("إضافة");
  });

  it("renders the hero variant with larger title rhythm", () => {
    const markup = renderToStaticMarkup(
      <PageHeader eyebrow="مركز القيادة" title="لوحة التحكم" description="وصف أطول" variant="hero" />,
    );

    expect(markup).toContain("text-5xl");
    expect(markup).toContain("pb-6");
    expect(markup).toContain("h-px w-6");
  });
});
