import { describe, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

vi.mock("@/server/auth/session", () => ({
  requireSessionContext: vi.fn(),
}));

import {
  approveAuthorizationForCurrentUser,
  getAuthorizationPromptForCurrentUser,
  getAuthorizedAppDetailForCurrentUser,
  listAuthorizedAppsForCurrentUser,
  revokeAuthorizedAppForCurrentUser,
} from "./service";

describe("oauth domain service", () => {
  const requireSession = vi.fn(async () => ({
    token: "token-1",
    context: { userId: "user-1", isActive: true },
    profile: null,
  }));

  it("loads the authorization prompt through the repository", async () => {
    const repository = {
      getAuthorizationPrompt: vi.fn(async () => ({
        flowId: "flow-1",
        client: { clientId: "c1", name: "App", publisherName: "Pub" },
        user: {},
        state: "s",
        redirectUri: "https://a.test",
        requestedScopes: [],
        offlineAccess: false,
        requiresConsent: true,
        existingAuthorization: null,
      })),
      approveAuthorization: vi.fn(),
      listAuthorizedApps: vi.fn(),
      getAuthorizedAppDetail: vi.fn(),
      revokeAuthorizedApp: vi.fn(),
    };

    const prompt = await getAuthorizationPromptForCurrentUser("flow-1", { requireSession, repository });
    expect(prompt.flowId).toBe("flow-1");
    expect(repository.getAuthorizationPrompt).toHaveBeenCalledWith("token-1", "flow-1");
  });

  it("lists, approves, and revokes authorized apps through the repository", async () => {
    const repository = {
      getAuthorizationPrompt: vi.fn(),
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

    const apps = await listAuthorizedAppsForCurrentUser({ requireSession, repository });
    expect(apps).toHaveLength(1);

    await expect(
      approveAuthorizationForCurrentUser("flow-1", { requireSession, repository }),
    ).resolves.toEqual({ redirectUrl: "https://client.test/cb?code=1" });

    await revokeAuthorizedAppForCurrentUser("c1", { requireSession, repository });
    expect(repository.revokeAuthorizedApp).toHaveBeenCalledWith("token-1", "c1");

    await expect(
      getAuthorizedAppDetailForCurrentUser("c1", {
        requireSession,
        repository: {
          ...repository,
          getAuthorizedAppDetail: vi.fn(async () => {
            throw new DomainError({ code: "FORBIDDEN", message: "Denied", status: 403 });
          }),
        },
      }),
    ).rejects.toBeInstanceOf(DomainError);
  });
});
