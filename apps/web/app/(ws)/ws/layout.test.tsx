import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@convex-dev/auth/nextjs/server", () => ({
  ConvexAuthNextjsServerProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/app/ConvexClientProvider", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import WorkspaceRootLayout from "./layout";

describe("workspace root layout", () => {
  it("leaves shell selection to nested route groups", async () => {
    const element = await WorkspaceRootLayout({
      children: <div>Body</div>,
    });
    const markup = renderToStaticMarkup(
      element,
    );

    expect(markup).toContain("Body");
    expect(markup).not.toContain("workspace-shell");
  });
});
