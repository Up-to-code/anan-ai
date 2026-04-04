import {
  overviewChartByRange,
  overviewMetricsByRange,
  overviewModelConsumption,
  overviewOfferQueueMix,
  overviewPartnerMix,
  overviewUserRoleDistribution,
  overviewVerificationPressure,
  queueItems,
  recentActivities,
} from "@/admin_zone/mocks/data";
import type { AdminRange } from "@/admin_zone/mocks/types";
import OverviewPageClient from "./OverviewPageClient";

type OverviewPageProps = {
  range?: AdminRange;
};

/**
 * WHY:   The admin overview route should stay thin while still exposing all mocked dashboard data in one place.
 * WHAT:  Loads the mocked overview payload and delegates rendering to the client page module.
 * HOW:   Selects the active time range and passes the matching metrics and chart points into the client surface.
 */
export default function OverviewPage({ range = "30d" }: OverviewPageProps) {
  return (
    <OverviewPageClient
      range={range}
      metrics={overviewMetricsByRange[range]}
      chart={overviewChartByRange[range]}
      activities={recentActivities}
      queue={queueItems}
      partnerMix={overviewPartnerMix}
      verificationPressure={overviewVerificationPressure}
      offerQueueMix={overviewOfferQueueMix}
      userRoleDistribution={overviewUserRoleDistribution}
      models={overviewModelConsumption}
    />
  );
}
