import { expect, it, vi } from "vitest";

const { redirect } = vi.hoisted(() => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

import WorkspaceOfferDeveloperProfilesRoute from "./page";

it("redirects developer profile routes back to the main offers view", async () => {
  await expect(WorkspaceOfferDeveloperProfilesRoute()).rejects.toThrow("NEXT_REDIRECT");
  expect(redirect).toHaveBeenCalledWith("/ws/offers");
});
