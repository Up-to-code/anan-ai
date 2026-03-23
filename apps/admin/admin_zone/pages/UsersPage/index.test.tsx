import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import UsersPage from "./index";

it("renders mocked user rows and detail links", () => {
  const html = renderToStaticMarkup(<UsersPage />);

  expect(html).toContain("أحمد حمدي");
  expect(html).toContain("/users/user-1");
});

