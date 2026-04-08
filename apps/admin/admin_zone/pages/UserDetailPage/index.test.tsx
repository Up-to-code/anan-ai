import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import UserDetailPage from "./index";

it("renders the mocked user detail summary and permissions", () => {
  const html = renderToStaticMarkup(<UserDetailPage userId="user-1" />);

  expect(html).toContain("أحمد حمدي");
  expect(html).toContain("الحالة والوصول");
  expect(html).toContain("إدارة العروض");
});

it("renders an empty state for unknown users", () => {
  const html = renderToStaticMarkup(<UserDetailPage userId="missing-user" />);

  expect(html).toContain("المستخدم غير موجود");
});
