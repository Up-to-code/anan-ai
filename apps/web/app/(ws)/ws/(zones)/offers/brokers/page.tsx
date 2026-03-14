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
 * WHY:   The offers workspace needs a broker-focused partner directory, not just profiles derived from existing offers.
 * WHAT:  Lists visible broker accounts from the workspace directory and renders them as a paginated route.
 * HOW:   Loads the organization-scoped offers directory through the shared organizations service and paginates it server-side.
 */
export default async function WorkspaceOfferBrokerProfilesRoute({
  searchParams,
}: {
  searchParams: Promise<OffersPageSearchParams>;
}) {
  await requireWorkspaceData("/ws/offers/brokers");
  const profiles = await listCurrentOrganizationOffersDirectory("broker");
  const page = resolvePage(await searchParams);
  const paginatedProfiles = paginateItems(profiles, page, OFFER_PROFILES_PAGE_SIZE);

  return (
    <OfferDirectoryPage
      title="ملفات الوسطاء"
      description="دليل الوسطاء الظاهرين داخل أنان، مع إمكانية فتح محادثة مباشرة أو إرسال دعوة تعاون من نفس الصفحة."
      profiles={paginatedProfiles.items}
      totalItems={paginatedProfiles.totalItems}
      page={paginatedProfiles.page}
      pageCount={paginatedProfiles.pageCount}
      hasPreviousPage={paginatedProfiles.hasPreviousPage}
      hasNextPage={paginatedProfiles.hasNextPage}
      routeBase="/ws/offers/brokers"
    />
  );
}
