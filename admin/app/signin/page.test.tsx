import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { redirect, getAuthenticatedSession, sanitizeInternalReturnTo } = vi.hoisted(() => ({
  redirect: vi.fn((target: string) => {
    throw new Error(`NEXT_REDIRECT:${target}`);
  }),
  getAuthenticatedSession: vi.fn(),
  sanitizeInternalReturnTo: vi.fn((returnTo?: string | null, fallback = "/dashboard") => returnTo ?? fallback),
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("@/lib/serverSession", () => ({
  getAuthenticatedSession,
  sanitizeInternalReturnTo,
}));

vi.mock("@/components/auth/GoogleSignInButton", () => ({
  default: ({ redirectTo }: { redirectTo: string }) => <div data-testid="google-signin">{redirectTo}</div>,
}));

vi.mock("@/components/auth/LogoutButton", () => ({
  default: () => <div data-testid="logout-button">logout</div>,
}));

import SigninPage from "./page";

describe("/signin page", () => {
  beforeEach(() => {
    redirect.mockClear();
    getAuthenticatedSession.mockReset();
    sanitizeInternalReturnTo.mockClear();
  });

  it("redirects authenticated admins to the requested target", async () => {
    getAuthenticatedSession.mockResolvedValue({
      token: "token-1",
      role: "admin",
      user: { id: "u1", isActive: true },
    });

    await expect(
      SigninPage({
        searchParams: Promise.resolve({ returnTo: "/users" }),
      }),
    ).rejects.toThrow("NEXT_REDIRECT:/users");
  });

  it("renders the google sign-in button for anonymous visitors", async () => {
    getAuthenticatedSession.mockResolvedValue({
      token: null,
      role: null,
      user: null,
    });

    const element = await SigninPage({
      searchParams: Promise.resolve({ returnTo: "/dashboard" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("data-testid=\"google-signin\"");
    expect(html).not.toContain("data-testid=\"logout-button\"");
  });

  it("renders an access denied state for authenticated non-admin users", async () => {
    getAuthenticatedSession.mockResolvedValue({
      token: "token-2",
      role: "broker",
      user: { id: "u2", isActive: true },
    });

    const element = await SigninPage({
      searchParams: Promise.resolve({ returnTo: "/dashboard" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("data-testid=\"logout-button\"");
    expect(html).toContain("الحساب الحالي مسجل");
  });
});
