import { beforeEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const { createCurrentOrganizationInvite } = vi.hoisted(() => ({
  createCurrentOrganizationInvite: vi.fn(),
}));

vi.mock("@/server/domains/organizations/service", () => ({
  createCurrentOrganizationInvite,
}));

import { POST } from "./route";

describe("POST /api/workspace/team-invites", () => {
  beforeEach(() => {
    createCurrentOrganizationInvite.mockReset();
  });

  it("creates an invite", async () => {
    createCurrentOrganizationInvite.mockResolvedValue("invite-1");

    const response = await POST(
      new Request("http://localhost/api/workspace/team-invites", {
        method: "POST",
        body: JSON.stringify({ email: "agent@example.com", role: "member" }),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ inviteId: "invite-1" });
  });

  it("returns a stable invalid-json error", async () => {
    const response = await POST(
      new Request("http://localhost/api/workspace/team-invites", {
        method: "POST",
        body: "{",
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      code: "INVALID_REQUEST",
      message: "Request body must be valid JSON",
      status: 400,
    });
  });

  it("serializes domain failures", async () => {
    createCurrentOrganizationInvite.mockRejectedValue(
      new DomainError({
        code: "INVITE_EXISTS",
        message: "Invite already exists",
        status: 409,
      }),
    );

    const response = await POST(
      new Request("http://localhost/api/workspace/team-invites", {
        method: "POST",
        body: JSON.stringify({ email: "agent@example.com", role: "member" }),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      code: "INVITE_EXISTS",
      message: "Invite already exists",
      status: 409,
    });
  });
});
