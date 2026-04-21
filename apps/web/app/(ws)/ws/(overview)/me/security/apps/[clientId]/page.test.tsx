import { expect, it, vi } from "vitest";

const { redirect, getAuthenticatedSession, buildWorkspaceOrganizationAppsPath, buildWorkspaceSecurityAppsPath } = vi.hoisted(() => ({
  redirect: vi.fn((destination: string) => {
    throw new Error(`NEXT_REDIRECT:${destination}`);
  }),
  getAuthenticatedSession: vi.fn(),
  buildWorkspaceOrganizationAppsPath: vi.fn(() => "/ws/settings?tab=apps&source=legacy-account-apps"),
  buildWorkspaceSecurityAppsPath: vi.fn((clientId?: string) => clientId ? `/ws/me/security/apps/${clientId}` : "/ws/me/security/apps"),
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("@/lib/serverSession", () => ({
  getAuthenticatedSession,
  buildWorkspaceOrganizationAppsPath,
  buildWorkspaceSecurityAppsPath,
}));

import WorkspaceSecurityDetailPage from "./page";

it("redirects legacy detail routes to organization apps settings", async () => {
  getAuthenticatedSession.mockResolvedValue({ token: "session-token" });

  await expect(
    WorkspaceSecurityDetailPage({ params: Promise.resolve({ clientId: "client-1" }) }),
  ).rejects.toThrow("NEXT_REDIRECT:/ws/settings?tab=apps&source=legacy-account-apps");
});

it("keeps the detail route as the sign-in returnTo when signed out", async () => {
  getAuthenticatedSession.mockResolvedValue({ token: null });

  await expect(
    WorkspaceSecurityDetailPage({ params: Promise.resolve({ clientId: "client-1" }) }),
  ).rejects.toThrow(
    `NEXT_REDIRECT:/signin?returnTo=${encodeURIComponent("/ws/me/security/apps/client-1")}`,
  );
});
