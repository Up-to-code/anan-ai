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

import DocsLayout from "./layout";

describe("private docs layout", () => {
  beforeEach(() => {
    cookies.mockReset();
    redirect.mockClear();
  });

  it("redirects locked requests back to the unlock page", async () => {
    cookies.mockResolvedValue({ get: vi.fn(() => undefined) });

    await expect(
      DocsLayout({
        children: <div>audit</div>,
      }),
    ).rejects.toThrow("NEXT_REDIRECT:/?returnTo=%2Fdocs%2Foverview");
  });

  it("renders the docs shell when the access cookie is present", async () => {
    cookies.mockResolvedValue({
      get: vi.fn(() => ({ value: "granted" })),
    });

    const result = await DocsLayout({
      children: <div>audit</div>,
    });

    expect(result).toBeTruthy();
  });
});
