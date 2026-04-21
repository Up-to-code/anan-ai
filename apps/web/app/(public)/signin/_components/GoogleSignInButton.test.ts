import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveBrowserCallbackUrl } from "./GoogleSignInButton";

describe("resolveBrowserCallbackUrl", () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    if (originalWindow) {
      vi.stubGlobal("window", originalWindow);
    } else {
      vi.unstubAllGlobals();
    }
  });

  it("resolves app-relative paths against the current browser origin", () => {
    vi.stubGlobal("window", {
      location: {
        origin: "https://anan-lit-web.vercel.app",
      },
    });

    expect(resolveBrowserCallbackUrl("/ws")).toBe("https://anan-lit-web.vercel.app/ws");
  });

  it("preserves absolute callback urls", () => {
    vi.stubGlobal("window", {
      location: {
        origin: "https://anan-lit-web.vercel.app",
      },
    });

    expect(resolveBrowserCallbackUrl("https://anan-lit-web.vercel.app/signin")).toBe(
      "https://anan-lit-web.vercel.app/signin",
    );
  });

  it("falls back to the raw value during server rendering", () => {
    vi.unstubAllGlobals();

    expect(resolveBrowserCallbackUrl("/ws")).toBe("/ws");
  });
});
