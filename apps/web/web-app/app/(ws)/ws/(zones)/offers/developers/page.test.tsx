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
  requireWorkspaceData: vi.fn(async () => ({ audience: "developer", ownerContext: null })),
}));

vi.mock("@/server/domains/organizations/service", () => ({
  listCurrentOrganizationOffersDirectory,
}));

import WorkspaceOfferDeveloperProfilesRoute from "./page";

describe("/ws/offers/developers page", () => {
  it("renders the developer directory cards from the shared organization directory", async () => {
    listCurrentOrganizationOffersDirectory.mockResolvedValue([
      {
        id: "profile-2",
        authUserId: "auth-2",
        email: "developer@example.com",
        name: "سارة المطورة",
        username: "sara.dev",
        role: "developer" as const,
        organizationName: "شركة الواحة للتطوير",
        organizationSlug: "oasis-dev",
        membershipState: "pending-invite" as const,
        canMessage: true,
        conversationId: "conv-1",
      },
    ]);

    const element = await WorkspaceOfferDeveloperProfilesRoute({
      searchParams: Promise.resolve({}),
    });
    const markup = renderToStaticMarkup(element);

    expect(listCurrentOrganizationOffersDirectory).toHaveBeenCalledWith("developer");
    expect(markup).toContain("ملفات المطورين");
    expect(markup).toContain("سارة المطورة");
    expect(markup).toContain("شركة الواحة للتطوير");
  });
});
