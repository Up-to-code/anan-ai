import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

/**
 * WHY:   Fetches the complete details of a single property/bank request order.
 * WHAT:  Reads a specific order record by ID.
 * HOW:   Skips execution if the ID is missing.
 */
export function useAdminGetOrder(id: string | undefined) {
    const order = useQuery(
        api.admin_zone.orders.getOrder,
        id ? { id: id as Id<"orders"> } : "skip"
    );
    return { order, isLoading: order === undefined };
}

/**
 * WHY:   Allows admins to change an order's status or details (e.g. approve/reject).
 * WHAT:  Provides a mutation to update an order.
 * HOW:   Uses `useMutation` via `admin_zone.orders.updateOrder`.
 */
export function useAdminUpdateOrder() {
    return { updateOrder: useMutation(api.admin_zone.orders.updateOrder) };
}

/**
 * WHY:   Orders are relational. This hook fetches all the entities attached to an order (Property, Bank, Partner) so the admin can see the full context.
 * WHAT:  Performs three parallel queries for the associated relations.
 * HOW:   Checks the order object and conditionally skips queries if relations are missing.
 */
export function useAdminOrderRelations(order: { propertyId?: Id<"properties">; bankId?: Id<"banks">; partnerId?: Id<"RED"> } | null | undefined) {
    const property = useQuery(
        api.admin_zone.properties.getProperty,
        order?.propertyId ? { id: order.propertyId } : "skip"
    );
    const bank = useQuery(
        api.admin_zone.banks.getBank,
        order?.bankId ? { id: order.bankId } : "skip"
    );
    const partner = useQuery(
        api.admin_zone.RED.getRED,
        order?.partnerId ? { id: order.partnerId } : "skip"
    );
    return { property, bank, partner };
}
