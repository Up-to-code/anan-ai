import { useConvexAuth, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useRole } from "./useRole";
import { useSession } from "@/_core/lib/auth-client";

export function useUserData() {
    const role = useRole();
    const { data: session, isPending: sessionPending } = useSession();
    const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth();
    const sessionUser = useQuery(api.shared_logic.users.session.getSessionUser, isAuthenticated ? {} : "skip");

    // Conditionally fetch specific profiles depending on the current role.
    // Note: We use `skip` internally on the query if they aren't that role.
    const brokerProfile = useQuery(api.shared_logic.users.index.getBrokerProfile, role === "broker" ? {} : "skip");
    const redProfile = useQuery(api.shared_logic.users.index.getREDProfile, role === "RED" ? {} : "skip");
    const agency = useQuery(api.shared_logic.agencies.index.getMyAgency, isAuthenticated ? {} : "skip");

    const fallbackUser =
        session?.user
            ? {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
                isActive: true,
            }
            : null;

    const user = sessionUser ?? fallbackUser;
    const isLoading =
        sessionPending ||
        (session?.user && convexAuthLoading) ||
        (isAuthenticated && sessionUser === undefined);

    // Determine if the user has an active, verified organization layout
    const isVerified =
        role === "broker" ? brokerProfile?.isVerified === true :
            role === "RED" ? redProfile?.isVerified :
                true; // Normal users are inherently verified.

    return {
        user,
        role,
        brokerProfile,
        redProfile,
        agency,
        isVerified,
        isLoading,
    };
}
