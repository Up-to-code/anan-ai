import { beforeEach, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const { bootstrapCurrentOrganizationFromBetterAuth } = vi.hoisted(() => ({
  bootstrapCurrentOrganizationFromBetterAuth: vi.fn(),
}));

vi.mock("@/server/domains/auth/organizations/service", () => ({
  bootstrapCurrentOrganizationFromBetterAuth,
}));

import { POST } from "./route";

beforeEach(() => {
  bootstrapCurrentOrganizationFromBetterAuth.mockReset();
});

it("returns 201 when the organization is created", async () => {
  bootstrapCurrentOrganizationFromBetterAuth.mockResolvedValue({
    id: "org_1",
    type: "broker",
    name: "Fresh Start Realty",
    slug: "fresh-start-realty",
    status: "active",
    isVerified: false,
  });

  const response = await POST(
    new Request("http://localhost/api/organizations", {
      method: "POST",
      body: JSON.stringify({ organizationId: "org_1", name: "Fresh Start Realty", type: "broker" }),
      headers: { "Content-Type": "application/json" },
    }),
  );

  expect(response.status).toBe(201);
  await expect(response.json()).resolves.toEqual({
    id: "org_1",
    type: "broker",
    name: "Fresh Start Realty",
    slug: "fresh-start-realty",
    status: "active",
    isVerified: false,
  });
});

it("returns a stable invalid-json error", async () => {
  const response = await POST(
    new Request("http://localhost/api/organizations", {
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
  bootstrapCurrentOrganizationFromBetterAuth.mockRejectedValue(
    new DomainError({
      code: "ORGANIZATION_EXISTS",
      message: "This account already has an organization",
      status: 409,
    }),
  );

  const response = await POST(
    new Request("http://localhost/api/organizations", {
      method: "POST",
      body: JSON.stringify({ organizationId: "org_1", name: "Fresh Start Realty", type: "broker" }),
      headers: { "Content-Type": "application/json" },
    }),
  );

  expect(response.status).toBe(409);
  await expect(response.json()).resolves.toEqual({
    code: "ORGANIZATION_EXISTS",
    message: "This account already has an organization",
    status: 409,
  });
});
