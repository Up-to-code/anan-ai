import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import DeveloperProjectAnalyticsPage from "../../pages/ProjectAnalyticsPage/DeveloperProjectAnalyticsPage";

function buildAnalyticsPayload() {
  return {
    projectId: "property-1",
    kpis: {
      connectedBrokers: 2,
      brokerManagedClients: 1,
      totalViews: 8,
      totalClicks: 5,
      activeCases: 2,
      activeDeals: 1,
    },
    brokerRows: [
      {
        brokerId: "broker-2",
        brokerName: "وسيط الرياض",
        brokerAvatarLabel: "و",
        brokerPhone: "0550000000",
        state: "client_linked",
        stateLabel: "عميل مرتبط",
        currentActivityKey: "in_stage",
        currentActivityLabel: "في مرحلة",
        linkedClientName: "عميل مهتم",
        currentStageLabel: "تم التواصل",
        lastActivityAt: 1737000000000,
        views: 3,
        clicks: 2,
      },
    ],
    stageSummary: [
      { key: "deal:contacted", label: "تم التواصل", count: 1, kind: "deal" },
      { key: "offer_case:engaged", label: "تعاون نشط", count: 1, kind: "offer_case" },
    ],
    recentEvents: [
      {
        id: "event:1",
        title: "تمت مشاهدة تفاصيل المشروع",
        subtitle: "وسيط الرياض",
        createdAt: 1737000000000,
      },
    ],
    visibilityTrend: [
      { dateKey: "2025-01-01", label: "Jan 1", views: 3, clicks: 2 },
      { dateKey: "2025-01-02", label: "Jan 2", views: 5, clicks: 3 },
    ],
    brokerStateSummary: [
      { key: "client_linked", label: "عميل مرتبط", count: 1 },
      { key: "viewer_only", label: "مشاهد فقط", count: 1 },
    ],
    interactionSummary: [
      { eventType: "project_detail_view", label: "فتح التفاصيل", count: 5 },
      { eventType: "project_analyze_click", label: "ضغط تحليل", count: 2 },
    ],
    developerSummary: {
      totalCustomers: 4,
      trackedCustomers: 2,
      brokerManagedCustomers: 3,
      internalCustomers: 1,
      activeBrokers: 2,
      closedWonCustomers: 1,
      closedLostCustomers: 0,
    },
    developerStageSummary: [
      { key: "new", label: "مرحلة جديدة", count: 1 },
      { key: "contacted", label: "مرحلة الاتصال", count: 2 },
      { key: "negotiation", label: "مرحلة التفاوض", count: 0 },
      { key: "won", label: "إغلاق ناجح", count: 1 },
      { key: "lost", label: "إغلاق غير مكتمل", count: 0 },
    ],
    brokerTracking: [
      {
        brokerId: "broker-2",
        brokerName: "وسيط الرياض",
        brokerAvatarLabel: "و",
        brokerPhone: "0550000000",
        state: "client_linked",
        stateLabel: "عميل مرتبط",
        lastActivityAt: 1737000000000,
        views: 3,
        clicks: 2,
        currentActivityKey: "in_stage",
        currentActivityLabel: "في مرحلة",
        totalCustomers: 2,
        trackedCustomers: 1,
        brokerManagedCustomers: 2,
        internalCustomers: 0,
        closedWonCustomers: 1,
        closedLostCustomers: 0,
        customers: [
          {
            id: "deal:1",
            name: "عميل مهتم",
            relationType: "broker_managed",
            relationTypeLabel: "عميل عبر وسيط",
            isTrackedCustomer: true,
            activityKey: "in_call",
            activityLabel: "في مكالمة",
            stageKey: "contacted",
            stageLabel: "مرحلة الاتصال",
            secondaryStateKey: "engaged",
            secondaryStateLabel: "تعاون نشط",
            lastActivityAt: 1737000000000,
          },
          {
            id: "offer:1",
            name: "عميل جديد",
            relationType: "broker_managed",
            relationTypeLabel: "عميل عبر وسيط",
            isTrackedCustomer: false,
            activityKey: "new_client",
            activityLabel: "عميل جديد",
            stageKey: "new",
            stageLabel: "مرحلة جديدة",
            secondaryStateKey: "targeted",
            secondaryStateLabel: "عرض موجّه",
            lastActivityAt: 1736990000000,
          },
        ],
        timeline: [
          {
            id: "timeline:1",
            kind: "deal",
            title: "العميل في مرحلة الاتصال",
            subtitle: "عميل مهتم",
            createdAt: 1737000000000,
          },
        ],
      },
    ],
  };
}

