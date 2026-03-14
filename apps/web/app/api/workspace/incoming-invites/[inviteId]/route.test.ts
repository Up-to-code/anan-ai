import { beforeEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const { cancelIncomingOrganizationInvite } = vi.hoisted(() => ({
  cancelIncomingOrganizationInvite: vi.fn(),
}));

vi.mock("@/server/domains/organizations/service", () => ({
  cancelIncomingOrganizationInvite,
}));

import { DELETE } from "./route";

describe("DELETE /api/workspace/incoming-invites/[inviteId]", () => {
  beforeEach(() => {
    cancelIncomingOrganizationInvite.mockReset();
  });

  it("cancels the invite", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/workspace/incoming-invites/invite-1", { method: "DELETE" }),
      { params: Promise.resolve({ inviteId: "invite-1" }) },
    );

    expect(cancelIncomingOrganizationInvite).toHaveBeenCalledWith("invite-1");
    expect(response.status).toBe(204);
  });

  it("serializes domain failures", async () => {
    cancelIncomingOrganizationInvite.mockRejectedValue(
      new DomainError({
        code: "INVITE_EXPIRED",
        message: "Invite has expired",
        status: 410,
      }),
    );

    const response = await DELETE(
      new Request("http://localhost/api/workspace/incoming-invites/invite-1", { method: "DELETE" }),
      { params: Promise.resolve({ inviteId: "invite-1" }) },
    );

    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toEqual({
      code: "INVITE_EXPIRED",
      message: "Invite has expired",
      status: 410,
    });
  });
});
