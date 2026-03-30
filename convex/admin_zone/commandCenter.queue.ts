import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireRole } from "../_core/security/accessPolicy";
import { normalizeTimestamp } from "./commandCenter.helpers";
import { getWindowBoundaries } from "./commandCenter.shared";

/**
 * WHY:   Operations teams need a queue-specific read model that blends assignment load, verification aging, and diagnostics noise.
 * WHAT:  Returns queue counts, verification aging buckets, diagnostic breakdowns, assignment mix, and recent queue events.
 * HOW:   Aggregates orders, verification requests, search errors, and workspace notifications over the selected window.
 */
export const queueHealthAnalytics = query({
  args: {
    range: v.optional(v.union(v.literal("30d"), v.literal("90d"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { range = "30d", limit = 10 }) => {
    await requireRole(ctx, ["admin"]);

    const [orders, verificationRequests, searchLogs, notifications] = await Promise.all([
      ctx.db.query("orders").order("desc").take(500),
      ctx.db.query("verificationRequests").order("desc").take(500),
      ctx.db.query("searchLogs").order("desc").take(500),
      ctx.db.query("workspaceNotifications").order("desc").take(500),
    ]);

    const { currentStart, now } = getWindowBoundaries(range);
    const errorLogs = searchLogs.filter((item) => item.status === "failed" || Boolean(item.errorMessage));

    return {
      range,
      summary: {
        unassignedOrders: orders.filter((item) => !item.assignedTo).length,
        newVerifications: verificationRequests.filter((item) => item.currentStatus === "new").length,
        inReviewVerifications: verificationRequests.filter((item) => item.currentStatus === "in_review").length,
        recentErrors: errorLogs.filter((item) => normalizeTimestamp(item._creationTime) >= currentStart).length,
        recentNotifications: notifications.filter((item) => normalizeTimestamp(item.createdAt) >= currentStart).length,
      },
      verificationAging: [
        {
          label: "أقل من يومين",
          value: verificationRequests.filter((item) => now - normalizeTimestamp(item.submittedAt) < 2 * 24 * 60 * 60 * 1000).length,
        },
        {
          label: "من يومين إلى 7 أيام",
          value: verificationRequests.filter((item) => {
            const age = now - normalizeTimestamp(item.submittedAt);
            return age >= 2 * 24 * 60 * 60 * 1000 && age < 7 * 24 * 60 * 60 * 1000;
          }).length,
        },
        {
          label: "أكثر من 7 أيام",
          value: verificationRequests.filter((item) => now - normalizeTimestamp(item.submittedAt) >= 7 * 24 * 60 * 60 * 1000).length,
        },
      ],
      orderAssignment: [
        { label: "مُسند", value: orders.filter((item) => Boolean(item.assignedTo)).length },
        { label: "غير مُسند", value: orders.filter((item) => !item.assignedTo).length },
      ],
      orderStatusCounts: [
        { label: "جديد", value: orders.filter((item) => item.status === "new_lead").length },
        { label: "تم التواصل", value: orders.filter((item) => item.status === "contacted").length },
        { label: "مؤهل", value: orders.filter((item) => item.status === "qualified").length },
        { label: "عرض", value: orders.filter((item) => item.status === "offer_made").length },
        { label: "تعاقد", value: orders.filter((item) => item.status === "under_contract").length },
      ],
      diagnostics: {
        byStatus: Object.fromEntries(
          errorLogs.reduce((map, item) => {
            const key = String(item.status ?? "unknown");
            map.set(key, (map.get(key) ?? 0) + 1);
            return map;
          }, new Map<string, number>()),
        ),
        byStage: Object.fromEntries(
          errorLogs.reduce((map, item) => {
            const key = String(item.stage ?? "unknown");
            map.set(key, (map.get(key) ?? 0) + 1);
            return map;
          }, new Map<string, number>()),
        ),
      },
      recentQueueItems: [
        ...orders
          .filter((item) => !item.assignedTo)
          .map((item) => ({
            id: `order:${String(item._id)}`,
            kind: "order" as const,
            title: "طلب غير مُسند",
            subtitle: item.userId ?? item.type ?? "طلب",
            createdAt: normalizeTimestamp(item._creationTime),
            status: item.status ?? "new_lead",
          })),
        ...verificationRequests.map((item) => ({
          id: `verification:${String(item._id)}`,
          kind: "verification" as const,
          title: item.currentStatus === "new" ? "طلب تحقق جديد" : "طلب تحقق قيد المتابعة",
          subtitle: item.title ?? item.requestType ?? "تحقق",
          createdAt: normalizeTimestamp(item.reviewedAt ?? item.submittedAt),
          status: item.currentStatus ?? "new",
        })),
        ...notifications
          .filter((item) => normalizeTimestamp(item.createdAt) >= currentStart)
          .map((item) => ({
            id: `notification:${String(item._id)}`,
            kind: "notification" as const,
            title: item.title ?? "إشعار تشغيلي",
            subtitle: item.summary ?? item.type ?? "إشعار",
            createdAt: normalizeTimestamp(item.createdAt),
            status: item.severity ?? "info",
          })),
        ...errorLogs.map((item) => ({
          id: `diagnostic:${String(item._id)}`,
          kind: "diagnostic" as const,
          title: "حدث تقني يحتاج انتباه",
          subtitle: item.query ?? item.stage ?? "تشخيص",
          createdAt: normalizeTimestamp(item._creationTime),
          status: item.status ?? "failed",
        })),
      ]
        .sort((left, right) => right.createdAt - left.createdAt)
        .slice(0, limit),
    };
  },
});

