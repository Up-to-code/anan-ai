import { fetchMutation, fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";

type OrdersApiRefs = {
  listOrders: unknown;
  getOrder: unknown;
  updateOrder: unknown;
};

const ordersApi = apiUnsafe["admin_zone/orders"] as OrdersApiRefs;

export type OrderStatus =
  | "new_lead"
  | "contacted"
  | "qualified"
  | "offer_made"
  | "under_contract"
  | "closed_won"
  | "closed_lost";

export type OrderChannel = "whatsapp" | "app" | "web";
export type OrderAssignmentFilter = "all" | "assigned" | "unassigned";

export type AdminOrderRecord = {
  _id: string;
  userId?: string;
  propertyId?: string;
  status: OrderStatus;
  sourceChannel?: OrderChannel;
  notes?: string;
  assignedTo?: string;
  _creationTime?: number;
};

/**
 * WHY:   Operational order tracking should remain isolated from the page layer.
 * WHAT:  Exposes auth-scoped readers and updater methods for admin orders.
 * HOW:   Delegates to `admin_zone/orders` with the current admin token.
 */
export const convexAdminOrdersRepository = {
  async list(
    token: string,
    filters?: {
      status?: OrderStatus;
      sourceChannel?: OrderChannel;
      assignment?: OrderAssignmentFilter;
    },
  ) {
    return fetchQuery(
      ordersApi.listOrders as never,
      {
        status: filters?.status,
        sourceChannel: filters?.sourceChannel,
        assignment: filters?.assignment,
      } as never,
      { token },
    ) as Promise<AdminOrderRecord[]>;
  },
  async get(token: string, id: string) {
    return fetchQuery(ordersApi.getOrder as never, { id } as never, { token }) as Promise<AdminOrderRecord | null>;
  },
  async update(token: string, input: { id: string; status?: OrderStatus; notes?: string; assignedTo?: string }) {
    await fetchMutation(ordersApi.updateOrder as never, input as never, { token });
  },
};
