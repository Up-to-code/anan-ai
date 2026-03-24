import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { cookies, redirect } = vi.hoisted(() => ({
  cookies: vi.fn(),
  redirect: vi.fn((target: string) => {
    throw new Error(`NEXT_REDIRECT:${target}`);
  }),
}));

vi.mock("next/headers", () => ({
  cookies,
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

import LandingPage from "./page";

describe("private docs landing page", () => {
  beforeEach(() => {
    cookies.mockReset();
    redirect.mockClear();
  });

  it("renders the unlock form and inline error state when access is missing", async () => {
    cookies.mockResolvedValue({ get: vi.fn(() => undefined) });

    const element = await LandingPage({
      searchParams: Promise.resolve({
        error: "invalid-pin",
        returnTo: "/docs/web-review",
      }),
    });
    const markup = renderToStaticMarkup(element);

    expect(markup).toContain("Unlock Developer Handbook");
    expect(markup).toContain("Internal Handbook For The Anan Codebase");
    expect(markup).toContain("The PIN was incorrect");
    expect(markup).toContain('name="returnTo" value="/docs/web-review"');
  });

  it("redirects unlocked sessions into the requested docs route", async () => {
    cookies.mockResolvedValue({
      get: vi.fn(() => ({ value: "granted" })),
    });

    await expect(
      LandingPage({
        searchParams: Promise.resolve({
          returnTo: "/docs/convex-review",
        }),
      }),
    ).rejects.toThrow("NEXT_REDIRECT:/docs/convex-review");
  });
});
