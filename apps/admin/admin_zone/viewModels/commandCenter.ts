import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import {
  type AdminCommandCenterRange,
  convexAdminCommandCenterRepository,
} from "@/server/infrastructure/convex/adminCommandCenterRepository";

type OverviewPayload = Awaited<ReturnType<typeof convexAdminCommandCenterRepository.getOverview>>;
type CommercialPayload = Awaited<ReturnType<typeof convexAdminCommandCenterRepository.getCommercialAnalytics>>;
type PartnerPayload = Awaited<ReturnType<typeof convexAdminCommandCenterRepository.getPartnerHealthAnalytics>>;
type QueuePayload = Awaited<ReturnType<typeof convexAdminCommandCenterRepository.getQueueHealthAnalytics>>;

export type CommandCenterMetricCard = {
  key: string;
  label: string;
  value: string;
  delta?: number | null;
  hint: string;
};

export type CommandCenterNetworkMetric = {
  id: string;
  label: string;
  value: number;
  displayValue: string;
};

export type CommandCenterNetworkGroup = {
  id: string;
  label: string;
  summary: string;
  totalValue: number;
  totalDisplayValue: string;
  accent: string;
  metrics: CommandCenterNetworkMetric[];
};

export type CommandCenterNetworkLink = {
  id: string;
  sourceId: string;
  targetId: string;
  value: number;
  label: string;
  displayValue: string;
};

export type CommandCenterInsight = {
  id: string;
  title: string;
  body: string;
  tone: "focus" | "warn" | "positive";
};

export type CommandCenterOverviewViewModel = {
  range: AdminCommandCenterRange;
  metrics: CommandCenterMetricCard[];
  network: {
    groups: CommandCenterNetworkGroup[];
    links: CommandCenterNetworkLink[];
  };
  insights: CommandCenterInsight[];
  activityTrend: Array<{ label: string; messages: number; searches: number; research: number }>;
  commercialTrend: Array<{ label: string; offers: number; orders: number; deals: number }>;
  orderChannels: Array<{ label: string; value: number; color: string }>;
  topOrganizations: Array<{
    id: string;
    name: string;
    ownerTypeLabel: string;
    score: string;
    inventory: string;
    offers: string;
    members: string;
    subscriptionStatus: string | null;
    actionModeEnabled: boolean;
    isVerified: boolean;
  }>;
  alerts: Array<{
    id: string;
    title: string;
    subtitle: string;
    status: string;
    kindLabel: string;
    createdAtLabel: string;
  }>;
  queueFocus: Array<{
    id: string;
    label: string;
    value: string;
    status: string;
    note: string;
  }>;
  dataHealth: Array<{
    id: string;
    label: string;
    status: string;
    value: string;
    note: string;
  }>;
  apiRisk: Array<{
    id: string;
    label: string;
    value: string;
  }>;
};

export type CommandCenterAnalyticsViewModel = {
  range: AdminCommandCenterRange;
  summaryMetrics: CommandCenterMetricCard[];
  commercial: {
    offerTrend: Array<{ label: string; offers: number; accepted: number; pending: number }>;
    orderFunnel: Array<{ label: string; value: number; color: string }>;
    orderChannels: Array<{ label: string; value: number; color: string }>;
    dealStages: Array<{ label: string; count: number; value: number }>;
    topSenders: Array<{
      id: string;
      name: string;
      ownerTypeLabel: string;
      offersCount: string;
      acceptedCount: string;
    }>;
    pipelineValue: string;
    pipelineFallbackCount: string;
  };
  partner: {
    onboardingTrend: Array<{ label: string; brokers: number; developers: number }>;
    verificationMixRows: Array<{
      label: string;
      new: number;
      inReview: number;
      approved: number;
      rejected: number;
    }>;
    subscriptionHealth: Array<{ label: string; value: number; color: string }>;
    actionMode: Array<{ label: string; value: number; color: string }>;
    topOrganizations: CommandCenterOverviewViewModel["topOrganizations"];
  };
  queue: {
    verificationAging: Array<{ label: string; value: number; color: string }>;
    orderAssignment: Array<{ label: string; value: number; color: string }>;
    orderStatusCounts: Array<{ label: string; value: number; color: string }>;
    diagnosticsByStatus: Array<{ label: string; value: number; color: string }>;
    diagnosticsByStage: Array<{ label: string; value: number; color: string }>;
    recentItems: Array<{
      id: string;
      title: string;
      subtitle: string;
      status: string;
      createdAtLabel: string;
    }>;
  };
};

