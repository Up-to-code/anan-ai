import { fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";

type CommandCenterApiRefs = {
  commandCenterOverview: unknown;
  commercialAnalytics: unknown;
  partnerHealthAnalytics: unknown;
  queueHealthAnalytics: unknown;
};

const commandCenterApi = apiUnsafe["admin_zone/commandCenter"] as CommandCenterApiRefs;

export type AdminCommandCenterRange = "30d" | "90d";

/**
 * WHY:   The rebuilt admin dashboard and grouped analytics need one repository boundary for the new command-center read models.
 * WHAT:  Exposes auth-scoped readers for overview, commercial, partner-health, and queue-health datasets.
 * HOW:   Delegates to the new `convex/admin_zone/commandCenter` queries using the current admin token.
 */
export const convexAdminCommandCenterRepository = {
  async getOverview(token: string, range: AdminCommandCenterRange = "90d") {
    return fetchQuery(commandCenterApi.commandCenterOverview as never, { range } as never, { token }) as Promise<{
      range: AdminCommandCenterRange;
      kpis: {
        activeUsers: { current: number; previous: number; delta: number };
        offerVolume: { current: number; previous: number; delta: number };
        qualifiedOrders: { current: number; previous: number; delta: number };
        closedWins: { current: number; previous: number; delta: number };
      };
      pipeline: { value: number; dealCount: number; valuedDealCount: number };
      queueHealth: {
        unassignedOrders: number;
        newVerifications: number;
        inReviewVerifications: number;
        errorEvents: number;
        apiKeyDenials: number;
      };
      partnerHealth: {
        brokers: number;
        developers: number;
        verifiedOrganizations: number;
        activeSubscriptions: number;
        trialSubscriptions: number;
        actionModeOrganizations: number;
        restrictedOrganizations: number;
      };
      dataHealth: Array<{
        summaryType: string;
        status: string;
        value: number | null;
        recordCount: number | null;
        lastAggregatedAt: number;
        staleSince: number | null;
      }>;
      apiRisk: {
        activeKeys: number;
        suspendedKeys: number;
        revokedKeys: number;
        keysWithOriginRestrictions: number;
        deniedKeys: number;
      };
      activityTrend: Array<{ label: string; messages: number; searches: number; research: number }>;
      commercialTrend: Array<{ label: string; offers: number; orders: number; deals: number }>;
      topOrganizations: Array<{
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
      }>;
      alerts: Array<{
        id: string;
        kind: "verification" | "diagnostic" | "order";
        title: string;
        subtitle: string;
        createdAt: number;
        status: string;
      }>;
    }>;
  },
  async getCommercialAnalytics(token: string, range: AdminCommandCenterRange = "90d") {
    return fetchQuery(commandCenterApi.commercialAnalytics as never, { range } as never, { token }) as Promise<{
      range: AdminCommandCenterRange;
      summary: {
        offers: { current: number; previous: number; delta: number };
        acceptedOffers: { current: number; previous: number; delta: number };
        wonDeals: { current: number; previous: number; delta: number };
        lostDeals: { current: number; previous: number; delta: number };
        pipelineValue: number;
        pipelineFallbackCount: number;
        openPipelineCount: number;
      };
      offerTrend: Array<{ label: string; offers: number; accepted: number; pending: number }>;
      dealStages: Array<{ stage: string; count: number; value: number; valuedCount: number }>;
      orderFunnel: Array<{ label: string; value: number }>;
      orderChannels: Array<{ label: string; value: number }>;
      topSenders: Array<{
        organizationKey: string;
        ownerType: "broker" | "red";
        name: string;
        offersCount: number;
        acceptedCount: number;
      }>;
    }>;
  },
  async getPartnerHealthAnalytics(token: string, range: AdminCommandCenterRange = "90d") {
    return fetchQuery(commandCenterApi.partnerHealthAnalytics as never, { range } as never, { token }) as Promise<{
      range: AdminCommandCenterRange;
      summary: {
        brokers: number;
        developers: number;
        verifiedBrokers: number;
        verifiedDevelopers: number;
        activeSubscriptions: number;
        trialSubscriptions: number;
      };
      onboardingTrend: Array<{ label: string; brokers: number; developers: number }>;
      verificationMix: {
        brokers: { new: number; inReview: number; approved: number; rejected: number };
        developers: { new: number; inReview: number; approved: number; rejected: number };
      };
      subscriptionHealth: Array<{ label: string; value: number }>;
      actionModeAdoption: { brokers: number; developers: number; totalEligible: number };
      topOrganizations: Array<{
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
      }>;
    }>;
  },
  async getQueueHealthAnalytics(token: string, range: AdminCommandCenterRange = "30d") {
    return fetchQuery(commandCenterApi.queueHealthAnalytics as never, { range } as never, { token }) as Promise<{
      range: AdminCommandCenterRange;
      summary: {
        unassignedOrders: number;
        newVerifications: number;
        inReviewVerifications: number;
        recentErrors: number;
        recentNotifications: number;
      };
      verificationAging: Array<{ label: string; value: number }>;
      orderAssignment: Array<{ label: string; value: number }>;
      orderStatusCounts: Array<{ label: string; value: number }>;
      diagnostics: { byStatus: Record<string, number>; byStage: Record<string, number> };
      recentQueueItems: Array<{
        id: string;
        kind: "order" | "verification" | "notification" | "diagnostic";
        title: string;
        subtitle: string;
        createdAt: number;
        status: string;
      }>;
    }>;
  },
};
