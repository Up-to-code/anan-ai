import { beforeEach, describe, expect, it, vi } from "vitest";
import { acceptIncomingInvite, declineIncomingInvite } from "./organizationInvitesActions";

describe("organizationInvitesActions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("posts to accept incoming invites", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
    } as Response);

    const result = await acceptIncomingInvite("token-1");

    expect(result).toBe(true);
    expect(fetchSpy).toHaveBeenCalledWith("/api/workspace/incoming-invites/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "token-1" }),
    });
  });

  it("deletes incoming invites by id", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
    } as Response);

    const result = await declineIncomingInvite("invite-1");

    expect(result).toBe(true);
    expect(fetchSpy).toHaveBeenCalledWith("/api/workspace/incoming-invites/invite-1", {
      method: "DELETE",
    });
  });
});
