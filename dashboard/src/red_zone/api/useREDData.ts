import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useRole } from "@/_core/hooks/useRole";
import { useConvexBootstrapState } from "@/_core/hooks/useConvexBootstrapState";

// ─── RED Overview ───────────────────────────────────────
/**
 * WHY:   Powers the high-level metrics dashboard for the Developer (RED) Zone landing page.
 * WHAT:  Fetches aggregated developer statistics (active projects, broker engagement).
 * HOW:   Uses a single `useQuery` to fetch from `red_zone.overview.overviewStats`.
 */
export function useREDOverview() {
    const stats = useQuery(api.red_zone.overview.overviewStats);
    return { stats, isLoading: stats === undefined };
}

// ─── Projects (shared between broker and RED) ───────────
/**
 * WHY:   Centralizes property/project fetching logic based on the user's role.
 * WHAT:  Conditionally fetches properties from either the broker or RED API module.
 * HOW:   Leverages `useRole` and `useConvexBootstrapState` to execute the correct query dynamically.
 */
export function useZoneProperties() {
    const role = useRole();
    const { shouldRunProtectedQueries } = useConvexBootstrapState();
    const propertiesBroker = useQuery(
        api.broker_zone.properties.listMyProperties,
        shouldRunProtectedQueries && role === "broker" ? { paginationOpts: { numItems: 50, cursor: null } } : "skip"
    );
    const propertiesRED = useQuery(
        api.red_zone.properties.listMyProperties,
        shouldRunProtectedQueries && role === "RED" ? { paginationOpts: { numItems: 50, cursor: null } } : "skip"
    );
    const properties = role === "broker" ? propertiesBroker?.page : propertiesRED?.page;
    return {
        properties,
        role,
        isLoading: properties === undefined,
    };
}
