import { beforeEach, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const { updateCurrentOrganizationForCurrentUser } = vi.hoisted(() => ({
  updateCurrentOrganizationForCurrentUser: vi.fn(),
}));

vi.mock("@/server/domains/auth/organizations/service", () => ({
  updateCurrentOrganizationForCurrentUser,
}));

import { PATCH } from "./route";

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
    description: "desc",
    website: "https://example.com",
    contactEmail: "contact@example.com",
  });

  const response = await PATCH(
    new Request("http://localhost/api/organizations/current", {
      method: "PATCH",
      body: JSON.stringify({
        name: "Updated Realty",
        description: "desc",
        website: "https://example.com",
        contactEmail: "contact@example.com",
      }),
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
    description: "desc",
    website: "https://example.com",
    contactEmail: "contact@example.com",
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
