import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import OfferDirectoryPage from "./index";

const brokerPerson = {
  id: "person-1",
  authUserId: "auth-1",
  email: "user@example.com",
  name: "سارة العتيبي",
  image: null,
  role: "broker",
  organizationName: "شركة النخبة",
  organizationSlug: "elite",
  organizationLogo: null,
  membershipState: "not-member",
  canMessage: true,
  conversationId: "conv-1",
};

const brokerOrganization = {
  id: "org-1",
  name: "وسيط النخبة",
  slug: "elite-broker",
  logo: null,
  offerCount: 5,
};

const pageOnePagination = {
  totalItems: 1,
  page: 1,
  pageCount: 1,
  hasPreviousPage: false,
  hasNextPage: false,
};

const emptyPagination = {
  ...pageOnePagination,
  totalItems: 0,
};

const baseProps = {
  title: "ملفات الوسطاء",
  description: "دليل",
  routeBase: "/ws/offers/brokers",
};

it("defaults to business persons filter", () => {
  const markup = renderToStaticMarkup(
    <OfferDirectoryPage
      {...baseProps}
      people={[brokerPerson]}
      organizations={[brokerOrganization]}
      peoplePagination={pageOnePagination}
      organizationsPagination={pageOnePagination}
    />,
  );

  expect(markup).toContain("سارة العتيبي");
  expect(markup).toContain("شركة النخبة");
  expect(markup).not.toContain("5 عروض");
});

it("renders organization cards when initialized with organization filter", () => {
  const markup = renderToStaticMarkup(
    <OfferDirectoryPage
      {...baseProps}
      people={[]}
      organizations={[brokerOrganization]}
      peoplePagination={emptyPagination}
      organizationsPagination={pageOnePagination}
      initialFilter="organizationPeople"
    />,
  );

  expect(markup).toContain("وسيط النخبة");
  expect(markup).toContain("5 عروض");
});
