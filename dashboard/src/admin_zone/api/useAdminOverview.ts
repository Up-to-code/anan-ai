import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

/**
 * WHY:   Powers the high-level metrics dashboard for the Admin Zone landing page.
 * WHAT:  Fetches aggregated platform statistics (total users, active brokers, etc.).
 * HOW:   Uses a single `useQuery` to fetch the pre-calculated stats from Convex.
 */
export function useAdminOverview() {
    const stats = useQuery(api.admin_zone.overview.overviewStats);

    return {
        stats,
        isLoading: stats === undefined,
    };
}