const CHANNEL_COLORS = ["var(--chart-blue)", "var(--chart-cyan)", "var(--chart-teal)"] as const;
const FUNNEL_COLORS = [
  "var(--chart-blue)",
  "var(--chart-cyan)",
  "var(--chart-teal)",
  "var(--chart-amber)",
  "var(--chart-purple)",
  "var(--chart-rose)",
  "var(--chart-5)",
] as const;
const HEALTH_COLORS = [
  "var(--chart-blue)",
  "var(--chart-teal)",
  "var(--chart-amber)",
  "var(--chart-rose)",
  "var(--chart-purple)",
] as const;

function sumValues<T>(items: T[], selector: (item: T) => number) {
  return items.reduce((total, item) => total + selector(item), 0);
}

function ownerTypeLabel(value: "broker" | "red") {
  return value === "broker" ? "وسيط" : "مطور";
}

function alertKindLabel(value: "verification" | "diagnostic" | "order") {
  if (value === "verification") {
    return "التوثيق";
  }

  if (value === "diagnostic") {
    return "التشخيص";
  }

  return "الطلبات";
}

function statusEntries(record: Record<string, number>) {
  return Object.entries(record).map(([label, value], index) => ({
    label,
    value,
    color: HEALTH_COLORS[index % HEALTH_COLORS.length],
  }));
}

function buildTopOrganizationsViewModel(
  organizations: OverviewPayload["topOrganizations"] | PartnerPayload["topOrganizations"],
): CommandCenterOverviewViewModel["topOrganizations"] {
  return organizations.map((organization) => ({
    id: organization.organizationKey,
    name: organization.name,
    ownerTypeLabel: ownerTypeLabel(organization.ownerType),
    score: formatNumber(organization.score),
    inventory: formatNumber(organization.inventoryCount),
    offers: formatNumber(organization.offersCount),
    members: formatNumber(organization.membersCount),
    subscriptionStatus: organization.subscriptionStatus,
    actionModeEnabled: organization.actionModeEnabled,
    isVerified: organization.isVerified,
  }));
}

