import { requireWorkspaceData } from "../../../_lib/workspaceData";
import OfferDirectoryPage from "../OfferDirectoryPage";
import {
  OFFER_PROFILES_PAGE_SIZE,
  paginateItems,
  resolvePage,
  type OffersPageSearchParams,
} from "../offersPageData";
import {
  listCurrentOrganizationOffersCompanyDirectory,
  listCurrentOrganizationOffersDirectory,
} from "@/server/domains/auth/organizations/service";

export default async function WorkspaceOfferDeveloperProfilesRoute({
  searchParams,
}: {
  searchParams: Promise<OffersPageSearchParams>;
}) {
  await requireWorkspaceData("/ws/offers/developers");
  const [people, organizations] = await Promise.all([
    listCurrentOrganizationOffersDirectory("developer"),
    listCurrentOrganizationOffersCompanyDirectory("developer"),
  ]);
  const page = resolvePage(await searchParams);
  const paginatedPeople = paginateItems(people, page, OFFER_PROFILES_PAGE_SIZE);
  const paginatedOrganizations = paginateItems(organizations, page, OFFER_PROFILES_PAGE_SIZE);

  return (
    <OfferDirectoryPage
      title="ملفات المطورين"
      description="دليل المطورين الظاهرين داخل عنان، مع إمكانية استعراض عروضهم ومشاريعهم المنشورة."
      people={paginatedPeople.items}
      organizations={paginatedOrganizations.items}
      peoplePagination={{
        totalItems: paginatedPeople.totalItems,
        page: paginatedPeople.page,
        pageCount: paginatedPeople.pageCount,
        hasPreviousPage: paginatedPeople.hasPreviousPage,
        hasNextPage: paginatedPeople.hasNextPage,
      }}
      organizationsPagination={{
        totalItems: paginatedOrganizations.totalItems,
        page: paginatedOrganizations.page,
        pageCount: paginatedOrganizations.pageCount,
        hasPreviousPage: paginatedOrganizations.hasPreviousPage,
        hasNextPage: paginatedOrganizations.hasNextPage,
      }}
      routeBase="/ws/offers/developers"
    />
  );
}
