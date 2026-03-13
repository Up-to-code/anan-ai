import { fetchQuery } from "convex/nextjs";
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

const analyticsApi = apiUnsafe["admin_zone/analytics"] as AnalyticsApiRefs;

/**
 * WHY:   The analytics workspace needs a dedicated repository boundary separate from overview and activity reads.
 * WHAT:  Exposes auth-scoped chart readers for messages, active users, brokers, developers, properties, offers, and connections.
 * HOW:   Delegates to the new `convex/admin_zone/analytics` queries with the current admin token.
 */
export const convexAdminAnalyticsRepository = {
  async getMessageAnalytics(token: string) {
    return fetchQuery(analyticsApi.messageAnalytics as never, { range: "month", limit: 12 } as never, { token }) as Promise<{
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
    }>;
  },
  async getActiveUsersAnalytics(token: string) {
    return fetchQuery(analyticsApi.activeUsersAnalytics as never, { range: "month" } as never, { token }) as Promise<{
      totalDistinctUsers: number;
      trend: Array<{ label: string; value: number }>;
    }>;
  },
  async getBrokerAnalytics(token: string) {
    return fetchQuery(analyticsApi.brokerAnalytics as never, { limit: 12 } as never, { token }) as Promise<{
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
    }>;
  },
  async getDeveloperAnalytics(token: string) {
    return fetchQuery(analyticsApi.developerAnalytics as never, { limit: 12 } as never, { token }) as Promise<{
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
    }>;
  },
  async getPropertyAnalytics(token: string) {
    return fetchQuery(analyticsApi.propertyAnalytics as never, { range: "month" } as never, { token }) as Promise<{
      total: number;
      statusBreakdown: Record<string, number>;
      ownerBreakdown: Record<string, number>;
      trend: Array<{ label: string; value: number }>;
    }>;
  },
  async getOfferAnalytics(token: string) {
    return fetchQuery(analyticsApi.offerAnalytics as never, { range: "month", limit: 12 } as never, { token }) as Promise<{
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
    }>;
  },
  async getConnectionAnalytics(token: string) {
    return fetchQuery(analyticsApi.connectionAnalytics as never, { limit: 12 } as never, { token }) as Promise<{
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
    }>;
  },
};