function buildInsights(args: {
  overview: OverviewPayload;
  commercial: CommercialPayload;
  queue: QueuePayload;
}): CommandCenterInsight[] {
  const demandPerVerifiedPartner =
    args.overview.partnerHealth.verifiedOrganizations > 0
      ? args.overview.kpis.activeUsers.current / args.overview.partnerHealth.verifiedOrganizations
      : args.overview.kpis.activeUsers.current;
  const verificationBacklog =
    args.queue.summary.newVerifications + args.queue.summary.inReviewVerifications;
  const assignmentGap = args.queue.summary.unassignedOrders;
  const apiRisk = args.overview.apiRisk.deniedKeys + args.overview.apiRisk.suspendedKeys + args.overview.apiRisk.revokedKeys;
  const pipelinePressure =
    args.commercial.summary.openPipelineCount > 0
      ? args.commercial.summary.pipelineFallbackCount / args.commercial.summary.openPipelineCount
      : 0;

  const insights: CommandCenterInsight[] = [];

  if (demandPerVerifiedPartner >= 18) {
    insights.push({
      id: "demand-vs-partners",
      title: "الطلب أسرع من سعة الشركاء",
      body: `متوسط الحمل الحالي يقترب من ${formatNumber(demandPerVerifiedPartner)} مستخدمًا نشطًا لكل جهة موثقة، ما يشير إلى حاجة لتوسيع الشركاء أو رفع اعتماد الجهات المؤهلة.`,
      tone: "warn",
    });
  }

  if (verificationBacklog + assignmentGap >= args.overview.kpis.qualifiedOrders.current) {
    insights.push({
      id: "queue-pressure",
      title: "العوائق التشغيلية تستهلك التحويل",
      body: `طلبات غير مسندة (${formatNumber(assignmentGap)}) مع تراكم توثيق (${formatNumber(verificationBacklog)}) تقترب من حجم الطلبات المؤهلة، لذلك أولوية اليوم هي إزالة الاختناق قبل زيادة الإنفاق على الطلب.`,
      tone: "focus",
    });
  }

  if (pipelinePressure >= 0.35) {
    insights.push({
      id: "pipeline-valuation-risk",
      title: "خط الصفقات يحتاج استكمال قيمه التجارية",
      body: `${formatNumber(args.commercial.summary.pipelineFallbackCount)} من الصفقات المفتوحة بلا قيمة مالية موثقة، وهذا يضعف دقة قراءة الإيراد المتوقع داخل القيادة التجارية.`,
      tone: "focus",
    });
  }

  if (apiRisk > 0 || args.overview.partnerHealth.restrictedOrganizations > 0) {
    insights.push({
      id: "integration-risk",
      title: "مخاطر تكامل تحتاج متابعة",
      body: `هناك ${formatNumber(apiRisk)} مفاتيح عالية المخاطر و${formatNumber(args.overview.partnerHealth.restrictedOrganizations)} جهات مقيدة بالسياسات، ما قد يقطع التدفق بين الطلب والتفعيل لدى بعض الشركاء.`,
      tone: "warn",
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "healthy-system",
      title: "التدفق متوازن حاليًا",
      body: "الطلب، القنوات، وسعة الشركاء متقاربة نسبيًا في هذه النافذة، لذلك يمكن تشغيل الفريق على تحسين جودة الإغلاق بدلًا من إطفاء الحرائق.",
      tone: "positive",
    });
  }

  return insights.slice(0, 3);
}

/**
 * WHY:   The overview route should consume one UI-ready model instead of stitching raw command-center DTOs directly into JSX.
 * WHAT:  Maps live overview, commercial, and queue payloads into dashboard-ready cards, network groups, alerts, and operator insights.
 * HOW:   Aggregates low-level metrics into the five business groups requested for the network chart and formats supporting panels for direct rendering.
 */
