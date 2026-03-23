import { describe, expect, it, vi } from "vitest";

const { redirect } = vi.hoisted(() => ({
  redirect: vi.fn((target: string) => {
    throw new Error(`NEXT_REDIRECT:${target}`);
  }),
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

import DocsIndexPage from "./page";

describe("docs index page", () => {
  it("redirects /docs to the handbook overview", () => {
    expect(() => DocsIndexPage()).toThrow("NEXT_REDIRECT:/docs/overview");
  });
});
