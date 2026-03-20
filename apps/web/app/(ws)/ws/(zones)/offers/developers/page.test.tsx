import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";

const { listCurrentOrganizationOffersCompanyDirectory, listCurrentOrganizationOffersDirectory } = vi.hoisted(() => ({
  listCurrentOrganizationOffersCompanyDirectory: vi.fn(),
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
  listCurrentOrganizationOffersCompanyDirectory,
  listCurrentOrganizationOffersDirectory,
}));

import WorkspaceOfferDeveloperProfilesRoute from "./page";

it("renders developer people cards by default and includes the entity filters", async () => {
  listCurrentOrganizationOffersDirectory.mockResolvedValue([
    {
      id: "person-2",
      authUserId: "auth-2",
      email: "dev@example.com",
      name: "محمود سالم",
      image: null,
      role: "developer",
      organizationName: "شركة الواحة للتطوير",
      organizationSlug: "oasis-dev",
      organizationLogo: null,
      membershipState: "not-member",
      canMessage: true,
      conversationId: "conv-2",
    },
  ]);
  listCurrentOrganizationOffersCompanyDirectory.mockResolvedValue([
    {
      id: "org-2",
      name: "شركة الواحة للتطوير",
      slug: "oasis-dev",
      logo: null,
      offerCount: 12,
    },
  ]);

  const component = await WorkspaceOfferDeveloperProfilesRoute({
    searchParams: Promise.resolve({}),
  });
  const markup = renderToStaticMarkup(component);

  expect(listCurrentOrganizationOffersDirectory).toHaveBeenCalledWith("developer");
  expect(listCurrentOrganizationOffersCompanyDirectory).toHaveBeenCalledWith("developer");
  expect(markup).toContain("ملفات المطورين");
  expect(markup).toContain("Business persons");
  expect(markup).toContain("People in companies or organizations");
  expect(markup).toContain("محمود سالم");
  expect(markup).toContain("شركة الواحة للتطوير");
});
