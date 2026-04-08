import { expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

vi.mock("@/server/auth/session", () => ({
  requireSessionContext: vi.fn(),
}));

import {
  approveAuthorizationForCurrentUser,
  getAuthorizationPromptForCurrentUser,
  getAuthorizedAppDetailForCurrentOrganization,
  listAuthorizedAppsForCurrentOrganization,
  revokeAuthorizedAppForCurrentOrganization,
} from "./service";

const requireSession = vi.fn(async () => ({
  token: "token-1",
  context: { userId: "user-1", isActive: true },
  profile: null,
}));

function createRepository() {
  return {
    getAuthorizationPrompt: vi.fn(async () => ({
      flowId: "flow-1",
      client: { clientId: "c1", name: "App", publisherName: "Pub" },
      user: {},
      state: "s",
      redirectUri: "https://a.test",
      requestedScopes: [],
      offlineAccess: false,
      organizations: [],
      selectedTenantOrgId: null,
      selectedOrganization: null,
      requiresOrganizationSelection: false,
      canApproveSelectedOrganization: false,
      managerApprovalRequired: false,
      approvalDisabledReason: null,
      requiresConsent: true,
      existingAuthorization: null,
    })),
    approveAuthorization: vi.fn(async () => ({ redirectUrl: "https://client.test/cb?code=1" })),
    listAuthorizedApps: vi.fn(async () => [
      {
        authorizationId: "a1",
        clientId: "c1",
        appName: "App",
        publisherName: "Pub",
        grantedScopes: [],
        scopeDetails: [],
        offlineAccess: false,
        createdAt: 1,
        updatedAt: 1,
        lastUsedAt: null,
      },
    ]),
    getAuthorizedAppDetail: vi.fn(async () => null),
    revokeAuthorizedApp: vi.fn(async () => undefined),
  };
}

it("loads the authorization prompt through the repository", async () => {
  const repository = createRepository();

  const prompt = await getAuthorizationPromptForCurrentUser("flow-1", undefined, { requireSession, repository });
  expect(prompt.flowId).toBe("flow-1");
  expect(repository.getAuthorizationPrompt).toHaveBeenCalledWith("token-1", "flow-1", undefined);
});

it("lists, approves, and revokes authorized apps through the repository", async () => {
  const repository = createRepository();

  const apps = await listAuthorizedAppsForCurrentOrganization({ requireSession, repository });
  expect(apps).toHaveLength(1);

  await expect(
    approveAuthorizationForCurrentUser("flow-1", "tenant-1", { requireSession, repository }),
  ).resolves.toEqual({ redirectUrl: "https://client.test/cb?code=1" });

  await revokeAuthorizedAppForCurrentOrganization("c1", { requireSession, repository });
  expect(repository.revokeAuthorizedApp).toHaveBeenCalledWith("token-1", "c1");
});

it("bubbles domain errors from authorized app detail", async () => {
  const repository = createRepository();
  repository.getAuthorizedAppDetail = vi.fn(async () => {
    throw new DomainError({ code: "FORBIDDEN", message: "Denied", status: 403 });
  });

  await expect(
    getAuthorizedAppDetailForCurrentOrganization("c1", { requireSession, repository }),
  ).rejects.toBeInstanceOf(DomainError);
});
