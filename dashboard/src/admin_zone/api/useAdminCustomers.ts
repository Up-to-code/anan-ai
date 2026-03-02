import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

/**
 * WHY:   Specific hook to fetch a filtered user list showing only "whatsapp" customers.
 * WHAT:  Passes a static channel filter to the user list endpoint.
 * HOW:   Uses `useQuery` without pagination controls, currently defaulting to first 50.
 */
export function useAdminCustomers() {
    const result = useQuery(api.admin_zone.users.listUsers, {
        paginationOpts: { numItems: 50, cursor: null },
        channel: "whatsapp",
    });

    return {
        customers: result?.page ?? [],
        isLoading: result === undefined,
    };
}
