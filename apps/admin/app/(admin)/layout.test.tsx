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

vi.mock("@/components/shared/AdminShell", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-shell">{children}</div>,
}));

import AdminLayout from "./layout";

describe("admin protected layout", () => {
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
      AdminLayout({
        children: <div>content</div>,
      }),
    ).rejects.toThrow("NEXT_REDIRECT:/signin?returnTo=/dashboard");
  });

  it("renders the shell for admin users", async () => {
    getAuthenticatedSession.mockResolvedValue({
      token: "token-1",
      role: "admin",
      user: { id: "u1", isActive: true },
    });

    const element = await AdminLayout({
      children: <div>content</div>,
    });

    expect(element).toBeTruthy();
  });
});
