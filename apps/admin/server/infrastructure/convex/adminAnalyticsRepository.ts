import { createRepositoryRefs, queryRef } from "@anan/convex-adapters/repository";
import { apiUnsafe } from "@/lib/convexApi";

type AnalyticsApiRefs = {
  messageAnalytics: unknown;
  activeUsersAnalytics: unknown;
  brokerAnalytics: unknown;
  developerAnalytics: unknown;
  propertyAnalytics: unknown;
  offerAnalytics: unknown;
  connectionAnalytics: unknown;
};

const analyticsApi = createRepositoryRefs<AnalyticsApiRefs>(apiUnsafe, "admin_zone/analytics");

/**
 * WHY:   The analytics workspace needs a dedicated repository boundary separate from overview and activity reads.
 * WHAT:  Exposes auth-scoped chart readers for messages, active users, brokers, developers, properties, offers, and connections.
 * HOW:   Delegates to the new `convex/admin_zone/analytics` queries with the current admin token.
 */
export const convexAdminAnalyticsRepository = {
  async getMessageAnalytics(token: string) {
    return queryRef<{
      totals: {
        assistantMessages: number;
        inboxMessages: number;
        activatedMessages: number;
        combinedMessages: number;
      };
      topUsers: Array<{
        userId: string;
        name: string;
        assistantMessages: number;
        inboxMessages: number;
        activatedMessages: number;
        totalMessages: number;
      }>;
      activatedTrend: Array<{ label: string; value: number }>;
    }>(token, analyticsApi.messageAnalytics, { range: "month", limit: 12 });
  },
  async getActiveUsersAnalytics(token: string) {
    return queryRef<{
      totalDistinctUsers: number;
      trend: Array<{ label: string; value: number }>;
    }>(token, analyticsApi.activeUsersAnalytics, { range: "month" });
  },
  async getBrokerAnalytics(token: string) {
    return queryRef<{
      summary: { total: number; verified: number; pending: number };
      topByInventory: Array<{
        id: string;
        name: string;
        status: string;
        isVerified: boolean;
        linkedProfilesCount: number;
        membersCount: number;
        inventoryCount: number;
      }>;
    }>(token, analyticsApi.brokerAnalytics, { limit: 12 });
  },
  async getDeveloperAnalytics(token: string) {
    return queryRef<{
      summary: { total: number; verified: number; pending: number };
      topByInventory: Array<{
        id: string;
        name: string;
        status: string;
        isVerified: boolean;
        linkedProfilesCount: number;
        membersCount: number;
        inventoryCount: number;
      }>;
    }>(token, analyticsApi.developerAnalytics, { limit: 12 });
  },
  async getPropertyAnalytics(token: string) {
    return queryRef<{
      total: number;
      statusBreakdown: Record<string, number>;
      ownerBreakdown: Record<string, number>;
      trend: Array<{ label: string; value: number }>;
    }>(token, analyticsApi.propertyAnalytics, { range: "month" });
  },
  async getOfferAnalytics(token: string) {
    return queryRef<{
      summary: {
        total: number;
        pending: number;
        accepted: number;
        rejected: number;
        public: number;
        private: number;
      };
      trend: Array<{ label: string; value: number }>;
      topSenders: Array<{
        organizationKey: string;
        ownerType: "broker" | "red";
        name: string;
        offersCount: number;
        acceptedCount: number;
        pendingCount: number;
      }>;
      topRecipients: Array<{
        organizationKey: string;
        ownerType: "broker" | "red" | "marketplace";
        name: string;
        offersCount: number;
        acceptedCount: number;
        pendingCount: number;
      }>;
    }>(token, analyticsApi.offerAnalytics, { range: "month", limit: 12 });
  },
  async getConnectionAnalytics(token: string) {
    return queryRef<{
      summary: {
        totalPairs: number;
        offersWithConversation: number;
        conversationsLeadingToDeals: number;
        conversationsLeadingToOrders: number;
      };
      topPairs: Array<{
        id: string;
        senderOrganizationKey: string;
        senderName: string;
        senderType: "broker" | "red";
        recipientOrganizationKey: string;
        recipientName: string;
        recipientType: "broker" | "red";
        offersCount: number;
        acceptedOffersCount: number;
        conversationCount: number;
        dealsCount: number;
        ordersCount: number;
      }>;
    }>(token, analyticsApi.connectionAnalytics, { limit: 12 });
  },
};
