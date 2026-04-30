import { beforeEach, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const { syncCurrentOrganizationFromBetterAuth } = vi.hoisted(() => ({
  syncCurrentOrganizationFromBetterAuth: vi.fn(),
}));

vi.mock("@/server/domains/auth/organizations/service", () => ({
  syncCurrentOrganizationFromBetterAuth,
}));

import { POST } from "./route";

beforeEach(() => {
  syncCurrentOrganizationFromBetterAuth.mockReset();
});

it("returns the synced organization payload", async () => {
  syncCurrentOrganizationFromBetterAuth.mockResolvedValue({
    id: "org_1",
    organizationId: "org_1",
    type: "broker",
    name: "Synced Org",
    slug: "synced-org",
    status: "active",
    isVerified: false,
  });

  const response = await POST();

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({
    ok: true,
    organization: {
      id: "org_1",
      organizationId: "org_1",
      type: "broker",
      name: "Synced Org",
      slug: "synced-org",
      status: "active",
      isVerified: false,
    },
  });
});

it("returns a no-op payload when no active organization is selected", async () => {
  syncCurrentOrganizationFromBetterAuth.mockResolvedValue(null);

  const response = await POST();

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({
    ok: true,
    organization: null,
  });
});

it("serializes domain failures", async () => {
  syncCurrentOrganizationFromBetterAuth.mockRejectedValue(
    new DomainError({
      code: "FORBIDDEN",
      message: "Active organization required",
      status: 403,
    }),
  );

  const response = await POST();

  expect(response.status).toBe(403);
  await expect(response.json()).resolves.toEqual({
    code: "FORBIDDEN",
    message: "Active organization required",
    status: 403,
  });
});
