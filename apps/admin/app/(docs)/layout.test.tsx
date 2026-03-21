import { beforeEach, describe, expect, it, vi } from "vitest";

const { redirect, getAuthenticatedSession } = vi.hoisted(() => ({
  redirect: vi.fn((target: string) => {
    throw new Error(`NEXT_REDIRECT:${target}`);
  }),
  getAuthenticatedSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("@/lib/serverSession", () => ({
  getAuthenticatedSession,
}));

import DocsRootLayout from "./layout";

describe("docs standalone layout", () => {
  beforeEach(() => {
    redirect.mockClear();
    getAuthenticatedSession.mockReset();
  });

  it("redirects anonymous users to sign-in", async () => {
    getAuthenticatedSession.mockResolvedValue({
      token: null,
      role: null,
      user: null,
    });

    await expect(
      DocsRootLayout({
        children: <div>docs</div>,
      }),
    ).rejects.toThrow("NEXT_REDIRECT:/signin?returnTo=/docs");
  });

  it("redirects authenticated users to the dashboard", async () => {
    getAuthenticatedSession.mockResolvedValue({
      token: "token-1",
      role: "admin",
      user: { id: "u1", isActive: true, name: "Ahmed" },
    });

    await expect(
      DocsRootLayout({
        children: <div>docs</div>,
      }),
    ).rejects.toThrow("NEXT_REDIRECT:/dashboard");
  });
});
