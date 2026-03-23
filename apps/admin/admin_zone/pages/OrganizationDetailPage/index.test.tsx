import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import OrganizationDetailPage from "./index";

it("renders organization summary, documents, and members from the mocked detail page", () => {
  const html = renderToStaticMarkup(<OrganizationDetailPage organizationId="org-2" />);

  expect(html).toContain("أفق الوسطاء");
  expect(html).toContain("الوثائق");
  expect(html).toContain("السجل التجاري");
  expect(html).toContain("الأعضاء");
});

