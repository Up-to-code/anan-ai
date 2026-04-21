import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import AdminPageLayout from "./AdminPageLayout";

describe("AdminPageLayout", () => {
  it("keeps dashboard rails sticky by default", () => {
    const markup = renderToStaticMarkup(
      <AdminPageLayout main={<div>main</div>} rail={<div>rail</div>} variant="dashboard" />,
    );

    expect(markup).toContain("xl:grid-cols-[minmax(0,1.9fr)_minmax(280px,340px)]");
    expect(markup).toContain("xl:top-[5.5rem]");
  });

  it("renders list layouts with contained width and static rails", () => {
    const markup = renderToStaticMarkup(
      <AdminPageLayout main={<div>main</div>} rail={<div>rail</div>} variant="list" />,
    );

    expect(markup).toContain("max-w-[1420px]");
    expect(markup).toContain("xl:grid-cols-[minmax(0,1.85fr)_minmax(260px,320px)]");
    expect(markup).not.toContain("xl:top-[5.5rem]");
  });
});
