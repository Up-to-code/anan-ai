import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getWorkspaceOrganizationTeam } = vi.hoisted(() => ({
  getWorkspaceOrganizationTeam: vi.fn(),
}));

vi.mock("../../../_lib/organizationTeam", () => ({
  getWorkspaceOrganizationTeam,
}));

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

import BrokerListPage from "./page";

describe("/ws/crm/brokers page", () => {
  beforeEach(() => {
    getWorkspaceOrganizationTeam.mockReset();
    getWorkspaceOrganizationTeam.mockResolvedValue({
      organization: { id: "broker-1", type: "broker", name: "Elite Brokers", slug: "elite-brokers" },
      members: [
        {
          id: "member-1",
          authUserId: "auth-1",
          membershipId: "membership-1",
          name: "سارة العتيبي",
          email: "sara@example.com",
          role: "manager",
          statusLabel: "نشط",
        },
        {
          id: "member-2",
          authUserId: "auth-2",
          membershipId: "membership-2",
          name: "أحمد علي",
          email: "ahmed@example.com",
          role: "member",
          statusLabel: "نشط",
        },
      ],
      invites: [{ id: "invite-1" }],
      authUserId: "auth-1",
    });
  });

  it("renders real organization members with shared member cards and CRM actions", async () => {
    const element = await BrokerListPage();
    const markup = renderToStaticMarkup(element);

    expect(markup).toContain("قائمة الوسطاء");
    expect(markup).toContain("Elite Brokers");
    expect(markup).toContain("سارة العتيبي");
    expect(markup).toContain("ahmed@example.com");
    expect(markup).toContain("فريق الوساطة");
    expect(markup).toContain("/ws/crm/brokers/member-2");
    expect(markup).toContain("/ws/inbox?startUserId=auth-2");
    expect(markup).toContain("هذا أنت");
  });
});
