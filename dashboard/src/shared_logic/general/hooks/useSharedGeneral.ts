import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "convex/_generated/api";
import { useConvexBootstrapState } from "@/_core/hooks/useConvexBootstrapState";

export function useSharedGeneralOverview(role: string | null) {
    const { isAuthenticated } = useConvexAuth();
    const { shouldRunProtectedQueries } = useConvexBootstrapState();

    const propertiesBroker = useQuery(
        api.broker_zone.properties.listMyProperties,
        shouldRunProtectedQueries && role === "broker" ? { paginationOpts: { numItems: 50, cursor: null } } : "skip"
    );
    const propertiesRED = useQuery(
        api.red_zone.properties.listMyProperties,
        shouldRunProtectedQueries && role === "RED" ? { paginationOpts: { numItems: 50, cursor: null } } : "skip"
    );

    const sentOffers = useQuery(api.shared_logic.offers.listSentOffers, shouldRunProtectedQueries ? {} : "skip");
    const receivedOffers = useQuery(api.shared_logic.offers.listReceivedOffers, shouldRunProtectedQueries ? {} : "skip");
    const deals = useQuery(api.shared_logic.crm.index.getDealsSafe, shouldRunProtectedQueries ? {} : "skip");

    return {
        propertiesBroker,
        propertiesRED,
        sentOffers,
        receivedOffers,
        deals,
    };
}

export function useSharedGeneralOrganization() {
    const { isAuthenticated } = useConvexAuth();
    const { shouldRunProtectedQueries } = useConvexBootstrapState();

    const teamMembers = useQuery(
        api.shared_logic.agencies.index.getTeamMembers,
        shouldRunProtectedQueries ? {} : "skip"
    );
    const teamInvites = useQuery(
        api.shared_logic.agencies.index.listTeamInvites,
        shouldRunProtectedQueries ? {} : "skip"
    );
    const createTeamInvite = useMutation(api.shared_logic.agencies.index.createTeamInvite);
    const cancelTeamInvite = useMutation(api.shared_logic.agencies.index.cancelTeamInvite);
    const acceptTeamInvite = useMutation(api.shared_logic.agencies.index.acceptTeamInvite);
    return {
        teamMembers,
        teamInvites,
        createTeamInvite,
        cancelTeamInvite,
        acceptTeamInvite,
        isLoading: teamMembers === undefined
    };
}

export function useSharedGeneralInbox() {
    const { isAuthenticated } = useConvexAuth();
    const { shouldRunProtectedQueries } = useConvexBootstrapState();

    const receivedOffers = useQuery(
        api.shared_logic.offers.listReceivedOffers,
        shouldRunProtectedQueries ? {} : "skip"
    );
    const updateStatus = useMutation(api.shared_logic.offers.updateOfferStatus);

    return {
        receivedOffers,
        updateStatus,
        isLoading: receivedOffers === undefined
    };
}
