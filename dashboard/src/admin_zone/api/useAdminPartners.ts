import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

/**
 * WHY:   Provides the central list of Real Estate Developers (REDs) / Partners for admin management.
 * WHAT:  Fetches all registered RED partners from the backend.
 * HOW:   Uses `useQuery` via `admin_zone.RED.listREDs`.
 */
export function useAdminListPartners() {
    const partners = useQuery(api.admin_zone.RED.listREDs);
    return {
        partners,
        isLoading: partners === undefined,
    };
}

/**
 * WHY:   Fetches details of a specific RED partner for viewing or editing.
 * WHAT:  Reads a single RED record using its `Id<"RED">`.
 * HOW:   Skips the query if `id` is undefined.
 */
export function useAdminGetPartner(id: string | undefined) {
    const partner = useQuery(
        api.admin_zone.RED.getRED,
        id ? { id: id as Id<"RED"> } : "skip"
    );
    return {
        partner,
        isLoading: partner === undefined,
    };
}

/**
 * WHY:   Allows admins to register a new Real Estate Developer in the platform.
 * WHAT:  Provides a mutation function to create a RED record.
 * HOW:   Uses `useMutation` via `admin_zone.RED.createRED`.
 */
export function useAdminCreatePartner() {
    const createPartner = useMutation(api.admin_zone.RED.createRED);
    return { createPartner };
}

/**
 * WHY:   Allows admins to modify existing RED partner details.
 * WHAT:  Provides a mutation function to update a RED record.
 * HOW:   Uses `useMutation` via `admin_zone.RED.updateRED`.
 */
export function useAdminUpdatePartner() {
    const updatePartner = useMutation(api.admin_zone.RED.updateRED);
    return { updatePartner };
}
