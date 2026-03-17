import { beforeEach, describe, expect, it, vi } from "vitest";

const { redirect } = vi.hoisted(() => ({
  redirect: vi.fn((destination: string) => {
    throw new Error(`NEXT_REDIRECT:${destination}`);
  }),
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

import WorkspaceMembersPage from "./page";

describe("/ws/settings/members page", () => {
  beforeEach(() => {
    redirect.mockClear();
  });

  it("redirects to the canonical members settings tab", async () => {
    await expect(WorkspaceMembersPage()).rejects.toThrow("NEXT_REDIRECT:/ws/settings?tab=members");
    expect(redirect).toHaveBeenCalledWith("/ws/settings?tab=members");
  });
});
