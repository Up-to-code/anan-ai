import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";

const { getAdminUsersPageData } = vi.hoisted(() => ({
  getAdminUsersPageData: vi.fn(),
}));

vi.mock("@/admin_zone/api/users", () => ({
  getAdminUsersPageData,
}));

import UsersPage from "./index";

it("passes the selected tab to the data loader", async () => {
  getAdminUsersPageData.mockResolvedValue({
    session: {},
    tab: "profiles",
    users: {
      page: [],
      isDone: true,
      continueCursor: null,
    },
  });

  await UsersPage({
    tab: "profiles",
  });

  expect(getAdminUsersPageData).toHaveBeenCalledWith({
    tab: "profiles",
  });
});

it("renders user rows when data is present", async () => {
  getAdminUsersPageData.mockResolvedValue({
    session: {},
    tab: "users",
    users: {
      page: [
        {
          userKey: "auth__u-1",
          name: "Sara",
          email: "sara@example.com",
          channel: "web",
          role: "user",
          organizationName: "شركة الوساطة",
          verificationStatus: "approved",
        },
      ],
      isDone: true,
      continueCursor: null,
    },
  });

  const element = await UsersPage({
    tab: "users",
  });
  const html = renderToStaticMarkup(element);

  expect(html).toContain("Sara");
  expect(html).toContain("/users/auth__u-1");
});
