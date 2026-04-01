import { buildOrganizationProjection } from "./analytics.helpers";
import {
  calculateDelta,
  getDashboardRangeMs,
  normalizeTimestamp,
  type AdminDashboardRange,
} from "./commandCenter.helpers";

type OrganizationSnapshot = {
  organizationKey: string;
  ownerType: "broker" | "red";
  name: string;
  isVerified: boolean;
  inventoryCount: number;
  offersCount: number;
  membersCount: number;
  subscriptionStatus: string | null;
  actionModeEnabled: boolean;
  score: number;
};

/**
 * WHY:   All command-center queries need the same current and previous comparison windows.
 * WHAT:  Returns the current window start, previous window start, and the current timestamp for a dashboard range.
 * HOW:   Uses the selected range length twice: once for the active window and once for the comparison window.
 */
export function getWindowBoundaries(range: AdminDashboardRange) {
  const now = Date.now();
  const currentStart = now - getDashboardRangeMs(range);
  const previousStart = currentStart - getDashboardRangeMs(range);
  return { now, currentStart, previousStart };
}

/**
 * WHY:   KPI summaries repeat the same current-vs-previous counting logic across offers, orders, and deals.
 * WHAT:  Counts matching records in the current and previous rolling windows and adds a delta.
 * HOW:   Applies an optional predicate before classifying each item by its normalized timestamp.
 */
export function countWindowRecords<T>(args: {
  items: T[];
  getTimestamp: (item: T) => number;
  currentStart: number;
  previousStart: number;
  predicate?: (item: T) => boolean;
}) {
  let current = 0;
  let previous = 0;

  for (const item of args.items) {
    if (args.predicate && !args.predicate(item)) {
      continue;
    }

    const timestamp = args.getTimestamp(item);
    if (timestamp >= args.currentStart) {
      current += 1;
    } else if (timestamp >= args.previousStart) {
      previous += 1;
    }
  }

  return { current, previous, delta: calculateDelta(current, previous) };
}

/**
 * WHY:   The command-center overview needs a user-activity KPI that spans assistant, inbox, research, and search behavior.
 * WHAT:  Returns current and previous distinct active-user counts with a percentage delta.
 * HOW:   Attributes assistant messages through thread ownership and tracks unique users per comparison window.
 */
export function buildActiveUsersSummary(args: {
  currentStart: number;
  previousStart: number;
  assistantThreads: any[];
  assistantMessages: any[];
  inboxMessages: any[];
  knowledgeResearch: any[];
  searchLogs: any[];
}) {
  const threadUserById = new Map<string, string>(
    args.assistantThreads.map((thread) => [String(thread._id), String(thread.userId ?? "")]),
  );
  const currentUsers = new Set<string>();
  const previousUsers = new Set<string>();

  const addUser = (timestamp: number, userId?: string | null) => {
    if (!userId) {
      return;
    }

    if (timestamp >= args.currentStart) {
      currentUsers.add(userId);
      return;
    }

    if (timestamp >= args.previousStart) {
      previousUsers.add(userId);
    }
  };

  for (const message of args.assistantMessages) {
    addUser(normalizeTimestamp(message.createdAt), threadUserById.get(String(message.threadId)));
  }

  for (const message of args.inboxMessages) {
    const timestamp = normalizeTimestamp(message.createdAt);
    addUser(timestamp, message.senderUserId);
    addUser(timestamp, message.recipientUserId);
  }

  for (const item of args.knowledgeResearch) {
    addUser(normalizeTimestamp(item.createdAt), item.userId);
  }

  for (const item of args.searchLogs) {
    addUser(normalizeTimestamp(item._creationTime), item.userId);
  }

  return {
    current: currentUsers.size,
    previous: previousUsers.size,
    delta: calculateDelta(currentUsers.size, previousUsers.size),
  };
}

/**
 * WHY:   Leadership and operations views both need a ranked list of the most important organizations in the network.
 * WHAT:  Returns a scored broker/developer leaderboard combining inventory, offer activity, memberships, verification, and action-mode status.
 * HOW:   Builds one mutable snapshot per organization and increments it from properties, offers, memberships, and subscriptions.
 */
