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

import { PRIVATE_DOCS_COOKIE_NAME } from "@/lib/privateAccess";
import { unlockPrivateDocs } from "./actions";

describe("unlockPrivateDocs", () => {
  beforeEach(() => {
    cookies.mockReset();
    redirect.mockClear();
  });

  it("redirects back to the unlock screen when the PIN is invalid", async () => {
    const set = vi.fn();
    cookies.mockResolvedValue({ get: vi.fn(), set });

    const formData = new FormData();
    formData.set("pin", "9999");
    formData.set("returnTo", "/docs/web-review");

    await expect(unlockPrivateDocs(formData)).rejects.toThrow(
      "NEXT_REDIRECT:/?error=invalid-pin&returnTo=%2Fdocs%2Fweb-review",
    );
    expect(set).not.toHaveBeenCalled();
  });

  it("sets the access cookie and redirects to the requested docs route when the PIN is valid", async () => {
    const set = vi.fn();
    cookies.mockResolvedValue({ get: vi.fn(), set });

    const formData = new FormData();
    formData.set("pin", "2004");
    formData.set("returnTo", "/docs/convex-review");

    await expect(unlockPrivateDocs(formData)).rejects.toThrow(
      "NEXT_REDIRECT:/docs/convex-review",
    );

    expect(set).toHaveBeenCalledWith(
      PRIVATE_DOCS_COOKIE_NAME,
      "granted",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
        sameSite: "lax",
      }),
    );
  });
});