export function buildOverviewCommandCenterViewModel(args: {
  range: AdminCommandCenterRange;
  overview: OverviewPayload;
  commercial: CommercialPayload;
  queue: QueuePayload;
}): CommandCenterOverviewViewModel {
  const demandMessages = sumValues(args.overview.activityTrend, (item) => item.messages);
  const demandSearches = sumValues(args.overview.activityTrend, (item) => item.searches);
  const demandResearch = sumValues(args.overview.activityTrend, (item) => item.research);
  const channelTotal = sumValues(args.commercial.orderChannels, (item) => item.value);
  const verificationBacklog =
    args.overview.queueHealth.newVerifications + args.overview.queueHealth.inReviewVerifications;
  const riskTotal =
    args.overview.queueHealth.unassignedOrders +
    verificationBacklog +
    args.overview.queueHealth.errorEvents +
    args.overview.apiRisk.deniedKeys +
    args.overview.partnerHealth.restrictedOrganizations;

  return {
    range: args.range,
    metrics: [
      {
        key: "active-users",
        label: "الجمهور النشط",
        value: formatNumber(args.overview.kpis.activeUsers.current),
        delta: args.overview.kpis.activeUsers.delta,
        hint: "نشاط فعلي عبر الرسائل، البحث، والمعرفة.",
      },
      {
        key: "offers",
        label: "حجم العروض",
        value: formatNumber(args.overview.kpis.offerVolume.current),
        delta: args.overview.kpis.offerVolume.delta,
        hint: "العروض الداخلة خلال النافذة المختارة.",
      },
      {
        key: "qualified-orders",
        label: "طلبات مؤهلة",
        value: formatNumber(args.overview.kpis.qualifiedOrders.current),
        delta: args.overview.kpis.qualifiedOrders.delta,
        hint: "طلبات وصلت لمرحلة الجدوى التجارية.",
      },
      {
        key: "closed-wins",
        label: "إغلاقات رابحة",
        value: formatNumber(args.overview.kpis.closedWins.current),
        delta: args.overview.kpis.closedWins.delta,
        hint: "التحويل النهائي داخل دورة الطلبات.",
      },
      {
        key: "pipeline-value",
        label: "قيمة الخط المفتوح",
        value: formatCurrency(args.overview.pipeline.value),
        hint: `${formatNumber(args.overview.pipeline.dealCount)} صفقة مفتوحة، ${formatNumber(args.overview.pipeline.valuedDealCount)} منها لها قيمة مثبتة.`,
      },
      {
        key: "risk-load",
        label: "العوائق المفتوحة",
        value: formatNumber(riskTotal),
        hint: "طلبات غير مسندة، توثيق متراكم، أخطاء، ومخاطر تكامل.",
      },
    ],
    network: {
      groups: [
        {
          id: "demand",
          label: "الطلب",
          summary: "حجم الإشارة القادمة من السوق.",
          totalValue: Math.max(args.overview.kpis.activeUsers.current + demandMessages + demandSearches + demandResearch, 1),
          totalDisplayValue: formatNumber(args.overview.kpis.activeUsers.current),
          accent: "var(--chart-blue)",
          metrics: [
            { id: "active-users", label: "مستخدمون نشطون", value: args.overview.kpis.activeUsers.current, displayValue: formatNumber(args.overview.kpis.activeUsers.current) },
            { id: "messages", label: "رسائل", value: demandMessages, displayValue: formatNumber(demandMessages) },
            { id: "searches", label: "بحث", value: demandSearches, displayValue: formatNumber(demandSearches) },
            { id: "research", label: "معرفة", value: demandResearch, displayValue: formatNumber(demandResearch) },
          ],
        },
        {
          id: "channels",
          label: "القنوات",
          summary: "من أين يمر الطلب التجاري.",
          totalValue: Math.max(channelTotal, 1),
          totalDisplayValue: formatNumber(channelTotal),
          accent: "var(--chart-cyan)",
          metrics: args.commercial.orderChannels.map((item, index) => ({
            id: `channel-${index}`,
            label: item.label,
            value: item.value,
            displayValue: formatNumber(item.value),
          })),
        },
        {
          id: "partners",
          label: "سعة الشركاء",
          summary: "من يستطيع استقبال الطلب وتحويله.",
          totalValue:
            Math.max(
              args.overview.partnerHealth.brokers +
                args.overview.partnerHealth.developers +
                args.overview.partnerHealth.verifiedOrganizations +
                args.overview.partnerHealth.actionModeOrganizations,
              1,
            ),
          totalDisplayValue: formatNumber(args.overview.partnerHealth.verifiedOrganizations),
          accent: "var(--chart-teal)",
          metrics: [
            { id: "brokers", label: "وسطاء", value: args.overview.partnerHealth.brokers, displayValue: formatNumber(args.overview.partnerHealth.brokers) },
            { id: "developers", label: "مطورون", value: args.overview.partnerHealth.developers, displayValue: formatNumber(args.overview.partnerHealth.developers) },
            { id: "verified", label: "جهات موثقة", value: args.overview.partnerHealth.verifiedOrganizations, displayValue: formatNumber(args.overview.partnerHealth.verifiedOrganizations) },
            { id: "action-mode", label: "Action Mode", value: args.overview.partnerHealth.actionModeOrganizations, displayValue: formatNumber(args.overview.partnerHealth.actionModeOrganizations) },
          ],
        },
        {
          id: "pipeline",
          label: "الخط التجاري",
          summary: "كيف يتحول الطلب إلى صفقات وإيراد.",
          totalValue:
            Math.max(
              args.overview.kpis.offerVolume.current +
                args.overview.kpis.qualifiedOrders.current +
                args.overview.kpis.closedWins.current +
                args.overview.pipeline.dealCount,
              1,
            ),
          totalDisplayValue: formatCurrency(args.overview.pipeline.value),
          accent: "var(--chart-amber)",
          metrics: [
            { id: "offers", label: "عروض", value: args.overview.kpis.offerVolume.current, displayValue: formatNumber(args.overview.kpis.offerVolume.current) },
            { id: "qualified", label: "طلبات مؤهلة", value: args.overview.kpis.qualifiedOrders.current, displayValue: formatNumber(args.overview.kpis.qualifiedOrders.current) },
            { id: "pipeline-open", label: "صفقات مفتوحة", value: args.overview.pipeline.dealCount, displayValue: formatNumber(args.overview.pipeline.dealCount) },
            { id: "wins", label: "إغلاقات رابحة", value: args.overview.kpis.closedWins.current, displayValue: formatNumber(args.overview.kpis.closedWins.current) },
          ],
        },
        {
          id: "risk",
          label: "المخاطر التشغيلية",
          summary: "ما الذي يبطئ أو يهدد التدفق.",
          totalValue: Math.max(riskTotal, 1),
          totalDisplayValue: formatNumber(riskTotal),
          accent: "var(--chart-rose)",
          metrics: [
            { id: "unassigned", label: "طلبات غير مسندة", value: args.overview.queueHealth.unassignedOrders, displayValue: formatNumber(args.overview.queueHealth.unassignedOrders) },
            { id: "verification", label: "تراكم التوثيق", value: verificationBacklog, displayValue: formatNumber(verificationBacklog) },
            { id: "errors", label: "أخطاء حديثة", value: args.overview.queueHealth.errorEvents, displayValue: formatNumber(args.overview.queueHealth.errorEvents) },
            { id: "api-risk", label: "رفض API وسياسات", value: args.overview.apiRisk.deniedKeys + args.overview.partnerHealth.restrictedOrganizations, displayValue: formatNumber(args.overview.apiRisk.deniedKeys + args.overview.partnerHealth.restrictedOrganizations) },
          ],
        },
      ],
      links: [
        {
          id: "demand-channels",
          sourceId: "demand",
          targetId: "channels",
          value: Math.max(channelTotal, 1),
          label: "مرور الطلب",
          displayValue: formatNumber(channelTotal),
        },
        {
          id: "channels-partners",
          sourceId: "channels",
          targetId: "partners",
          value: Math.max(args.overview.partnerHealth.verifiedOrganizations + args.overview.partnerHealth.actionModeOrganizations, 1),
          label: "قدرة الاستيعاب",
          displayValue: formatNumber(args.overview.partnerHealth.verifiedOrganizations + args.overview.partnerHealth.actionModeOrganizations),
        },
        {
          id: "partners-pipeline",
          sourceId: "partners",
          targetId: "pipeline",
          value: Math.max(args.overview.kpis.qualifiedOrders.current + args.overview.kpis.offerVolume.current, 1),
          label: "تحويل تجاري",
          displayValue: formatNumber(args.overview.kpis.qualifiedOrders.current + args.overview.kpis.offerVolume.current),
        },
        {
          id: "pipeline-risk",
          sourceId: "pipeline",
          targetId: "risk",
          value: Math.max(riskTotal, 1),
          label: "نقاط التعثر",
          displayValue: formatNumber(riskTotal),
        },
      ],
    },
    insights: buildInsights(args),
    activityTrend: args.overview.activityTrend,
    commercialTrend: args.overview.commercialTrend,
    orderChannels: args.commercial.orderChannels.map((item, index) => ({
      label: item.label,
      value: item.value,
      color: CHANNEL_COLORS[index % CHANNEL_COLORS.length],
    })),
    topOrganizations: buildTopOrganizationsViewModel(args.overview.topOrganizations),
    alerts: args.overview.alerts.map((alert) => ({
      id: alert.id,
      title: alert.title,
      subtitle: alert.subtitle,
      status: alert.status,
      kindLabel: alertKindLabel(alert.kind),
      createdAtLabel: formatDateTime(alert.createdAt),
    })),
    queueFocus: [
      {
        id: "unassigned-orders",
        label: "طلبات غير مسندة",
        value: formatNumber(args.queue.summary.unassignedOrders),
        status: args.queue.summary.unassignedOrders > 0 ? "warning" : "success",
        note: "تحتاج إسنادًا مباشرًا لمسار المتابعة.",
      },
      {
        id: "new-verifications",
        label: "توثيق جديد",
        value: formatNumber(args.queue.summary.newVerifications),
        status: args.queue.summary.newVerifications > 0 ? "new" : "success",
        note: "طلبات دخلت الطابور وتحتاج فرزًا أوليًا.",
      },
      {
        id: "in-review-verifications",
        label: "توثيق قيد المراجعة",
        value: formatNumber(args.queue.summary.inReviewVerifications),
        status: args.queue.summary.inReviewVerifications > 0 ? "in_review" : "success",
        note: "مرحلة الفحص التي قد تبطئ تفعيل الشركاء.",
      },
      {
        id: "recent-errors",
        label: "أخطاء حديثة",
        value: formatNumber(args.queue.summary.recentErrors),
        status: args.queue.summary.recentErrors > 0 ? "failed" : "success",
        note: "أحداث تقنية مرتبطة بالبحث والتنبيهات.",
      },
    ],
    dataHealth: args.overview.dataHealth.map((item, index) => ({
      id: `data-health-${index}`,
      label: item.summaryType,
      status: item.status,
      value:
        typeof item.value === "number"
          ? formatNumber(item.value)
          : typeof item.recordCount === "number"
            ? formatNumber(item.recordCount)
            : "غير متوفر",
      note:
        item.staleSince != null
          ? `متأخر منذ ${formatDateTime(item.staleSince)}`
          : `آخر تحديث ${formatDateTime(item.lastAggregatedAt)}`,
    })),
    apiRisk: [
      { id: "active-keys", label: "مفاتيح نشطة", value: formatNumber(args.overview.apiRisk.activeKeys) },
      { id: "origin-restrictions", label: "قيود Origin", value: formatNumber(args.overview.apiRisk.keysWithOriginRestrictions) },
      { id: "denied-keys", label: "رفض حديث", value: formatNumber(args.overview.apiRisk.deniedKeys) },
      { id: "suspended-keys", label: "معلّقة", value: formatNumber(args.overview.apiRisk.suspendedKeys + args.overview.apiRisk.revokedKeys) },
    ],
  };
}

