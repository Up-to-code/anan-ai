import { expect, it, vi } from "vitest";

const { redirect, getAuthenticatedSession, buildWorkspaceOrganizationAppsPath, buildWorkspaceSecurityAppsPath } = vi.hoisted(() => ({
  redirect: vi.fn((destination: string) => {
    throw new Error(`NEXT_REDIRECT:${destination}`);
  }),
  getAuthenticatedSession: vi.fn(),
  buildWorkspaceOrganizationAppsPath: vi.fn(() => "/ws/settings?tab=apps&source=legacy-account-apps"),
  buildWorkspaceSecurityAppsPath: vi.fn(() => "/ws/me/security/apps"),
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("@/lib/serverSession", () => ({
  getAuthenticatedSession,
  buildWorkspaceOrganizationAppsPath,
  buildWorkspaceSecurityAppsPath,
}));

import WorkspaceSecurityAppsPage from "./page";

it("redirects authenticated users to organization apps settings", async () => {
  getAuthenticatedSession.mockResolvedValue({ token: "session-token" });

  await expect(WorkspaceSecurityAppsPage()).rejects.toThrow(
    "NEXT_REDIRECT:/ws/settings?tab=apps&source=legacy-account-apps",
  );
});

it("preserves the legacy route as sign-in returnTo for signed-out users", async () => {
  getAuthenticatedSession.mockResolvedValue({ token: null });

  await expect(WorkspaceSecurityAppsPage()).rejects.toThrow(
    `NEXT_REDIRECT:/signin?returnTo=${encodeURIComponent("/ws/me/security/apps")}`,
  );
});
