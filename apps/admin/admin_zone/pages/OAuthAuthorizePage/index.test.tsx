import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const { redirect } = vi.hoisted(() => ({
  redirect: vi.fn((destination: string) => {
    throw new Error(`NEXT_REDIRECT:${destination}`);
  }),
}));

const { getOAuthAuthorizePageData, approveOAuthAuthorization } = vi.hoisted(() => ({
  getOAuthAuthorizePageData: vi.fn(),
  approveOAuthAuthorization: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("@/admin_zone/api/oauth", () => ({
  getOAuthAuthorizePageData,
  approveOAuthAuthorization,
}));

vi.mock("@/components/oauth/ConsentAutoSubmit", () => ({
  default: ({
    children,
    approveLabel,
  }: {
    children?: React.ReactNode;
    approveLabel: string;
  }) => <form><span>{approveLabel}</span>{children}</form>,
}));

vi.mock("@/components/shared/AdminShell", () => ({
  default: ({ children }: { children?: React.ReactNode }) => <div data-testid="admin-shell">{children}</div>,
}));

vi.mock("@/components/shared/PageHero", () => ({
  default: ({
    title,
    description,
  }: {
    title: string;
    description?: React.ReactNode;
  }) => (
    <div>
      <h1>{title}</h1>
      <div>{description}</div>
    </div>
  ),
}));

vi.mock("@/components/shared/Section", () => ({
  default: ({ children }: { children?: React.ReactNode }) => <section>{children}</section>,
}));

import OAuthAuthorizePage from "./index";

beforeEach(() => {
  redirect.mockClear();
  getOAuthAuthorizePageData.mockReset();
  approveOAuthAuthorization.mockReset();
});

it("redirects to sign-in when flow is missing", async () => {
  await expect(OAuthAuthorizePage({ flow: null })).rejects.toThrow("NEXT_REDIRECT:/signin");
});

it("skips the authorization screen when the session is already authorized", async () => {
  getOAuthAuthorizePageData.mockResolvedValue({
    session: { user: { id: "admin-1" } },
    preview: {
      flowId: "flow-123",
      redirectUri: "https://example.com/callback",
      state: "state-1",
      offlineAccess: false,
      requiresConsent: false,
      existingAuthorization: { id: "auth-1" },
      client: { name: "Partner App", publisherName: "Partner" },
      requestedScopes: [],
    },
  });
  approveOAuthAuthorization.mockResolvedValue({
    redirectUrl: "https://example.com/callback?code=abc",
  });

  await expect(OAuthAuthorizePage({ flow: "flow-123" })).rejects.toThrow(
    "NEXT_REDIRECT:https://example.com/callback?code=abc",
  );

  expect(approveOAuthAuthorization).toHaveBeenCalledWith("flow-123");
});

it("renders the authorization page when new consent is required", async () => {
  getOAuthAuthorizePageData.mockResolvedValue({
    session: { user: { id: "admin-1" } },
    preview: {
      flowId: "flow-123",
      redirectUri: "https://example.com/callback",
      state: "state-1",
      offlineAccess: false,
      requiresConsent: true,
      existingAuthorization: null,
      client: { name: "Partner App", publisherName: "Partner" },
      requestedScopes: [
        { id: "profile:read", label: "قراءة الملف", newlyRequested: true },
      ],
    },
  });

  const element = await OAuthAuthorizePage({ flow: "flow-123" });
  const markup = renderToStaticMarkup(element);

  expect(markup).toContain("data-testid=\"admin-shell\"");
  expect(markup).toContain("السماح لتطبيق Partner App");
  expect(markup).toContain("السماح للتطبيق");
});
