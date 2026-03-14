import { beforeEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const { updateCurrentOrganizationForCurrentUser } = vi.hoisted(() => ({
  updateCurrentOrganizationForCurrentUser: vi.fn(),
}));

vi.mock("@/server/domains/organizations/service", () => ({
  updateCurrentOrganizationForCurrentUser,
}));

import { PATCH } from "./route";

describe("PATCH /api/organizations/current", () => {
  beforeEach(() => {
    updateCurrentOrganizationForCurrentUser.mockReset();
  });

  it("returns the updated organization", async () => {
    updateCurrentOrganizationForCurrentUser.mockResolvedValue({
      id: "broker-1",
      type: "broker",
      name: "Updated Realty",
      slug: "updated-realty",
      status: "active",
      isVerified: true,
    });

    const response = await PATCH(
      new Request("http://localhost/api/organizations/current", {
        method: "PATCH",
        body: JSON.stringify({ name: "Updated Realty" }),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: "broker-1",
      type: "broker",
      name: "Updated Realty",
      slug: "updated-realty",
      status: "active",
      isVerified: true,
    });
  });

  it("returns a stable invalid-json error", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/organizations/current", {
        method: "PATCH",
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
    updateCurrentOrganizationForCurrentUser.mockRejectedValue(
      new DomainError({
        code: "FORBIDDEN",
        message: "Manager role required",
        status: 403,
      }),
    );

    const response = await PATCH(
      new Request("http://localhost/api/organizations/current", {
        method: "PATCH",
        body: JSON.stringify({ name: "Updated Realty" }),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      code: "FORBIDDEN",
      message: "Manager role required",
      status: 403,
    });
  });
});
