import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const { getWorkspaceOrganizationTeam } = vi.hoisted(() => ({
  getWorkspaceOrganizationTeam: vi.fn(),
}));
const { listCurrentOrganizationApiKeysForCurrentUser } = vi.hoisted(() => ({
  listCurrentOrganizationApiKeysForCurrentUser: vi.fn(),
}));

vi.mock("../../_lib/organizationTeam", () => ({
  getWorkspaceOrganizationTeam,
}));
vi.mock("@/server/domains/auth/organizationApiKeys/service", () => ({
  listCurrentOrganizationApiKeysForCurrentUser,
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
  default: () => <div>MEMBERS-WORKSPACE</div>,
}));
vi.mock("./_components/ApiKeysWorkspace", () => ({
  default: () => <div>API-KEYS-WORKSPACE</div>,
}));

vi.mock("./_components/InviteMemberForm", () => ({
  default: () => <div>INVITE-MEMBER-FORM</div>,
}));

import WorkspaceSettingsPage from "./page";

beforeEach(() => {
  getWorkspaceOrganizationTeam.mockReset();
  listCurrentOrganizationApiKeysForCurrentUser.mockReset();
  getWorkspaceOrganizationTeam.mockResolvedValue({
    organization: { name: "منظمة ألف", slug: "alpha", status: "active" },
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
  });
  listCurrentOrganizationApiKeysForCurrentUser.mockResolvedValue([]);
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

  expect(markup).toContain("MEMBERS-WORKSPACE");
  expect(markup).toContain("INVITE-MEMBER-FORM");
  expect(markup).not.toContain("ORG-WORKSPACE");
});

it("renders api keys tab content when tab is api-keys", async () => {
  const element = await WorkspaceSettingsPage({ searchParams: Promise.resolve({ tab: "api-keys" }) });
  const markup = renderToStaticMarkup(element);

  expect(markup).toContain("API-KEYS-WORKSPACE");
  expect(markup).not.toContain("ORG-WORKSPACE");
  expect(markup).not.toContain("MEMBERS-WORKSPACE");
  expect(listCurrentOrganizationApiKeysForCurrentUser).toHaveBeenCalledTimes(1);
});
