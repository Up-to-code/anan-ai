import { requireAdminSession } from "@/server/auth/guards";
import { requireAdminPageSession } from "@/lib/serverSession";
import { convexAdminOrdersRepository, type OrderStatus } from "@/server/infrastructure/convex/adminOrdersRepository";

/**
 * WHY:   The orders page needs one admin-scoped loader for filtered operational order data.
 * WHAT:  Returns the current list of orders for the chosen status filter.
 * HOW:   Requires an admin session and delegates to the orders repository.
 */
export async function getAdminOrdersPageData(status?: OrderStatus) {
  const session = await requireAdminPageSession("/orders");
  const orders = await convexAdminOrdersRepository.list(session.token, status);
  return { session, orders };
}

/**
 * WHY:   Order updates should pass through one authenticated admin write path.
 * WHAT:  Updates status, assignee, and notes for an order.
 * HOW:   Requires an admin session, then forwards the payload to the orders repository.
 */
export async function updateAdminOrder(input: {
  id: string;
  status?: OrderStatus;
  notes?: string;
  assignedTo?: string;
}) {
  const session = await requireAdminSession();
  await convexAdminOrdersRepository.update(session.token, input);
}
