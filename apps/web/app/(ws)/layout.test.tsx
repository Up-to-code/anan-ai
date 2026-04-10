import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/ConvexClientProvider", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("../_components/WebLocaleProvider", () => ({
  WebLocaleProvider: ({
    locale,
    children,
  }: {
    locale: string;
    dictionary: unknown;
    children: React.ReactNode;
  }) => <div data-slot="workspace-locale-provider" data-locale={locale}>{children}</div>,
}));

vi.mock("./ws/_lib/workspaceLocale", () => ({
  getWorkspaceLocale: vi.fn(async () => "ar"),
}));

import WorkspaceGroupLayout from "./layout";

describe("workspace group layout", () => {
  it("overrides the shared locale provider with the workspace locale", async () => {
    const element = await WorkspaceGroupLayout({
      children: <div>Body</div>,
    });
    const markup = renderToStaticMarkup(element);

    expect(markup).toContain("data-slot=\"workspace-locale-provider\"");
    expect(markup).toContain("data-slot=\"workspace-group-layout\"");
    expect(markup).toContain("min-h-dvh");
    expect(markup).toContain("data-locale=\"ar\"");
    expect(markup).toContain("Body");
  });
});