/**
 * WHY:   The analytics route needs one render-ready model that groups the live commercial, partner, and queue datasets into chart-friendly sections.
 * WHAT:  Maps the three command-center analytics payloads into summary cards, chart rows, and ranked operational lists.
 * HOW:   Preserves the source metrics while normalizing labels, colors, and table/list structures for the admin presentation layer.
 */
export function buildAnalyticsCommandCenterViewModel(args: {
  range: AdminCommandCenterRange;
  commercial: CommercialPayload;
  partner: PartnerPayload;
  queue: QueuePayload;
}): CommandCenterAnalyticsViewModel {
  return {
    range: args.range,
    summaryMetrics: [
      {
        key: "offers",
        label: "العروض",
        value: formatNumber(args.commercial.summary.offers.current),
        delta: args.commercial.summary.offers.delta,
        hint: "حجم العروض في النافذة الحالية.",
      },
      {
        key: "accepted-offers",
        label: "العروض المقبولة",
        value: formatNumber(args.commercial.summary.acceptedOffers.current),
        delta: args.commercial.summary.acceptedOffers.delta,
        hint: "العروض التي اجتازت بوابة القبول.",
      },
      {
        key: "pipeline-value",
        label: "قيمة الخط",
        value: formatCurrency(args.commercial.summary.pipelineValue),
        hint: `${formatNumber(args.commercial.summary.openPipelineCount)} صفقة مفتوحة.`,
      },
      {
        key: "active-subscriptions",
        label: "اشتراكات نشطة",
        value: formatNumber(args.partner.summary.activeSubscriptions),
        hint: `${formatNumber(args.partner.summary.trialSubscriptions)} اشتراكًا تجريبيًا.`,
      },
      {
        key: "unassigned-orders",
        label: "طلبات غير مسندة",
        value: formatNumber(args.queue.summary.unassignedOrders),
        hint: "الطلبات التي لم تصل بعد إلى مالك تشغيلي.",
      },
      {
        key: "recent-errors",
        label: "أخطاء حديثة",
        value: formatNumber(args.queue.summary.recentErrors),
        hint: "إشارات تقنية تحتاج تتبعًا مباشرًا.",
      },
    ],
    commercial: {
      offerTrend: args.commercial.offerTrend,
      orderFunnel: args.commercial.orderFunnel.map((item, index) => ({
        label: item.label,
        value: item.value,
        color: FUNNEL_COLORS[index % FUNNEL_COLORS.length],
      })),
      orderChannels: args.commercial.orderChannels.map((item, index) => ({
        label: item.label,
        value: item.value,
        color: CHANNEL_COLORS[index % CHANNEL_COLORS.length],
      })),
      dealStages: args.commercial.dealStages.map((item) => ({
        label: item.stage,
        count: item.count,
        value: item.value,
      })),
      topSenders: args.commercial.topSenders.map((sender) => ({
        id: sender.organizationKey,
        name: sender.name,
        ownerTypeLabel: ownerTypeLabel(sender.ownerType),
        offersCount: formatNumber(sender.offersCount),
        acceptedCount: formatNumber(sender.acceptedCount),
      })),
      pipelineValue: formatCurrency(args.commercial.summary.pipelineValue),
      pipelineFallbackCount: formatNumber(args.commercial.summary.pipelineFallbackCount),
    },
    partner: {
      onboardingTrend: args.partner.onboardingTrend,
      verificationMixRows: [
        { label: "وسطاء", ...args.partner.verificationMix.brokers },
        { label: "مطورون", ...args.partner.verificationMix.developers },
      ],
      subscriptionHealth: args.partner.subscriptionHealth.map((item, index) => ({
        label: item.label,
        value: item.value,
        color: HEALTH_COLORS[index % HEALTH_COLORS.length],
      })),
      actionMode: [
        { label: "وسطاء مفعلون", value: args.partner.actionModeAdoption.brokers, color: "var(--chart-teal)" },
        { label: "مطورون مفعلون", value: args.partner.actionModeAdoption.developers, color: "var(--chart-blue)" },
        { label: "إجمالي مؤهل", value: args.partner.actionModeAdoption.totalEligible, color: "var(--chart-amber)" },
      ],
      topOrganizations: buildTopOrganizationsViewModel(args.partner.topOrganizations),
    },
    queue: {
      verificationAging: args.queue.verificationAging.map((item, index) => ({
        label: item.label,
        value: item.value,
        color: HEALTH_COLORS[index % HEALTH_COLORS.length],
      })),
      orderAssignment: args.queue.orderAssignment.map((item, index) => ({
        label: item.label,
        value: item.value,
        color: CHANNEL_COLORS[index % CHANNEL_COLORS.length],
      })),
      orderStatusCounts: args.queue.orderStatusCounts.map((item, index) => ({
        label: item.label,
        value: item.value,
        color: FUNNEL_COLORS[index % FUNNEL_COLORS.length],
      })),
      diagnosticsByStatus: statusEntries(args.queue.diagnostics.byStatus),
      diagnosticsByStage: statusEntries(args.queue.diagnostics.byStage),
      recentItems: args.queue.recentQueueItems.map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        status: item.status,
        createdAtLabel: formatDateTime(item.createdAt),
      })),
    },
  };
}
