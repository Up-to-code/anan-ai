import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const { getWorkspaceOrganizationTeam } = vi.hoisted(() => ({
  getWorkspaceOrganizationTeam: vi.fn(),
}));
const { listCurrentOrganizationApiKeysForCurrentUser } = vi.hoisted(() => ({
  listCurrentOrganizationApiKeysForCurrentUser: vi.fn(),
}));
const { getComplianceRulesetForCurrentOrg } = vi.hoisted(() => ({
  getComplianceRulesetForCurrentOrg: vi.fn(),
}));

vi.mock("../../_lib/organizationTeam", () => ({
  getWorkspaceOrganizationTeam,
}));
vi.mock("@/server/domains/auth/organizationApiKeys/service", () => ({
  listCurrentOrganizationApiKeysForCurrentUser,
}));
vi.mock("@/server/domains/compliance/service", () => ({
  getComplianceRulesetForCurrentOrg,
}));

vi.mock("./_components/SettingsHeader", () => ({
  default: ({ title, description }: { title: string; description: string }) => (
    <header>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  ),
}));

vi.mock("./_components/SettingsTabs", () => ({
  default: ({ tabs }: { tabs: Array<{ key: string; label: string }> }) => (
    <div>{`TABS:${tabs.map((tab) => tab.key).join(",")}`}</div>
  ),
}));

vi.mock("./_components/SettingsSummary", () => ({
  default: ({ items }: { items: Array<{ label: string; value: string | number }> }) => (
    <div>{`SUMMARY:${items.map((item) => `${item.label}:${item.value}`).join("|")}`}</div>
  ),
}));

vi.mock("./_components/OrganizationSettingsWorkspace", () => ({
  default: () => <div>ORG-WORKSPACE</div>,
}));

vi.mock("./_components/MembersWorkspace", () => ({
  default: ({
    initialMembers,
    invites,
    canManage,
    organizationType,
  }: {
    initialMembers: Array<unknown>;
    invites: Array<unknown>;
    canManage: boolean;
    organizationType?: string;
  }) => <div>{`MEMBERS-WORKSPACE:${initialMembers.length}:${invites.length}:${canManage}:${organizationType ?? "none"}`}</div>,
}));
vi.mock("./_components/ApiKeysWorkspace", () => ({
  default: ({ canCreate, canRevoke, canView }: { canCreate: boolean; canRevoke: boolean; canView: boolean }) => (
    <div>{`API-KEYS-WORKSPACE:${canCreate}:${canRevoke}:${canView}`}</div>
  ),
}));
vi.mock("./_components/OrganizationVerificationWorkspace", () => ({
  default: ({
    organization,
    canManage,
    membersCount,
    invitesCount,
  }: {
    organization: { verificationSummary?: { currentRequestStatus?: string } } | null;
    canManage: boolean;
    membersCount: number;
    invitesCount: number;
  }) => (
    <div>{`VERIFICATION-WORKSPACE:${organization?.verificationSummary?.currentRequestStatus ?? "none"}:${canManage}:${membersCount}:${invitesCount}`}</div>
  ),
}));

import WorkspaceSettingsPage from "./page";

beforeEach(() => {
  getWorkspaceOrganizationTeam.mockReset();
  listCurrentOrganizationApiKeysForCurrentUser.mockReset();
  getWorkspaceOrganizationTeam.mockResolvedValue({
    organization: {
      name: "منظمة ألف",
      slug: "alpha",
      status: "active",
      type: "broker",
      verificationSummary: {
        isVerified: false,
        currentRequestId: "request-1",
        currentRequestStatus: "in_review",
        lastSubmittedAt: 1,
        lastReviewedAt: null,
        reviewerNotes: null,
        documentsCount: 2,
        publishingBlocked: true,
        attachedDocuments: [],
        requirements: [],
        sourceUrls: [],
      },
    },
    members: [
      {
        id: "member-1",
        authUserId: "auth-1",
        membershipId: "membership-1",
        name: "سارة",
        email: "sara@example.com",
        role: "manager",
        statusLabel: "نشط",
      },
    ],
    invites: [
      {
        id: "invite-1",
        email: "new@example.com",
        role: "member",
        status: "pending",
        expiresLabel: "01/01/2026",
      },
    ],
    currentMembershipRole: "manager",
    currentTenantRole: "owner",
  });
  listCurrentOrganizationApiKeysForCurrentUser.mockResolvedValue([]);
  getComplianceRulesetForCurrentOrg.mockResolvedValue(null);
});

it("defaults to the organization tab when tab is missing", async () => {
  const element = await WorkspaceSettingsPage({ searchParams: Promise.resolve({}) });
  const markup = renderToStaticMarkup(element);

  expect(markup).toContain("ORG-WORKSPACE");
  expect(markup).not.toContain("MEMBERS-WORKSPACE");
});

it("falls back to organization tab when tab is invalid", async () => {
  const element = await WorkspaceSettingsPage({ searchParams: Promise.resolve({ tab: "invalid-tab" }) });
  const markup = renderToStaticMarkup(element);

  expect(markup).toContain("ORG-WORKSPACE");
  expect(markup).not.toContain("MEMBERS-WORKSPACE");
});

it("renders members tab content when tab is members", async () => {
  const element = await WorkspaceSettingsPage({ searchParams: Promise.resolve({ tab: "members" }) });
  const markup = renderToStaticMarkup(element);

  expect(markup).toContain("MEMBERS-WORKSPACE:1:1:true:broker");
  expect(markup).not.toContain("ORG-WORKSPACE");
});

it("renders api keys tab content when tab is api-keys", async () => {
  const element = await WorkspaceSettingsPage({ searchParams: Promise.resolve({ tab: "api-keys" }) });
  const markup = renderToStaticMarkup(element);

  expect(markup).toContain("API-KEYS-WORKSPACE:true:true:true");
  expect(markup).not.toContain("ORG-WORKSPACE");
  expect(markup).not.toContain("MEMBERS-WORKSPACE");
  expect(listCurrentOrganizationApiKeysForCurrentUser).toHaveBeenCalledTimes(1);
});

it("renders api keys as view-and-revoke only for managers who are not tenant owners", async () => {
  getWorkspaceOrganizationTeam.mockResolvedValue({
    organization: {
      name: "منظمة ألف",
      slug: "alpha",
      status: "active",
      type: "broker",
    },
    members: [],
    invites: [],
    currentMembershipRole: "manager",
    currentTenantRole: "admin",
  });

  const element = await WorkspaceSettingsPage({ searchParams: Promise.resolve({ tab: "api-keys" }) });
  const markup = renderToStaticMarkup(element);

  expect(markup).toContain("API-KEYS-WORKSPACE:false:true:true");
  expect(listCurrentOrganizationApiKeysForCurrentUser).toHaveBeenCalledTimes(1);
});

it("renders verification tab content when tab is verification", async () => {
  const element = await WorkspaceSettingsPage({ searchParams: Promise.resolve({ tab: "verification" }) });
  const markup = renderToStaticMarkup(element);

  expect(markup).toContain("VERIFICATION-WORKSPACE:in_review:true:1:1");
  expect(markup).not.toContain("ORG-WORKSPACE");
  expect(markup).not.toContain("MEMBERS-WORKSPACE");
  expect(getComplianceRulesetForCurrentOrg).toHaveBeenCalled();
});
