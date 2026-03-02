import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";

export function useSharedOffers() {
    const sentOffers = useQuery(api.shared_logic.offers.listSentOffers);
    const publicOffers = useQuery(api.shared_logic.offers.listPublicOffers);
    const applyToOffer = useMutation(api.shared_logic.offers.applyToOffer);
    const createOffer = useMutation(api.shared_logic.offers.createOffer);
    const publishOffer = useMutation(api.shared_logic.offers.publishOffer);

    return {
        sentOffers,
        publicOffers,
        applyToOffer,
        createOffer,
        publishOffer,
        isLoadingSent: sentOffers === undefined,
        isLoadingPublic: publicOffers === undefined,
    };
}
