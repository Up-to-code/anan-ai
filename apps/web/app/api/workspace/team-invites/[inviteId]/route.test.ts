import { beforeEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const { cancelCurrentOrganizationInvite } = vi.hoisted(() => ({
  cancelCurrentOrganizationInvite: vi.fn(),
}));

vi.mock("@/server/domains/organizations/service", () => ({
  cancelCurrentOrganizationInvite,
}));

import { DELETE } from "./route";

describe("DELETE /api/workspace/team-invites/[inviteId]", () => {
  beforeEach(() => {
    cancelCurrentOrganizationInvite.mockReset();
  });

  it("cancels the invite", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/workspace/team-invites/invite-1", { method: "DELETE" }),
      { params: Promise.resolve({ inviteId: "invite-1" }) },
    );

    expect(cancelCurrentOrganizationInvite).toHaveBeenCalledWith("invite-1");
    expect(response.status).toBe(204);
  });

  it("serializes domain failures", async () => {
    cancelCurrentOrganizationInvite.mockRejectedValue(
      new DomainError({
        code: "FORBIDDEN",
        message: "Manager role required",
        status: 403,
      }),
    );

    const response = await DELETE(
      new Request("http://localhost/api/workspace/team-invites/invite-1", { method: "DELETE" }),
      { params: Promise.resolve({ inviteId: "invite-1" }) },
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      code: "FORBIDDEN",
      message: "Manager role required",
      status: 403,
    });
  });
});
