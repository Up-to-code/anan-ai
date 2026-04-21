import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

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

vi.mock("@/server/domains/auth/oauth/service", () => ({
  getAuthorizationPromptForCurrentUser,
  approveAuthorizationForCurrentUser,
}));

vi.mock("./_components/ConsentAutoSubmit", () => ({
  default: ({
    children,
    approveLabel,
  }: {
    children?: React.ReactNode;
    approveLabel: string;
  }) => <form><span>{approveLabel}</span>{children}</form>,
}));

vi.mock("@/app/(public)/public", () => ({
  PageHero: ({
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
  Section: ({ children }: { children?: React.ReactNode }) => <section>{children}</section>,
}));

import OAuthAuthorizePage from "./page";

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
    organizations: [
      {
        tenantOrgId: "tenant-1",
        ownerType: "broker",
        ownerId: "broker-1",
        organizationType: "broker",
        organizationName: "Alpha Brokers",
        organizationSlug: "alpha",
        role: "manager",
      },
    ],
    selectedTenantOrgId: "tenant-1",
    selectedOrganization: {
      tenantOrgId: "tenant-1",
      ownerType: "broker",
      ownerId: "broker-1",
      organizationType: "broker",
      organizationName: "Alpha Brokers",
      organizationSlug: "alpha",
      role: "manager",
    },
    requiresOrganizationSelection: false,
    canApproveSelectedOrganization: true,
    managerApprovalRequired: false,
    approvalDisabledReason: null,
    requiresConsent: false,
    existingAuthorization: { tenantOrgId: "tenant-1", organizationName: "Alpha Brokers", grantedScopes: [], createdAt: 1, updatedAt: 1, lastUsedAt: null },
    client: {
      clientId: "client-1",
      name: "Partner App",
      publisherName: "Partner",
    },
    user: {},
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

  expect(approveAuthorizationForCurrentUser).toHaveBeenCalledWith("flow-123", "tenant-1");
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
    organizations: [
      {
        tenantOrgId: "tenant-1",
        ownerType: "broker",
        ownerId: "broker-1",
        organizationType: "broker",
        organizationName: "Alpha Brokers",
        organizationSlug: "alpha",
        role: "manager",
      },
    ],
    selectedTenantOrgId: "tenant-1",
    selectedOrganization: {
      tenantOrgId: "tenant-1",
      ownerType: "broker",
      ownerId: "broker-1",
      organizationType: "broker",
      organizationName: "Alpha Brokers",
      organizationSlug: "alpha",
      role: "manager",
    },
    requiresOrganizationSelection: false,
    canApproveSelectedOrganization: true,
    managerApprovalRequired: false,
    approvalDisabledReason: null,
    requiresConsent: true,
    existingAuthorization: null,
    client: {
      clientId: "client-1",
      name: "Partner App",
      publisherName: "Partner",
    },
    user: {},
    requestedScopes: [
      {
        id: "clients:read_own",
        label: "Read clients",
        newlyRequested: true,
      },
    ],
  });

  const element = await OAuthAuthorizePage({
    searchParams: Promise.resolve({ flow: "flow-123" }),
  });
  const markup = renderToStaticMarkup(element);

  expect(markup).toContain("السماح لتطبيق Partner App");
  expect(markup).toContain("الموافقة وربط التطبيق");
  expect(markup).toContain("name=\"flowId\"");
  expect(markup).toContain("name=\"tenantOrgId\"");
  expect(markup).toContain("Alpha Brokers");
});

it("renders organization choices when the user belongs to multiple orgs", async () => {
  getOptionalSessionContext.mockResolvedValue({
    token: "session-token",
    context: { userId: "user-1" },
  });
  getAuthorizationPromptForCurrentUser.mockResolvedValue({
    flowId: "flow-123",
    redirectUri: "https://example.com/callback",
    state: "state-1",
    offlineAccess: false,
    organizations: [
      {
        tenantOrgId: "tenant-1",
        ownerType: "broker",
        ownerId: "broker-1",
        organizationType: "broker",
        organizationName: "Alpha Brokers",
        organizationSlug: "alpha",
        role: "manager",
      },
      {
        tenantOrgId: "tenant-2",
        ownerType: "RED",
        ownerId: "red-1",
        organizationType: "red",
        organizationName: "Beta Development",
        organizationSlug: "beta",
        role: "member",
      },
    ],
    selectedTenantOrgId: null,
    selectedOrganization: null,
    requiresOrganizationSelection: true,
    canApproveSelectedOrganization: false,
    managerApprovalRequired: false,
    approvalDisabledReason: "Choose an organization to continue.",
    requiresConsent: true,
    existingAuthorization: null,
    client: {
      clientId: "client-1",
      name: "Partner App",
      publisherName: "Partner",
    },
    user: {},
    requestedScopes: [],
  });

  const element = await OAuthAuthorizePage({
    searchParams: Promise.resolve({ flow: "flow-123" }),
  });
  const markup = renderToStaticMarkup(element);

  expect(markup).toContain("Alpha Brokers");
  expect(markup).toContain("Beta Development");
  expect(markup).toContain("/oauth/authorize?flow=flow-123&amp;org=tenant-1");
  expect(markup).toContain("/oauth/authorize?flow=flow-123&amp;org=tenant-2");
});
