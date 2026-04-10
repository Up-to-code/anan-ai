import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import WorkspacePanel from "./WorkspacePanel";

describe("WorkspacePanel", () => {
  it("uses compact density spacing for simple panels", () => {
    const markup = renderToStaticMarkup(<WorkspacePanel density="compact">panel</WorkspacePanel>);

    expect(markup).toContain("p-4");
    expect(markup).toContain("rounded-lg");
  });

  it("uses hero density spacing for structured panels", () => {
    const markup = renderToStaticMarkup(
      <WorkspacePanel density="hero" header={<div>header</div>} footer={<div>footer</div>}>
        panel
      </WorkspacePanel>,
    );

    expect(markup).toContain("sm:py-5");
    expect(markup).toContain("border-b");
    expect(markup).toContain("header");
    expect(markup).toContain("footer");
  });
});
