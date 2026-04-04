import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";

vi.mock("@/lib/serverSession", () => ({
  requireAdminPageSession: vi.fn(),
}));

vi.mock("@/server/infrastructure/convex/adminOrganizationsRepository", () => ({
  convexAdminOrganizationsRepository: {
    getDetail: vi.fn(),
  },
}));

import OrganizationDetailPage from "./index";

it("renders organization summary, documents, and members from the mocked detail page", async () => {
  const element = await OrganizationDetailPage({ organizationId: "org-2" });
  const html = renderToStaticMarkup(element);

  expect(html).toContain("أفق الوسطاء");
  expect(html).toContain("الوثائق");
  expect(html).toContain("السجل التجاري");
  expect(html).toContain("الأعضاء");
});
