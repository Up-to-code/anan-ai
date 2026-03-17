import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getWorkspaceOrganizationTeam } = vi.hoisted(() => ({
  getWorkspaceOrganizationTeam: vi.fn(),
}));

vi.mock("../../_lib/organizationTeam", () => ({
  getWorkspaceOrganizationTeam,
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

vi.mock("./_components/InviteMemberForm", () => ({
  default: () => <div>INVITE-MEMBER-FORM</div>,
}));

import WorkspaceSettingsPage from "./page";

describe("/ws/settings page", () => {
  beforeEach(() => {
    getWorkspaceOrganizationTeam.mockReset();
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
});
