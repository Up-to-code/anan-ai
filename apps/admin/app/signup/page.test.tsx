import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";

vi.mock("@/components/auth/AdminSignupForm", () => ({
  default: () => <form data-testid="admin-signup-form" />,
}));

import AdminSignupPage from "./page";

it("renders the invite-gated admin signup form", () => {
  const html = renderToStaticMarkup(<AdminSignupPage />);

  expect(html).toContain("data-testid=\"admin-signup-form\"");
  expect(html).toContain("إنشاء حساب إدارة");
});
