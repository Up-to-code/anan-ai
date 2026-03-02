import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

/**
 * WHY:   Provides the central list of real estate professionals (Brokers and REDs) for admin management.
 * WHAT:  Fetches two separate lists (brokers and REDs) in parallel.
 * HOW:   Uses shared_logic dashboard queries since this data is globally shared across zones.
 */
export function useAdminBrokers() {
    const brokers = useQuery(api.shared_logic.dashboard.queries.listBrokers);
    const reds = useQuery(api.shared_logic.dashboard.queries.listREDs);
    return {
        brokers,
        reds,
        isLoadingBrokers: brokers === undefined,
        isLoadingREDs: reds === undefined,
    };
}
