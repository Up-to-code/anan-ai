import { useQuery, useMutation, usePaginatedQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

/**
 * WHY:   Provides the central list of real estate properties for admin oversight.
 * WHAT:  Fetches a paginated list of properties, optionally filtered by status or partner.
 * HOW:   Uses `usePaginatedQuery` handling infinite scrolling behavior.
 */
export function useAdminListProperties(filters?: {
    status?: "available" | "sold" | "reserved";
    REDId?: Id<"RED">;
}) {
    const { results, status, loadMore } = usePaginatedQuery(
        api.admin_zone.properties.listProperties,
        {
            ...(filters?.status ? { status: filters.status } : {}),
            ...(filters?.REDId ? { REDId: filters.REDId } : {}),
        },
        { initialNumItems: 20 }
    );
    return {
        properties: results,
        status,
        loadMore,
        isLoading: status === "LoadingFirstPage",
    };
}

/**
 * WHY:   Fetches details of a specific property for viewing or editing.
 * WHAT:  Reads a single property record.
 * HOW:   Skips the query if `id` is undefined.
 */
export function useAdminGetProperty(id: string | undefined) {
    const property = useQuery(
        api.admin_zone.properties.getProperty,
        id ? { id: id as Id<"properties"> } : "skip"
    );
    return {
        property,
        isLoading: property === undefined,
    };
}

/**
 * WHY:   Allows admins to directly add properties to the system (though usually Brokers/REDs do this).
 * WHAT:  Provides a mutation function to create a property.
 * HOW:   Uses `useMutation` via `admin_zone.properties.createProperty`.
 */
export function useAdminCreateProperty() {
    const createProperty = useMutation(api.admin_zone.properties.createProperty);
    return { createProperty };
}

/**
 * WHY:   Allows admins to force details or status updates on a property.
 * WHAT:  Provides a mutation function to update a property.
 * HOW:   Uses `useMutation` via `admin_zone.properties.updateProperty`.
 */
export function useAdminUpdateProperty() {
    const updateProperty = useMutation(api.admin_zone.properties.updateProperty);
    return { updateProperty };
}
