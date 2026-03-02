import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";

// ─── Broker Overview ────────────────────────────────────
/**
 * WHY:   Powers the high-level metrics dashboard for the Broker Zone landing page.
 * WHAT:  Fetches aggregated broker statistics (active listings, leads, general metrics).
 * HOW:   Uses a single `useQuery` to fetch from `broker_zone.overview.overviewStats`.
 */
export function useBrokerOverview() {
    const stats = useQuery(api.broker_zone.overview.overviewStats);
    return { stats, isLoading: stats === undefined };
}

// ─── Broker Offers ──────────────────────────────────────
/**
 * WHY:   Allows brokers to interact with the platform-wide offers marketplace.
 * WHAT:  Fetches both sent and public offers, and provides mutations to apply to or publish offers.
 * HOW:   Composes multiple queries/mutations from the `shared_logic.offers` API module.
 */
export function useBrokerOffers() {
    const sentOffers = useQuery(api.shared_logic.offers.listSentOffers);
    const publicOffers = useQuery(api.shared_logic.offers.listPublicOffers);
    const applyToOffer = useMutation(api.shared_logic.offers.applyToOffer);
    const publishOffer = useMutation(api.shared_logic.offers.publishOffer);
    return {
        sentOffers,
        publicOffers,
        applyToOffer,
        publishOffer,
        isLoadingSent: sentOffers === undefined,
        isLoadingPublic: publicOffers === undefined,
    };
}
