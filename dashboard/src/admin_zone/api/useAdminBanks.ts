import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

/**
 * WHY:   Provides the central list of banks for admin management.
 * WHAT:  Fetches all registered banks from the backend.
 * HOW:   Uses `useQuery` via `admin_zone.banks.listBanks`.
 */
export function useAdminListBanks() {
    const banks = useQuery(api.admin_zone.banks.listBanks);
    return {
        banks,
        isLoading: banks === undefined,
    };
}

/**
 * WHY:   Fetches details of a specific bank for viewing or editing.
 * WHAT:  Reads a single bank record using its `Id<"banks">`.
 * HOW:   Skips the query if `id` is undefined.
 */
export function useAdminGetBank(id: string | undefined) {
    const bank = useQuery(
        api.admin_zone.banks.getBank,
        id ? { id: id as Id<"banks"> } : "skip"
    );
    return {
        bank,
        isLoading: bank === undefined,
    };
}

/**
 * WHY:   Allows admins to register a new bank in the platform.
 * WHAT:  Provides a mutation function to create a bank record.
 * HOW:   Uses `useMutation` via `admin_zone.banks.createBank`.
 */
export function useAdminCreateBank() {
    const createBank = useMutation(api.admin_zone.banks.createBank);
    return { createBank };
}

/**
 * WHY:   Allows admins to modify existing bank details.
 * WHAT:  Provides a mutation function to update a bank record.
 * HOW:   Uses `useMutation` via `admin_zone.banks.updateBank`.
 */
export function useAdminUpdateBank() {
    const updateBank = useMutation(api.admin_zone.banks.updateBank);
    return { updateBank };
}
