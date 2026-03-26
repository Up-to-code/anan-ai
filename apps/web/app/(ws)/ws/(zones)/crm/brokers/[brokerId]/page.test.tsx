import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getWorkspaceOrganizationTeam } = vi.hoisted(() => ({
  getWorkspaceOrganizationTeam: vi.fn(),
}));
const { notFound } = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
}));

vi.mock("../../../../_lib/organizationTeam", () => ({
  getWorkspaceOrganizationTeam,
}));

vi.mock("next/navigation", () => ({
  notFound,
}));

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

import BrokerDetailPage from "./page";

describe("/ws/crm/brokers/[brokerId] page", () => {
  beforeEach(() => {
    getWorkspaceOrganizationTeam.mockReset();
    notFound.mockClear();
    getWorkspaceOrganizationTeam.mockResolvedValue({
      organization: { id: "red-1", type: "red", name: "Palm Hills", slug: "palm-hills" },
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
      ],
      invites: [
        {
          id: "invite-1",
          email: "sara@example.com",
          role: "manager",
          status: "pending",
          expiresLabel: "01/01/2026",
        },
      ],
      authUserId: "auth-2",
    });
  });

  it("renders the shared member summary card plus invite details", async () => {
    const element = await BrokerDetailPage({ params: Promise.resolve({ brokerId: "member-1" }) });
    const markup = renderToStaticMarkup(element);

    expect(markup).toContain("سارة العتيبي");
    expect(markup).toContain("Palm Hills");
    expect(markup).toContain("فريق التطوير");
    expect(markup).toContain("/ws/inbox?startUserId=auth-1");
    expect(markup).toContain("الدعوات (1)");
    expect(markup).toContain("01/01/2026");
  });

  it("calls notFound when the member does not exist", async () => {
    await expect(
      BrokerDetailPage({ params: Promise.resolve({ brokerId: "missing-member" }) }),
    ).rejects.toThrow("NOT_FOUND");
    expect(notFound).toHaveBeenCalledTimes(1);
  });
});
