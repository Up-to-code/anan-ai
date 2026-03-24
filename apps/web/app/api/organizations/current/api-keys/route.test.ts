import { beforeEach, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const {
  listCurrentOrganizationApiKeysForCurrentUser,
  createCurrentOrganizationApiKeyForCurrentUser,
} = vi.hoisted(() => ({
  listCurrentOrganizationApiKeysForCurrentUser: vi.fn(),
  createCurrentOrganizationApiKeyForCurrentUser: vi.fn(),
}));

vi.mock("@/server/domains/auth/organizationApiKeys/service", () => ({
  listCurrentOrganizationApiKeysForCurrentUser,
  createCurrentOrganizationApiKeyForCurrentUser,
}));

import { GET, POST } from "./route";

beforeEach(() => {
  listCurrentOrganizationApiKeysForCurrentUser.mockReset();
  createCurrentOrganizationApiKeyForCurrentUser.mockReset();
});

it("lists organization api keys", async () => {
  listCurrentOrganizationApiKeysForCurrentUser.mockResolvedValue([{ keyId: "oak_1", name: "Key", prefix: "anan_abcd", permissions: [], status: "active", createdBy: "auth-1", createdAt: 1, id: "row-1" }]);

  const response = await GET();

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual([{ keyId: "oak_1", name: "Key", prefix: "anan_abcd", permissions: [], status: "active", createdBy: "auth-1", createdAt: 1, id: "row-1" }]);
});

it("creates an organization api key", async () => {
  createCurrentOrganizationApiKeyForCurrentUser.mockResolvedValue({
    apiKey: "anan_abcd.secret",
    key: { keyId: "oak_1", name: "Key", prefix: "anan_abcd", permissions: [], status: "active", createdBy: "auth-1", createdAt: 1, id: "row-1" },
  });

  const response = await POST(new Request("http://localhost/api/organizations/current/api-keys", {
    method: "POST",
    body: JSON.stringify({ name: "Key", permissions: [] }),
    headers: { "Content-Type": "application/json" },
  }));

  expect(response.status).toBe(201);
  await expect(response.json()).resolves.toEqual({
    apiKey: "anan_abcd.secret",
    key: { keyId: "oak_1", name: "Key", prefix: "anan_abcd", permissions: [], status: "active", createdBy: "auth-1", createdAt: 1, id: "row-1" },
  });
});

it("returns invalid-json for malformed create payload", async () => {
  const response = await POST(new Request("http://localhost/api/organizations/current/api-keys", {
    method: "POST",
    body: "{",
    headers: { "Content-Type": "application/json" },
  }));

  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toEqual({
    code: "INVALID_REQUEST",
    message: "Request body must be valid JSON",
    status: 400,
  });
});

it("serializes creation errors", async () => {
  createCurrentOrganizationApiKeyForCurrentUser.mockRejectedValue(new DomainError({ code: "FORBIDDEN", message: "Manager role required", status: 403 }));

  const response = await POST(new Request("http://localhost/api/organizations/current/api-keys", {
    method: "POST",
    body: JSON.stringify({ name: "Key", permissions: [] }),
    headers: { "Content-Type": "application/json" },
  }));

  expect(response.status).toBe(403);
});
