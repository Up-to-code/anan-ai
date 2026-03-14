import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import WorkspaceRootLayout from "./layout";

describe("workspace root layout", () => {
  it("leaves shell selection to nested route groups", () => {
    const markup = renderToStaticMarkup(
      <WorkspaceRootLayout>
        <div>Body</div>
      </WorkspaceRootLayout>,
    );

    expect(markup).toContain("Body");
    expect(markup).not.toContain("workspace-shell");
  });
});
