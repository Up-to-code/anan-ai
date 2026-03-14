import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import AIMotionLogo from "./AIMotionLogo";

describe("AIMotionLogo", () => {
  it("renders with the default state and size", () => {
    const markup = renderToStaticMarkup(<AIMotionLogo />);

    expect(markup).toContain("data-ai-motion-logo=\"true\"");
    expect(markup).toContain("data-ai-motion-state=\"idle\"");
    expect(markup).toContain("data-ai-motion-size=\"standard\"");
  });

  it("supports explicit state and hero sizing", () => {
    const markup = renderToStaticMarkup(
      <AIMotionLogo state="matching" size="hero" floating mirrored />,
    );

    expect(markup).toContain("data-ai-motion-state=\"matching\"");
    expect(markup).toContain("data-ai-motion-size=\"hero\"");
  });
});
