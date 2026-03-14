import { requireWorkspaceData } from "../../../_lib/workspaceData";
import OfferDirectoryPage from "../OfferDirectoryPage";
import {
  OFFER_PROFILES_PAGE_SIZE,
  paginateItems,
  resolvePage,
  type OffersPageSearchParams,
} from "../offersPageData";
import { listCurrentOrganizationOffersDirectory } from "@/server/domains/organizations/service";


/**
 * WHY:   Offer collaboration also needs a developer directory that is broader than existing offer activity.
 * WHAT:  Lists visible developer accounts from the workspace directory and renders them as a paginated route.
 * HOW:   Loads the organization-scoped offers directory through the shared organizations service and paginates it server-side.
 */
export default async function WorkspaceOfferDeveloperProfilesRoute({
  searchParams,
}: {
  searchParams: Promise<OffersPageSearchParams>;
}) {
  await requireWorkspaceData("/ws/offers/developers");
  const profiles = await listCurrentOrganizationOffersDirectory("developer");
  const page = resolvePage(await searchParams);
  const paginatedProfiles = paginateItems(profiles, page, OFFER_PROFILES_PAGE_SIZE);

  return (
    <OfferDirectoryPage
      title="ملفات المطورين"
      description="دليل المطورين الظاهرين داخل أنان، مع إجراءات سريعة لإرسال دعوة تعاون أو بدء محادثة مباشرة."
      profiles={paginatedProfiles.items}
      totalItems={paginatedProfiles.totalItems}
      page={paginatedProfiles.page}
      pageCount={paginatedProfiles.pageCount}
      hasPreviousPage={paginatedProfiles.hasPreviousPage}
      hasNextPage={paginatedProfiles.hasNextPage}
      routeBase="/ws/offers/developers"
    />
  );
}
