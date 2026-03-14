import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { redirect, getAuthenticatedSession, sanitizeInternalReturnTo } = vi.hoisted(() => ({
  redirect: vi.fn((destination: string) => {
    throw new Error(`NEXT_REDIRECT:${destination}`);
  }),
  getAuthenticatedSession: vi.fn(),
  sanitizeInternalReturnTo: vi.fn((returnTo?: string | null, fallback = "/ws") => returnTo ?? fallback),
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("@/lib/serverSession", () => ({
  getAuthenticatedSession,
  sanitizeInternalReturnTo,
}));

vi.mock("@/components/auth/GoogleSignInButton", () => ({
  default: ({ redirectTo }: { redirectTo: string }) => <button type="button">Google:{redirectTo}</button>,
}));

vi.mock("@/components/shared/PageHero", () => ({
  default: ({
    title,
    description,
    actions,
  }: {
    title: string;
    description?: React.ReactNode;
    actions?: React.ReactNode;
  }) => (
    <div>
      <h1>{title}</h1>
      <div>{description}</div>
      <div>{actions}</div>
    </div>
  ),
}));

vi.mock("@/components/shared/Section", () => ({
  default: ({ children }: { children?: React.ReactNode }) => <section>{children}</section>,
}));

import SigninPage from "./page";

describe("/signin page", () => {
  beforeEach(() => {
    redirect.mockClear();
    getAuthenticatedSession.mockReset();
    sanitizeInternalReturnTo.mockClear();
  });

  it("redirects authenticated users directly to the workspace target", async () => {
    getAuthenticatedSession.mockResolvedValue({
      token: "session-token",
      user: null,
      role: "broker",
    });

    await expect(
      SigninPage({
        searchParams: Promise.resolve({ returnTo: "/ws/settings" }),
      }),
    ).rejects.toThrow("NEXT_REDIRECT:/ws/settings");

    expect(sanitizeInternalReturnTo).toHaveBeenCalledWith("/ws/settings", "/ws");
  });

  it("renders the sign-in screen when no session exists", async () => {
    getAuthenticatedSession.mockResolvedValue({
      token: null,
      user: null,
      role: null,
    });

    const element = await SigninPage({
      searchParams: Promise.resolve({ returnTo: "/ws" }),
    });
    const markup = renderToStaticMarkup(element);

    expect(markup).toContain("دخول النظام المؤسسي");
    expect(markup).toContain("Google:/ws");
  });
});
