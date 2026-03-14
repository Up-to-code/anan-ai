import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import BrandVectorPanel from "./BrandVectorPanel";

describe("BrandVectorPanel", () => {
  it("renders the branded vector media mode by default", () => {
    const markup = renderToStaticMarkup(
      <BrandVectorPanel title="مالقا ريزيدنس" subtitle="الملقا، الرياض" />,
    );

    expect(markup).toContain("Anan Signal");
    expect(markup).toContain("مالقا ريزيدنس");
    expect(markup).toContain("الملقا، الرياض");
  });

  it("supports the photo fallback mode", () => {
    const markup = renderToStaticMarkup(
      <BrandVectorPanel
        title="فلل النرجس"
        imageMode="photo"
        imageSrc="https://images.unsplash.com/photo-example"
      />,
    );

    expect(markup).toContain("https://images.unsplash.com/photo-example");
    expect(markup).not.toContain("Anan Signal");
  });
});