function buildExpandedAnalyticsPayload() {
  const base = buildAnalyticsPayload();
  return {
    ...base,
    brokerTracking: Array.from({ length: 6 }, (_, index) => {
      const brokerNumber = index + 1;
      const activityKey =
        brokerNumber === 1
          ? "new_client"
          : brokerNumber === 2
            ? "in_call"
            : brokerNumber === 3
              ? "in_stage"
              : brokerNumber === 4
                ? "permit_review"
                : brokerNumber === 5
                  ? "closed_won"
                  : "closed_lost";
      const activityLabel =
        brokerNumber === 1
          ? "عميل جديد"
          : brokerNumber === 2
            ? "في مكالمة"
            : brokerNumber === 3
              ? "في مرحلة"
              : brokerNumber === 4
                ? "مراجعة التصريح"
                : brokerNumber === 5
                ? "إغلاق ناجح"
                  : "إغلاق غير مكتمل";
      const totalCustomers = 7 - brokerNumber;

      return {
        brokerId: `broker-${brokerNumber}`,
        brokerName: `وسيط ${brokerNumber}`,
        brokerAvatarLabel: String(brokerNumber),
        brokerPhone: `055000000${brokerNumber}`,
        state:
          brokerNumber === 5
            ? "closed_won"
            : brokerNumber === 6
              ? "closed_lost"
              : brokerNumber === 4
                ? "offer_active"
                : "client_linked",
        stateLabel:
          brokerNumber === 5
            ? "إغلاق ناجح"
            : brokerNumber === 6
              ? "إغلاق غير مكتمل"
              : brokerNumber === 4
                ? "عرض نشط"
                : "عميل مرتبط",
        currentActivityKey: activityKey,
        currentActivityLabel: activityLabel,
        lastActivityAt: 1737000000000 + brokerNumber * 1000,
        views: brokerNumber,
        clicks: brokerNumber - 1,
        totalCustomers,
        trackedCustomers: Math.max(0, totalCustomers - 1),
        brokerManagedCustomers: totalCustomers,
        internalCustomers: 0,
        closedWonCustomers: brokerNumber === 5 ? 1 : 0,
        closedLostCustomers: brokerNumber === 6 ? 1 : 0,
        customers: [
          {
            id: `deal:${brokerNumber}`,
            name: `عميل ${brokerNumber}`,
            relationType: "broker_managed",
            relationTypeLabel: "عميل عبر وسيط",
            isTrackedCustomer: true,
            activityKey,
            activityLabel,
            stageKey:
              brokerNumber === 5
                ? "won"
                : brokerNumber === 6
                  ? "lost"
                  : brokerNumber === 2
                    ? "contacted"
                    : "new",
            stageLabel:
              brokerNumber === 5
                ? "إغلاق ناجح"
                : brokerNumber === 6
                  ? "إغلاق غير مكتمل"
                  : brokerNumber === 2
                    ? "مرحلة الاتصال"
                    : "مرحلة جديدة",
            secondaryStateKey: null,
            secondaryStateLabel: null,
            lastActivityAt: 1737000000000 + brokerNumber * 1000,
          },
        ],
        timeline: [
          {
            id: `timeline:${brokerNumber}`,
            kind: brokerNumber === 5 || brokerNumber === 6 ? "closed" : "deal",
            title: `وسيط ${brokerNumber}`,
            subtitle: `عميل ${brokerNumber}`,
            createdAt: 1737000000000 + brokerNumber * 1000,
          },
        ],
      };
    }),
  };
}

const { notFound } = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

