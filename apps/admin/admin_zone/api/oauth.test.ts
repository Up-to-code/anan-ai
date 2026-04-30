import { beforeEach, expect, it, vi } from "vitest";

const { requireAdminPageSession } = vi.hoisted(() => ({
  requireAdminPageSession: vi.fn(),
}));

const { convexOAuthRepository } = vi.hoisted(() => ({
  convexOAuthRepository: {
    getAuthorizationPrompt: vi.fn(),
    approveAuthorization: vi.fn(),
  },
}));

vi.mock("@/lib/serverSession", () => ({
  requireAdminPageSession,
}));

vi.mock("@/server/infrastructure/convex/oauthRepository", () => ({
  convexOAuthRepository,
}));

import { approveOAuthAuthorization, getOAuthAuthorizePageData } from "./oauth";

beforeEach(() => {
  requireAdminPageSession.mockReset();
  convexOAuthRepository.getAuthorizationPrompt.mockReset();
  convexOAuthRepository.approveAuthorization.mockReset();
});

it("loads the authorization prompt with a flow-aware returnTo", async () => {
  requireAdminPageSession.mockResolvedValue({
    token: "admin-token",
    user: { id: "admin-1" },
    role: "admin",
  });
  convexOAuthRepository.getAuthorizationPrompt.mockResolvedValue({
    flowId: "flow-123",
    redirectUri: "https://example.com/callback",
    state: "state-1",
    offlineAccess: false,
    requiresConsent: true,
    existingAuthorization: null,
    client: { clientId: "client-1", name: "External Publisher", publisherName: "Publisher" },
    requestedScopes: [],
    user: { email: "admin@example.com" },
  });

  const result = await getOAuthAuthorizePageData("flow-123");

  expect(requireAdminPageSession).toHaveBeenCalledWith("/oauth/authorize?flow=flow-123");
  expect(convexOAuthRepository.getAuthorizationPrompt).toHaveBeenCalledWith("admin-token", "flow-123");
  expect(result.preview.flowId).toBe("flow-123");
});

it("approves the flow using the admin session", async () => {
  requireAdminPageSession.mockResolvedValue({
    token: "admin-token",
    user: { id: "admin-1" },
    role: "admin",
  });
  convexOAuthRepository.approveAuthorization.mockResolvedValue({
    redirectUrl: "https://example.com/callback?code=abc",
  });

  const result = await approveOAuthAuthorization("flow-123");

  expect(requireAdminPageSession).toHaveBeenCalledWith("/oauth/authorize?flow=flow-123");
  expect(convexOAuthRepository.approveAuthorization).toHaveBeenCalledWith("admin-token", "flow-123");
  expect(result.redirectUrl).toContain("code=abc");
});
