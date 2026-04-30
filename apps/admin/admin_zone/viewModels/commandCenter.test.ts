import { describe, expect, it } from "vitest";
import { buildAnalyticsCommandCenterViewModel, buildOverviewCommandCenterViewModel } from "./commandCenter";

const overviewPayload = {
  range: "30d" as const,
  kpis: {
    activeUsers: { current: 240, previous: 120, delta: 1 },
    offerVolume: { current: 48, previous: 32, delta: 0.5 },
    qualifiedOrders: { current: 28, previous: 21, delta: 0.33 },
    closedWins: { current: 8, previous: 6, delta: 0.33 },
  },
  pipeline: { value: 4_200_000, dealCount: 18, valuedDealCount: 12 },
  queueHealth: {
    unassignedOrders: 11,
    newVerifications: 5,
    inReviewVerifications: 7,
    errorEvents: 4,
    apiKeyDenials: 2,
  },
  ecosystemHealth: {
    brokers: 30,
    developers: 12,
    verifiedOrganizations: 16,
    activeSubscriptions: 19,
    trialSubscriptions: 5,
    actionModeOrganizations: 9,
    restrictedOrganizations: 3,
  },
  dataHealth: [
    {
      summaryType: "orders_snapshot",
      status: "success",
      value: 140,
      recordCount: 140,
      lastAggregatedAt: 1_710_000_000_000,
      staleSince: null,
    },
  ],
  apiRisk: {
    activeKeys: 14,
    suspendedKeys: 1,
    revokedKeys: 1,
    keysWithOriginRestrictions: 9,
    deniedKeys: 3,
  },
  activityTrend: [
    { label: "1", messages: 30, searches: 18, research: 7 },
    { label: "2", messages: 22, searches: 14, research: 4 },
  ],
  commercialTrend: [
    { label: "1", offers: 11, orders: 9, deals: 3 },
    { label: "2", offers: 13, orders: 10, deals: 4 },
  ],
  topOrganizations: [
    {
      organizationKey: "broker__alpha",
      ownerType: "broker" as const,
      name: "Alpha Brokers",
      isVerified: true,
      inventoryCount: 21,
      offersCount: 11,
      membersCount: 7,
      subscriptionStatus: "active",
      actionModeEnabled: true,
      score: 44,
    },
  ],
  alerts: [
    {
      id: "alert-1",
      kind: "verification" as const,
      title: "طلب تحقق يحتاج متابعة",
      subtitle: "Broker verification",
      createdAt: 1_710_000_000_000,
      status: "in_review",
    },
  ],
};

const commercialPayload = {
  range: "30d" as const,
  summary: {
    offers: { current: 48, previous: 32, delta: 0.5 },
    acceptedOffers: { current: 14, previous: 10, delta: 0.4 },
    wonDeals: { current: 8, previous: 6, delta: 0.33 },
    lostDeals: { current: 3, previous: 2, delta: 0.5 },
    pipelineValue: 4_200_000,
    pipelineFallbackCount: 6,
    openPipelineCount: 18,
  },
  offerTrend: [
    { label: "1", offers: 10, accepted: 3, pending: 4 },
    { label: "2", offers: 12, accepted: 4, pending: 5 },
  ],
  dealStages: [
    { stage: "new", count: 6, value: 1_000_000, valuedCount: 4 },
    { stage: "won", count: 8, value: 4_200_000, valuedCount: 8 },
  ],
  orderFunnel: [
    { label: "طلب جديد", value: 42 },
    { label: "مؤهل", value: 28 },
  ],
  orderChannels: [
    { label: "واتساب", value: 22 },
    { label: "التطبيق", value: 15 },
    { label: "الويب", value: 11 },
  ],
  topSenders: [
    {
      organizationKey: "broker__alpha",
      ownerType: "broker" as const,
      name: "Alpha Brokers",
      offersCount: 12,
      acceptedCount: 5,
    },
  ],
};

const ecosystemPayload = {
  range: "30d" as const,
  summary: {
    brokers: 30,
    developers: 12,
    verifiedBrokers: 11,
    verifiedDevelopers: 5,
    activeSubscriptions: 19,
    trialSubscriptions: 5,
  },
  onboardingTrend: [
    { label: "1", brokers: 2, developers: 1 },
    { label: "2", brokers: 3, developers: 1 },
  ],
  verificationMix: {
    brokers: { new: 3, inReview: 2, approved: 11, rejected: 1 },
    developers: { new: 2, inReview: 1, approved: 5, rejected: 0 },
  },
  subscriptionHealth: [
    { label: "نشط", value: 19 },
    { label: "تجريبي", value: 5 },
  ],
  actionModeAdoption: {
    brokers: 7,
    developers: 2,
    totalEligible: 24,
  },
  topOrganizations: overviewPayload.topOrganizations,
};

const queuePayload = {
  range: "30d" as const,
  summary: {
    unassignedOrders: 11,
    newVerifications: 5,
    inReviewVerifications: 7,
    recentErrors: 4,
    recentNotifications: 9,
  },
  verificationAging: [
    { label: "أقل من يومين", value: 5 },
    { label: "من يومين إلى 7 أيام", value: 4 },
  ],
  orderAssignment: [
    { label: "مُسند", value: 19 },
    { label: "غير مُسند", value: 11 },
  ],
  orderStatusCounts: [
    { label: "جديد", value: 12 },
    { label: "تم التواصل", value: 9 },
  ],
  diagnostics: {
    byStatus: { failed: 4, success: 1 },
    byStage: { search: 2, routing: 3 },
  },
  recentQueueItems: [
    {
      id: "queue-1",
      kind: "order" as const,
      title: "طلب غير مُسند",
      subtitle: "Lead #1",
      createdAt: 1_710_000_000_000,
      status: "new_lead",
    },
  ],
};

describe("commandCenter view models", () => {
  it("builds overview groups and insights from live payloads", () => {
    const viewModel = buildOverviewCommandCenterViewModel({
      range: "30d",
      overview: overviewPayload,
      commercial: commercialPayload,
      queue: queuePayload,
    });

    expect(viewModel.metrics).toHaveLength(6);
    expect(viewModel.network.groups.map((group) => group.id)).toEqual([
      "demand",
      "channels",
      "ecosystem",
      "pipeline",
      "risk",
    ]);
    expect(viewModel.network.links).toHaveLength(4);
    expect(viewModel.insights.length).toBeGreaterThan(0);
    expect(viewModel.topOrganizations[0]?.name).toBe("Alpha Brokers");
    expect(viewModel.queueFocus[0]?.status).toBe("warning");
  });

  it("builds analytics slices for commercial, ecosystem, and queue sections", () => {
    const viewModel = buildAnalyticsCommandCenterViewModel({
      range: "30d",
      commercial: commercialPayload,
      ecosystem: ecosystemPayload,
      queue: queuePayload,
    });

    expect(viewModel.summaryMetrics).toHaveLength(6);
    expect(viewModel.commercial.orderChannels).toHaveLength(3);
    expect(viewModel.ecosystem.verificationMixRows[0]?.label).toBe("وسطاء");
    expect(viewModel.queue.diagnosticsByStatus[0]?.value).toBe(4);
    expect(viewModel.queue.recentItems[0]?.title).toBe("طلب غير مُسند");
  });
});
