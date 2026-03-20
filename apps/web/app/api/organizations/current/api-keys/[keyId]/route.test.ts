import { beforeEach, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const { revokeCurrentOrganizationApiKeyForCurrentUser } = vi.hoisted(() => ({
  revokeCurrentOrganizationApiKeyForCurrentUser: vi.fn(),
}));

vi.mock("@/server/domains/organizationApiKeys/service", () => ({
  revokeCurrentOrganizationApiKeyForCurrentUser,
}));

import { DELETE } from "./route";

beforeEach(() => {
  revokeCurrentOrganizationApiKeyForCurrentUser.mockReset();
});

it("revokes the requested api key", async () => {
  const response = await DELETE(new Request("http://localhost"), { params: Promise.resolve({ keyId: "oak_1" }) });

  expect(revokeCurrentOrganizationApiKeyForCurrentUser).toHaveBeenCalledWith("oak_1");
  expect(response.status).toBe(200);
});

it("serializes revoke errors", async () => {
  revokeCurrentOrganizationApiKeyForCurrentUser.mockRejectedValue(new DomainError({ code: "NOT_FOUND", message: "API key not found", status: 404 }));

  const response = await DELETE(new Request("http://localhost"), { params: Promise.resolve({ keyId: "oak_1" }) });

  expect(response.status).toBe(404);
});
