import { buildOverviewCommandCenterViewModel } from "@/admin_zone/viewModels/commandCenter";
import { requireAdminPageSession } from "@/lib/serverSession";
import {
  type AdminCommandCenterRange,
  convexAdminCommandCenterRepository,
} from "@/server/infrastructure/convex/adminCommandCenterRepository";
import OverviewPageClient from "./OverviewPageClient";

type OverviewPageProps = {
  range?: AdminCommandCenterRange;
};

/**
 * WHY:   The admin overview route should expose one live command-center model instead of composing backend DTOs directly inside JSX.
 * WHAT:  Loads the overview, commercial, and queue-health read models for the selected time range.
 * HOW:   Resolves the authenticated session once, fetches the live command-center queries in parallel, and maps them into a page-ready view model.
 */
export default async function OverviewPage({ range = "30d" }: OverviewPageProps) {
  const session = await requireAdminPageSession("/overview");
  const [overview, commercial, queue] = await Promise.all([
    convexAdminCommandCenterRepository.getOverview(session.token, range),
    convexAdminCommandCenterRepository.getCommercialAnalytics(session.token, range),
    convexAdminCommandCenterRepository.getQueueHealthAnalytics(session.token, range),
  ]);
  const viewModel = buildOverviewCommandCenterViewModel({
    range,
    overview,
    commercial,
    queue,
  });

  return <OverviewPageClient viewModel={viewModel} />;
}
