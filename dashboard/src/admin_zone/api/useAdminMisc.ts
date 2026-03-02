import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

// ─── Activities ─────────────────────────────────────────
/**
 * WHY:   Populates the global activity feed on the admin dashboard.
 * WHAT:  Fetches a timeline of recent system events.
 * HOW:   Uses `useQuery` via `admin_zone.activities.recentActivities`.
 */
export function useAdminActivities(limit = 50) {
    const activities = useQuery(api.admin_zone.activities.recentActivities, { limit });
    return { activities, isLoading: activities === undefined };
}

// ─── Charts ─────────────────────────────────────────────
/**
 * WHY:   Provides data for the visual analytic charts on the admin overview.
 * WHAT:  Fetches search activity trends and channel distribution metrics.
 * HOW:   Uses two parallel `useQueries`.
 */
export function useAdminCharts(range: "week" | "month" = "week") {
    const searchActivity = useQuery(api.admin_zone.charts.searchActivityChart, { range });
    const channelDist = useQuery(api.admin_zone.charts.channelDistribution);
    return { searchActivity, channelDist, isLoading: searchActivity === undefined };
}

// ─── Developers ─────────────────────────────────────────
/**
 * WHY:   Provides raw system logs and error rates for developers inside the admin zone.
 * WHAT:  Fetches developer logs and error metrics.
 * HOW:   Uses parallel `useQueries` for logs and error arrays.
 */
export function useAdminDevTools(limit = 50, range: "week" | "month" = "week") {
    const logs = useQuery(api.admin_zone.developers.devLogs, { limit });
    const errorRate = useQuery(api.admin_zone.developers.devErrorRate, { range });
    return { logs, errorRate, isLoading: logs === undefined };
}

// ─── Notifications ──────────────────────────────────────
/**
 * WHY:   Fetches admin-specific system alerts.
 * WHAT:  Reads from the notifications table.
 * HOW:   Uses `useQuery` with a limit parameter.
 */
export function useAdminNotifications(limit = 50) {
    const notifications = useQuery(api.admin_zone.notifications.list, { limit });
    return { notifications, isLoading: notifications === undefined };
}

// ─── Pipeline (Orders) ──────────────────────────────────
/**
 * WHY:   Lists all sales/request orders in the system.
 * WHAT:  Fetches all orders (useful until large-scale pagination is needed).
 * HOW:   Uses `useQuery` via `admin_zone.orders.listOrders`.
 */
export function useAdminPipeline() {
    const orders = useQuery(api.admin_zone.orders.listOrders, {});
    return { orders, isLoading: orders === undefined };
}
