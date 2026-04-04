import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import AdminRenderBoundary from "./AdminRenderBoundary";

describe("AdminRenderBoundary", () => {
  it("renders its children when no error occurs", () => {
    const html = renderToStaticMarkup(
      <AdminRenderBoundary fallback={<div>fallback</div>}>
        <div>content</div>
      </AdminRenderBoundary>,
    );

    expect(html).toContain("content");
    expect(html).not.toContain("fallback");
  });
});
