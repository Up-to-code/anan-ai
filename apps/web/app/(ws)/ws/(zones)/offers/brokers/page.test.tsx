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
  requireWorkspaceData: vi.fn(async () => ({ audience: "broker", ownerContext: null })),
}));

vi.mock("@/server/domains/auth/organizations/service", () => ({
  listCurrentOrganizationOffersCompanyDirectory,
  listCurrentOrganizationOffersDirectory,
}));

import WorkspaceOfferBrokerProfilesRoute from "./page";

it("renders broker people cards by default and includes the entity filters", async () => {
  listCurrentOrganizationOffersDirectory.mockResolvedValue([
    {
      id: "person-1",
      authUserId: "auth-1",
      email: "broker@example.com",
      name: "سارة العتيبي",
      image: null,
      role: "broker",
      organizationName: "وسيط النخبة",
      organizationSlug: "elite-broker",
      organizationLogo: null,
      membershipState: "not-member",
      canMessage: true,
      conversationId: "conv-1",
    },
  ]);
  listCurrentOrganizationOffersCompanyDirectory.mockResolvedValue([
    {
      id: "org-1",
      name: "وسيط النخبة",
      slug: "elite-broker",
      logo: null,
      offerCount: 5,
    },
  ]);

  const component = await WorkspaceOfferBrokerProfilesRoute({
    searchParams: Promise.resolve({}),
  });
  const markup = renderToStaticMarkup(component);

  expect(listCurrentOrganizationOffersDirectory).toHaveBeenCalledWith("broker");
  expect(listCurrentOrganizationOffersCompanyDirectory).toHaveBeenCalledWith("broker");
  expect(markup).toContain("ملفات الوسطاء");
  expect(markup).toContain("Business persons");
  expect(markup).toContain("People in companies or organizations");
  expect(markup).toContain("سارة العتيبي");
  expect(markup).toContain("وسيط النخبة");
});
