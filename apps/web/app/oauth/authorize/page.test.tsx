import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { redirect, getOptionalSessionContext, getAuthorizationPromptForCurrentUser, approveAuthorizationForCurrentUser } = vi.hoisted(() => ({
  redirect: vi.fn((destination: string) => {
    throw new Error(`NEXT_REDIRECT:${destination}`);
  }),
  getOptionalSessionContext: vi.fn(),
  getAuthorizationPromptForCurrentUser: vi.fn(),
  approveAuthorizationForCurrentUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("@/server/auth/session", () => ({
  getOptionalSessionContext,
}));

vi.mock("@/server/domains/oauth/service", () => ({
  getAuthorizationPromptForCurrentUser,
  approveAuthorizationForCurrentUser,
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

import OAuthAuthorizePage from "./page";

describe("/oauth/authorize page", () => {
  beforeEach(() => {
    redirect.mockClear();
    getOptionalSessionContext.mockReset();
    getAuthorizationPromptForCurrentUser.mockReset();
    approveAuthorizationForCurrentUser.mockReset();
  });

  it("redirects unauthenticated users to sign in with the authorize flow as returnTo", async () => {
    getOptionalSessionContext.mockResolvedValue(null);

    await expect(
      OAuthAuthorizePage({
        searchParams: Promise.resolve({ flow: "flow-123" }),
      }),
    ).rejects.toThrow(
      `NEXT_REDIRECT:/signin?returnTo=${encodeURIComponent("/oauth/authorize?flow=flow-123")}`,
    );
  });

  it("skips the authorization screen when the session is already authorized", async () => {
    getOptionalSessionContext.mockResolvedValue({
      token: "session-token",
      context: { userId: "user-1" },
    });
    getAuthorizationPromptForCurrentUser.mockResolvedValue({
      flowId: "flow-123",
      redirectUri: "https://example.com/callback",
      state: "state-1",
      offlineAccess: false,
      requiresConsent: false,
      existingAuthorization: { id: "auth-1" },
      client: {
        name: "Partner App",
        publisherName: "Partner",
      },
      requestedScopes: [],
    });
    approveAuthorizationForCurrentUser.mockResolvedValue({
      redirectUrl: "https://example.com/callback?code=abc",
    });

    await expect(
      OAuthAuthorizePage({
        searchParams: Promise.resolve({ flow: "flow-123" }),
      }),
    ).rejects.toThrow("NEXT_REDIRECT:https://example.com/callback?code=abc");

    expect(approveAuthorizationForCurrentUser).toHaveBeenCalledWith("flow-123");
  });

  it("renders the authorization page when new consent is required", async () => {
    getOptionalSessionContext.mockResolvedValue({
      token: "session-token",
      context: { userId: "user-1" },
    });
    getAuthorizationPromptForCurrentUser.mockResolvedValue({
      flowId: "flow-123",
      redirectUri: "https://example.com/callback",
      state: "state-1",
      offlineAccess: false,
      requiresConsent: true,
      existingAuthorization: null,
      client: {
        name: "Partner App",
        publisherName: "Partner",
      },
      requestedScopes: [
        {
          id: "profile:read",
          label: "قراءة الملف",
          newlyRequested: true,
        },
      ],
    });

    const element = await OAuthAuthorizePage({
      searchParams: Promise.resolve({ flow: "flow-123" }),
    });
    const markup = renderToStaticMarkup(element);

    expect(markup).toContain("السماح لتطبيق Partner App");
    expect(markup).toContain("السماح للتطبيق");
  });
});