const { useRouter } = vi.hoisted(() => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

const { resolveWorkspaceProjectDetail } = vi.hoisted(() => ({
  resolveWorkspaceProjectDetail: vi.fn(),
}));

const { requireWorkspaceData } = vi.hoisted(() => ({
  requireWorkspaceData: vi.fn(),
}));

const { getProjectAnalytics } = vi.hoisted(() => ({
  getProjectAnalytics: vi.fn(async () => buildAnalyticsPayload()),
}));

vi.mock("next/navigation", () => ({
  notFound,
  useRouter,
}));

vi.mock("../../../../_lib/workspaceData", () => ({
  requireWorkspaceData,
}));

vi.mock("@/server/domains/workspace/properties/detail", () => ({
  resolveWorkspaceProjectDetail,
}));

vi.mock("@/server/ws/zones", () => ({
  getWorkspacePropertyZone: vi.fn(() => ({
    getProjectAnalytics,
    recordProjectAnalyticsEvent: vi.fn(async () => ({ ok: true })),
  })),
}));

import WorkspaceProjectAnalyticsRoute from "./page";

beforeEach(() => {
  resolveWorkspaceProjectDetail.mockReset();
  getProjectAnalytics.mockClear();
  notFound.mockClear();
  requireWorkspaceData.mockResolvedValue({
    audience: "broker",
    ownerContext: { ownerType: "broker", ownerId: "broker-1" },
  });
});

it("renders the broker owner analytics page", async () => {
  resolveWorkspaceProjectDetail.mockResolvedValue({
    property: {
      _id: "property-1",
      title: "برج الاختبار",
      address: "الرياض",
      location: "الرياض",
      description: "وصف",
      price: 2200000,
      beds: 4,
      baths: 4,
      sqft: 380,
      publicationState: "published",
      media: [{ key: "file-1", url: "https://images.unsplash.com/photo-1", name: "cover.jpg" }],
    },
    accessMode: "owner",
    canEdit: true,
  });

  const element = await WorkspaceProjectAnalyticsRoute({
    params: Promise.resolve({ projectId: "property-1" }),
  });
  const markup = renderToStaticMarkup(element);

  expect(markup).toContain("تحليل المشروع");
  expect(markup).toContain("برج الاختبار");
  expect(markup).toContain("الأداء");
  expect(markup).toContain("أداء المشروع عبر الزمن");
  expect(markup).toContain("شبكة الوسطاء");
  expect(getProjectAnalytics).toHaveBeenCalledWith({ id: "property-1" });
});

it("renders the developer owner analytics page", async () => {
  requireWorkspaceData.mockResolvedValue({
    audience: "developer",
    ownerContext: { ownerType: "RED", ownerId: "red-1" },
  });

  resolveWorkspaceProjectDetail.mockResolvedValue({
    property: {
      _id: "property-1",
      title: "برج الاختبار",
      address: "الرياض",
      location: "الرياض",
      description: "وصف",
      price: 2200000,
      beds: 4,
      baths: 4,
      sqft: 380,
      publicationState: "published",
      media: [{ key: "file-1", url: "https://images.unsplash.com/photo-1", name: "cover.jpg" }],
    },
    accessMode: "owner",
    canEdit: true,
  });

  const element = await WorkspaceProjectAnalyticsRoute({
    params: Promise.resolve({ projectId: "property-1" }),
  });
  const markup = renderToStaticMarkup(element);

  expect(markup).toContain("Developer Project Analytics");
  expect(markup).toContain("Overview");
  expect(markup).toContain("Broker Tracking");
  expect(markup).toContain("Business Overview");
  expect(markup).toContain("إجمالي العملاء");
  expect(markup).toContain("في مرحلة");
});

it("collapses and expands the developer broker list in fixed batches", () => {
  const project = {
    id: "property-1",
    title: "برج الاختبار",
    location: "الرياض",
    priceLabel: "2,200,000 ريال",
    summary: "وصف",
    shortDescription: "وصف",
    image: "https://images.unsplash.com/photo-1",
    galleryImages: [],
    gallery: {
      coverImageKey: null,
      displayMode: "cover",
      aspectRatio: "landscape",
    },
    amenities: [],
    parking: {
      hasParking: false,
      spaces: null,
      label: "لا يوجد",
    },
    permit: {
      statusLabel: "جاهز",
      privateSummary: null,
      privateFiles: [],
      visibility: "hidden",
      canShowPrivatePanel: false,
    },
    specs: {
      rooms: "4",
      baths: "4",
      area: "380",
      status: "published",
    },
    publicationState: "published",
    accessMode: "owner",
    canEdit: true,
    visibility: {
      clientVisibility: "public",
      viewers: [],
    },
    assets: [],
    units: [],
    brokers: [],
  } as any;

  const collapsedMarkup = renderToStaticMarkup(
    <DeveloperProjectAnalyticsPage
      project={project}
      analytics={buildExpandedAnalyticsPayload()}
      initialActiveTab="brokers"
      initialVisibleBrokerCount={5}
    />,
  );

  expect(collapsedMarkup).toContain("عرض المزيد");
  expect(collapsedMarkup).toContain("وسيط 1");
  expect(collapsedMarkup).toContain("وسيط 5");
  expect(collapsedMarkup).not.toContain("وسيط 6");

  const expandedMarkup = renderToStaticMarkup(
    <DeveloperProjectAnalyticsPage
      project={project}
      analytics={buildExpandedAnalyticsPayload()}
      initialActiveTab="brokers"
      initialVisibleBrokerCount={6}
    />,
  );

  expect(expandedMarkup).toContain("عرض أقل");
  expect(expandedMarkup).toContain("وسيط 6");
});

it("blocks shared viewers from opening owner analytics", async () => {
  resolveWorkspaceProjectDetail.mockResolvedValue({
    property: {
      _id: "property-1",
      title: "برج الاختبار",
      address: "الرياض",
      location: "الرياض",
      description: "وصف",
      price: 2200000,
      beds: 4,
      baths: 4,
      publicationState: "draft",
      media: [{ key: "file-1", url: "https://images.unsplash.com/photo-1", name: "cover.jpg" }],
    },
    accessMode: "shared",
    canEdit: false,
  });

  await expect(
    WorkspaceProjectAnalyticsRoute({
      params: Promise.resolve({ projectId: "property-1" }),
    }),
  ).rejects.toThrow("NEXT_NOT_FOUND");

  expect(notFound).toHaveBeenCalled();
});