export function buildTopOrganizations(args: {
  brokers: any[];
  developers: any[];
  properties: any[];
  offers: any[];
  memberships: any[];
  subscriptions: any[];
  limit: number;
}) {
  const snapshots = new Map<string, OrganizationSnapshot>();

  const ensureSnapshot = (projection: {
    organizationKey: string;
    ownerType: "broker" | "red";
    name: string;
    isVerified: boolean;
  }) => {
    const current = snapshots.get(projection.organizationKey) ?? {
      organizationKey: projection.organizationKey,
      ownerType: projection.ownerType,
      name: projection.name,
      isVerified: projection.isVerified,
      inventoryCount: 0,
      offersCount: 0,
      membersCount: 0,
      subscriptionStatus: null,
      actionModeEnabled: false,
      score: 0,
    };

    current.isVerified = projection.isVerified;
    current.name = projection.name;
    snapshots.set(projection.organizationKey, current);
    return current;
  };

  for (const broker of args.brokers) {
    ensureSnapshot({
      organizationKey: `broker__${String(broker._id)}`,
      ownerType: "broker",
      name: broker.name ?? "وسيط",
      isVerified: broker.isVerified === true,
    });
  }

  for (const developer of args.developers) {
    ensureSnapshot({
      organizationKey: `red__${String(developer._id)}`,
      ownerType: "red",
      name: developer.name ?? "مطور",
      isVerified: developer.isVerified === true,
    });
  }

  for (const property of args.properties) {
    const projection = buildOrganizationProjection(
      {
        brokerId: property.brokerId ? String(property.brokerId) : null,
        redId: property.REDId ? String(property.REDId) : null,
      },
      args.brokers,
      args.developers,
    );

    if (!projection) {
      continue;
    }

    ensureSnapshot({
      organizationKey: projection.organizationKey,
      ownerType: projection.ownerType,
      name: projection.name,
      isVerified: false,
    }).inventoryCount += 1;
  }

  for (const offer of args.offers) {
    const sender = buildOrganizationProjection(
      {
        brokerId: offer.fromBrokerId ? String(offer.fromBrokerId) : null,
        redId: offer.fromREDId ? String(offer.fromREDId) : null,
      },
      args.brokers,
      args.developers,
    );

    if (!sender) {
      continue;
    }

    ensureSnapshot({
      organizationKey: sender.organizationKey,
      ownerType: sender.ownerType,
      name: sender.name,
      isVerified: false,
    }).offersCount += 1;
  }

  for (const membership of args.memberships) {
    const projection = membership.ownerType === "broker"
      ? buildOrganizationProjection(
          {
            brokerId: membership.ownerBrokerId ? String(membership.ownerBrokerId) : null,
            redId: null,
          },
          args.brokers,
          args.developers,
        )
      : buildOrganizationProjection(
          {
            brokerId: null,
            redId: membership.ownerREDId ? String(membership.ownerREDId) : null,
          },
          args.brokers,
          args.developers,
        );

    if (!projection) {
      continue;
    }

    ensureSnapshot({
      organizationKey: projection.organizationKey,
      ownerType: projection.ownerType,
      name: projection.name,
      isVerified: false,
    }).membersCount += 1;
  }

  for (const subscription of args.subscriptions) {
    const projection = subscription.ownerType === "broker"
      ? buildOrganizationProjection(
          {
            brokerId: subscription.ownerBrokerId ? String(subscription.ownerBrokerId) : null,
            redId: null,
          },
          args.brokers,
          args.developers,
        )
      : buildOrganizationProjection(
          {
            brokerId: null,
            redId: subscription.ownerREDId ? String(subscription.ownerREDId) : null,
          },
          args.brokers,
          args.developers,
        );

    if (!projection) {
      continue;
    }

    const snapshot = ensureSnapshot({
      organizationKey: projection.organizationKey,
      ownerType: projection.ownerType,
      name: projection.name,
      isVerified: false,
    });
    snapshot.subscriptionStatus = subscription.status ?? null;
    snapshot.actionModeEnabled = subscription.actionModeEnabled === true;
  }

  return Array.from(snapshots.values())
    .map((snapshot) => ({
      ...snapshot,
      score:
        snapshot.inventoryCount * 2 +
        snapshot.offersCount * 3 +
        snapshot.membersCount +
        (snapshot.isVerified ? 3 : 0) +
        (snapshot.actionModeEnabled ? 4 : 0),
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return right.inventoryCount - left.inventoryCount;
    })
    .slice(0, args.limit);
}

/**
 * WHY:   The dashboard needs an operations-focused alert rail separate from the generic activity feed.
 * WHAT:  Builds a sorted list of verification, diagnostic, and unassigned-order alerts.
 * HOW:   Normalizes the three sources into one comparable shape and returns the most recent entries first.
 */
export function buildAlerts(args: {
  verificationRequests: any[];
  searchLogs: any[];
  orders: any[];
  limit: number;
}) {
  const alertItems = [
    ...args.verificationRequests
      .filter((item) => item.currentStatus === "new" || item.currentStatus === "in_review" || item.currentStatus === "rejected")
      .map((item) => ({
        id: `verification:${String(item._id)}`,
        kind: "verification" as const,
        title: item.currentStatus === "rejected" ? "طلب تحقق مرفوض" : "طلب تحقق يحتاج متابعة",
        subtitle: item.title ?? item.requestType ?? "طلب تحقق",
        createdAt: normalizeTimestamp(item.reviewedAt ?? item.submittedAt),
        status: item.currentStatus ?? "unknown",
      })),
    ...args.searchLogs
      .filter((item) => item.status === "failed" || Boolean(item.errorMessage))
      .map((item) => ({
        id: `search:${String(item._id)}`,
        kind: "diagnostic" as const,
        title: "خطأ في البحث أو التتبع",
        subtitle: item.query ?? item.stage ?? "حدث تقني",
        createdAt: normalizeTimestamp(item._creationTime),
        status: item.status ?? "failed",
      })),
    ...args.orders
      .filter((item) => !item.assignedTo)
      .map((item) => ({
        id: `order:${String(item._id)}`,
        kind: "order" as const,
        title: "طلب غير مُسند",
        subtitle: item.userId ?? item.type ?? "طلب جديد",
        createdAt: normalizeTimestamp(item._creationTime),
        status: item.status ?? "new_lead",
      })),
  ];

  return alertItems
    .sort((left, right) => right.createdAt - left.createdAt)
    .slice(0, args.limit);
}
