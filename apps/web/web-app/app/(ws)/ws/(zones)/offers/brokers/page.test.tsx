import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { listCurrentOrganizationOffersDirectory } = vi.hoisted(() => ({
  listCurrentOrganizationOffersDirectory: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("../../../_lib/workspaceData", () => ({
  requireWorkspaceData: vi.fn(async () => ({ audience: "broker", ownerContext: null })),
}));

vi.mock("@/server/domains/organizations/service", () => ({
  listCurrentOrganizationOffersDirectory,
}));

import WorkspaceOfferBrokerProfilesRoute from "./page";

describe("/ws/offers/brokers page", () => {
  it("renders the broker directory cards from the shared organization directory", async () => {
    listCurrentOrganizationOffersDirectory.mockResolvedValue([
      {
        id: "profile-1",
        authUserId: "auth-1",
        email: "khaled@example.com",
        name: "خالد العتيبي",
        username: "khaled",
        role: "broker" as const,
        organizationName: "وسيط النخبة",
        organizationSlug: "elite-broker",
        membershipState: "not-member" as const,
        canMessage: true,
        conversationId: null,
      },
    ]);

    const element = await WorkspaceOfferBrokerProfilesRoute({
      searchParams: Promise.resolve({}),
    });
    const markup = renderToStaticMarkup(element);

    expect(listCurrentOrganizationOffersDirectory).toHaveBeenCalledWith("broker");
    expect(markup).toContain("ملفات الوسطاء");
    expect(markup).toContain("خالد العتيبي");
    expect(markup).toContain("وسيط النخبة");
  });
});
