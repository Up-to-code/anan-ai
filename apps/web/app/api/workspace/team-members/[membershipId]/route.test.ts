import { beforeEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const { updateCurrentOrganizationMemberRole } = vi.hoisted(() => ({
  updateCurrentOrganizationMemberRole: vi.fn(),
}));

vi.mock("@/server/domains/organizations/service", () => ({
  updateCurrentOrganizationMemberRole,
}));

import { PATCH } from "./route";

describe("PATCH /api/workspace/team-members/[membershipId]", () => {
  beforeEach(() => {
    updateCurrentOrganizationMemberRole.mockReset();
  });

  it("updates the membership role", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/workspace/team-members/membership-1", {
        method: "PATCH",
        body: JSON.stringify({ role: "manager" }),
        headers: { "Content-Type": "application/json" },
      }),
      { params: Promise.resolve({ membershipId: "membership-1" }) },
    );

    expect(updateCurrentOrganizationMemberRole).toHaveBeenCalledWith("membership-1", { role: "manager" });
    expect(response.status).toBe(204);
  });

  it("returns a stable invalid-json error", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/workspace/team-members/membership-1", {
        method: "PATCH",
        body: "{",
        headers: { "Content-Type": "application/json" },
      }),
      { params: Promise.resolve({ membershipId: "membership-1" }) },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      code: "INVALID_REQUEST",
      message: "Request body must be valid JSON",
      status: 400,
    });
  });

  it("serializes domain failures", async () => {
    updateCurrentOrganizationMemberRole.mockRejectedValue(
      new DomainError({
        code: "FORBIDDEN",
        message: "Manager role required",
        status: 403,
      }),
    );

    const response = await PATCH(
      new Request("http://localhost/api/workspace/team-members/membership-1", {
        method: "PATCH",
        body: JSON.stringify({ role: "manager" }),
        headers: { "Content-Type": "application/json" },
      }),
      { params: Promise.resolve({ membershipId: "membership-1" }) },
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      code: "FORBIDDEN",
      message: "Manager role required",
      status: 403,
    });
  });
});
