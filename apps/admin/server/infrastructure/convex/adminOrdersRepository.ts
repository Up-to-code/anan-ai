import { createRepositoryRefs, queryRef, voidMutationRef } from "@anan/convex-adapters/repository";
import { apiUnsafe } from "@/lib/convexApi";

type OrdersApiRefs = {
  listOrders: unknown;
  getOrder: unknown;
  updateOrder: unknown;
};

const ordersApi = createRepositoryRefs<OrdersApiRefs>(apiUnsafe, "admin_zone/orders");

export type OrderStatus =
  | "new_lead"
  | "contacted"
  | "qualified"
  | "offer_made"
  | "under_contract"
  | "closed_won"
  | "closed_lost";

export type OrderChannel = "workspace" | "web" | "admin";
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
    return queryRef<AdminOrderRecord[]>(
      token,
      ordersApi.listOrders,
      {
        status: filters?.status,
        sourceChannel: filters?.sourceChannel,
        assignment: filters?.assignment,
      },
    );
  },
  async get(token: string, id: string) {
    return queryRef<AdminOrderRecord | null>(token, ordersApi.getOrder, { id });
  },
  async update(token: string, input: { id: string; status?: OrderStatus; notes?: string; assignedTo?: string }) {
    await voidMutationRef(token, ordersApi.updateOrder, input);
  },
};
