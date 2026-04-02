import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "../_generated/server";
import { buildAvatarLabel } from "./crm/mappers";
import { requireOwnedPropertyAccess, requirePropertyReadAccess } from "./propertyAccessControl";

type AnalyticsCtx = QueryCtx | MutationCtx;
type DealRecord = Doc<"deals">;
type OfferCaseRecord = Doc<"offerCases">;
type OfferPackageRecord = Doc<"offerPackages">;
type OfferActivityRecord = Doc<"offerActivities">;
type CrmClientRecord = Doc<"crmClients">;
type ProjectAnalyticsEventType =
  | "project_detail_view"
  | "project_analytics_view"
  | "project_analyze_click"
  | "project_edit_click"
  | "project_create_offer_click"
  | "project_open_inbox_click"
  | "project_asset_open_click";
type BrokerAnalyticsState =
  | "viewer_only"
  | "offer_active"
  | "client_linked"
  | "closed_won"
  | "closed_lost";
type DeveloperStageKey = DealRecord["stage"];
type CustomerRelationType = "broker_managed" | "internal_client";
type BrokerActivityKey =
  | "new_client"
  | "in_call"
  | "in_stage"
  | "permit_review"
  | "closed_won"
  | "closed_lost";

const VISIBILITY_TREND_DAYS = 14;

const VIEW_EVENT_TYPES = new Set<ProjectAnalyticsEventType>(["project_detail_view"]);
const CLICK_EVENT_TYPES = new Set<ProjectAnalyticsEventType>([
  "project_analyze_click",
  "project_edit_click",
  "project_create_offer_click",
  "project_open_inbox_click",
  "project_asset_open_click",
]);

function isActiveDeal(deal: DealRecord) {
  return !deal.archivedAt;
}

function isActiveCase(stage: OfferCaseRecord["stage"]) {
  return !["closed_won", "closed_lost", "archived"].includes(stage);
}

function dealStageLabel(stage: DealRecord["stage"]) {
  if (stage === "new") return "عميل جديد";
  if (stage === "contacted") return "تم التواصل";
  if (stage === "negotiation") return "تفاوض";
  if (stage === "won") return "صفقة ناجحة";
  return "صفقة مفقودة";
}

function developerStageLabel(stage: DeveloperStageKey) {
  if (stage === "new") return "مرحلة جديدة";
  if (stage === "contacted") return "مرحلة الاتصال";
  if (stage === "negotiation") return "مرحلة التفاوض";
  if (stage === "won") return "إغلاق ناجح";
  return "إغلاق غير مكتمل";
}

function mapOfferCaseStageToDeveloperStage(stage: OfferCaseRecord["stage"]): DeveloperStageKey {
  if (stage === "agreed") return "negotiation";
  if (stage === "engaged") return "contacted";
  if (stage === "closed_won") return "won";
  if (stage === "closed_lost" || stage === "archived") return "lost";
  return "new";
}

function offerCaseStageLabel(stage: OfferCaseRecord["stage"]) {
  if (stage === "draft") return "مسودة";
  if (stage === "open") return "عرض مفتوح";
  if (stage === "targeted") return "عرض موجّه";
  if (stage === "engaged") return "تعاون نشط";
  if (stage === "agreed") return "تم الاتفاق";
  if (stage === "closed_won") return "إغلاق ناجح";
  if (stage === "closed_lost") return "إغلاق غير مكتمل";
  return "مؤرشف";
}

function relationTypeLabel(relationType: CustomerRelationType) {
  if (relationType === "broker_managed") return "عميل عبر وسيط";
  return "عميل داخلي";
}

function normalizeRelationType(deal: DealRecord): CustomerRelationType {
  if (deal.relationType === "broker_managed" || deal.relationType === "internal_client") {
    return deal.relationType;
  }
  return deal.relatedBrokerId ? "broker_managed" : "internal_client";
}

function eventTitle(eventType: ProjectAnalyticsEventType) {
  if (eventType === "project_detail_view") return "تمت مشاهدة تفاصيل المشروع";
  if (eventType === "project_analytics_view") return "تم فتح صفحة التحليل";
  if (eventType === "project_analyze_click") return "تم الضغط على تحليل المشروع";
  if (eventType === "project_edit_click") return "تم الضغط على تعديل المشروع";
  if (eventType === "project_create_offer_click") return "تم بدء إنشاء عرض من المشروع";
  if (eventType === "project_open_inbox_click") return "تم فتح المحادثات من المشروع";
  return "تم فتح ملف مرتبط بالمشروع";
}

function brokerStateLabel(state: BrokerAnalyticsState) {
  if (state === "viewer_only") return "مشاهد فقط";
  if (state === "offer_active") return "عرض نشط";
  if (state === "client_linked") return "عميل مرتبط";
  if (state === "closed_won") return "إغلاق ناجح";
  return "إغلاق غير مكتمل";
}

function interactionLabel(eventType: ProjectAnalyticsEventType) {
  if (eventType === "project_detail_view") return "فتح التفاصيل";
  if (eventType === "project_analytics_view") return "فتح التحليل";
  if (eventType === "project_analyze_click") return "ضغط تحليل";
  if (eventType === "project_edit_click") return "ضغط تعديل";
  if (eventType === "project_create_offer_click") return "بدء عرض";
  if (eventType === "project_open_inbox_click") return "فتح المحادثات";
  return "فتح ملف";
}

function brokerActivityLabel(activityKey: BrokerActivityKey) {
  if (activityKey === "new_client") return "عميل جديد";
  if (activityKey === "in_call") return "في مكالمة";
  if (activityKey === "in_stage") return "في مرحلة";
  if (activityKey === "permit_review") return "مراجعة التصريح";
  if (activityKey === "closed_won") return "إغلاق ناجح";
  return "إغلاق غير مكتمل";
}

function brokerActivityPriority(activityKey: BrokerActivityKey) {
  if (activityKey === "closed_won") return 5;
  if (activityKey === "closed_lost") return 4;
  if (activityKey === "permit_review") return 3;
  if (activityKey === "in_stage") return 2;
  if (activityKey === "in_call") return 1;
  return 0;
}

function offerActivityTitle(activity: OfferActivityRecord) {
  if (activity.message?.trim()) return activity.message.trim();
  if (activity.kind === "case_created") return "تم فتح متابعة عميل";
  if (activity.kind === "case_published") return "تم نشر الحالة";
  if (activity.kind === "participant_targeted") return "تم توجيه الحالة إلى وسيط";
  if (activity.kind === "engaged") return "بدأ الوسيط العمل على الحالة";
  if (activity.kind === "accepted") return "تم قبول التعاون";
  if (activity.kind === "rejected") return "تم رفض التعاون";
  if (activity.kind === "agreed") return "تم الاتفاق مع العميل";
  if (activity.kind === "closed_won") return "تم إغلاق العميل بنجاح";
  if (activity.kind === "closed_lost") return "تم فقدان العميل";
  if (activity.kind === "archived") return "تمت أرشفة الحالة";
  return "تمت إضافة ملاحظة على الحالة";
}

function normalizePermitStatus(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

function isPermitReviewStatus(value: string | null | undefined) {
  const normalized = normalizePermitStatus(value);
  if (!normalized) return false;
  const lower = normalized.toLowerCase();
  return /review|pending|waiting|required|needed|permit|permit review|مراجعة|قيد|بانتظار|مطلوب/.test(lower);
}

function resolveBrokerActivity(args: {
  deal?: DealRecord | null;
  offerCase?: OfferCaseRecord | null;
  offerPackage?: OfferPackageRecord | null;
}): BrokerActivityKey {
  const { deal, offerCase, offerPackage } = args;

  if (deal?.stage === "won" || offerCase?.stage === "closed_won") return "closed_won";
  if (deal?.stage === "lost" || offerCase?.stage === "closed_lost") return "closed_lost";

  if (isPermitReviewStatus(offerPackage?.permitStatus)) {
    return "permit_review";
  }

  if (deal?.stage === "contacted") return "in_call";
  if (deal?.stage === "negotiation") return "in_stage";
  if (deal?.stage === "new") return "new_client";

  if (offerCase) {
    if (["draft", "open", "targeted", "engaged", "agreed"].includes(offerCase.stage)) {
      return "in_stage";
    }
  }

  return "new_client";
}

function resolveBrokerCurrentActivity(customers: Array<{ activityKey: BrokerActivityKey }>) {
  return customers.reduce<BrokerActivityKey | null>((best, customer) => {
    if (!best) return customer.activityKey;
    return brokerActivityPriority(customer.activityKey) > brokerActivityPriority(best) ? customer.activityKey : best;
  }, null);
}

function getUtcDateKey(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function buildTrendWindow(totalDays: number) {
  const days: { dateKey: string; label: string }[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (let offset = totalDays - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - offset);
    const dateKey = date.toISOString().slice(0, 10);
    const label = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(date);
    days.push({ dateKey, label });
  }

  return days;
}

function actorAudience(role: string | undefined) {
  if (role === "admin" || role === "broker" || role === "developer" || role === "user") {
    return role;
  }
  if (role === "RED") {
    return "developer";
  }
  return undefined;
}

async function getUserProfileByAuthUserId(ctx: AnalyticsCtx, authUserId: string) {
  return ctx.db
    .query("userProfiles")
    .withIndex("authUserId", (q) => q.eq("authUserId", authUserId))
    .unique();
}

async function listProfilesByBrokerId(ctx: AnalyticsCtx, brokerId: Id<"brokers">) {
  return ctx.db
    .query("userProfiles")
    .withIndex("brokerId", (q) => q.eq("brokerId", brokerId))
    .collect();
}

async function listOfferCasesForProperty(ctx: QueryCtx, propertyId: Id<"properties">) {
  const packages = await ctx.db
    .query("offerPackages")
    .withIndex("propertyId", (q) => q.eq("propertyId", propertyId))
    .collect();
  const cases = (
    await Promise.all(
      packages.map((entry) =>
        ctx.db
          .query("offerCases")
          .withIndex("offerPackageId", (q) => q.eq("offerPackageId", entry._id))
          .collect(),
      ),
    )
  ).flat();

  return { packages, cases };
}

async function listParticipantsForCases(ctx: QueryCtx, caseIds: Id<"offerCases">[]) {
  return (
    await Promise.all(
      caseIds.map((offerCaseId) =>
        ctx.db
          .query("offerCaseParticipants")
          .withIndex("offerCaseId", (q) => q.eq("offerCaseId", offerCaseId))
          .collect(),
      ),
    )
  ).flat();
}

async function listActivitiesForCases(ctx: QueryCtx, caseIds: Id<"offerCases">[]) {
  return (
    await Promise.all(
      caseIds.map((offerCaseId) =>
        ctx.db
          .query("offerActivities")
          .withIndex("offerCaseId", (q) => q.eq("offerCaseId", offerCaseId))
          .collect(),
      ),
    )
  ).flat();
}

async function buildAnalytics(args: {
  ctx: QueryCtx;
  propertyId: Id<"properties">;
  ownerBrokerId?: Id<"brokers"> | undefined;
}) {
  const { ctx, propertyId, ownerBrokerId } = args;
  const [viewerAccessRows, deals, projectEvents, caseResult] = await Promise.all([
    ctx.db
      .query("propertyViewerAccess")
      .withIndex("propertyId", (q) => q.eq("propertyId", propertyId))
      .collect(),
    ctx.db
      .query("deals")
      .withIndex("propertyId", (q) => q.eq("propertyId", propertyId))
      .collect(),
    ctx.db
      .query("projectAnalyticsEvents")
      .withIndex("propertyId", (q) => q.eq("propertyId", propertyId))
      .collect(),
    listOfferCasesForProperty(ctx, propertyId),
  ]);

  const offerPackages = caseResult.packages;
  const offerCases = caseResult.cases;
  const [participants, offerActivities, viewerProfiles, actorProfiles] = await Promise.all([
    listParticipantsForCases(
      ctx,
      offerCases.map((entry) => entry._id),
    ),
    listActivitiesForCases(
      ctx,
      offerCases.map((entry) => entry._id),
    ),
    Promise.all(
      viewerAccessRows
        .filter((entry) => entry.status === "active")
        .map((entry) => getUserProfileByAuthUserId(ctx, entry.authUserId)),
    ),
    Promise.all(
      [...new Set(projectEvents.map((entry) => entry.actorAuthUserId).filter((entry): entry is string => Boolean(entry)))]
        .map((authUserId) => getUserProfileByAuthUserId(ctx, authUserId)),
    ),
  ]);

  const crmClientIds = new Set<Id<"crmClients">>();
  for (const deal of deals) {
    if (deal.crmClientId) crmClientIds.add(deal.crmClientId);
  }
  for (const offerCase of offerCases) {
    if (offerCase.clientContext?.crmClientId) crmClientIds.add(offerCase.clientContext.crmClientId);
  }
  const crmClients = await Promise.all([...crmClientIds].map((crmClientId) => ctx.db.get(crmClientId)));
  const crmClientsById = new Map<string, CrmClientRecord>();
  for (const crmClient of crmClients) {
    if (crmClient?._id) {
      crmClientsById.set(String(crmClient._id), crmClient);
    }
  }
  const offerPackagesById = new Map<string, OfferPackageRecord>();
  for (const offerPackage of offerPackages) {
    offerPackagesById.set(String(offerPackage._id), offerPackage);
  }

  const activeViewerRows = viewerAccessRows.filter((entry) => entry.status === "active");
  const nonArchivedDeals = deals.filter(isActiveDeal);
  const activeCases = offerCases.filter((entry) => isActiveCase(entry.stage));
  const totalViews = projectEvents.filter((entry) => VIEW_EVENT_TYPES.has(entry.eventType as ProjectAnalyticsEventType)).length;
  const totalClicks = projectEvents.filter((entry) => CLICK_EVENT_TYPES.has(entry.eventType as ProjectAnalyticsEventType)).length;

  const profilesByAuthUserId = new Map<string, Doc<"userProfiles">>();
  for (const profile of [...viewerProfiles, ...actorProfiles]) {
    if (profile?.authUserId) {
      profilesByAuthUserId.set(profile.authUserId, profile as Doc<"userProfiles">);
    }
  }

  const brokerIds = new Set<Id<"brokers">>();
  for (const participant of participants) {
    if (participant.brokerId) brokerIds.add(participant.brokerId);
  }
  for (const deal of nonArchivedDeals) {
    if (deal.relatedBrokerId) brokerIds.add(deal.relatedBrokerId);
  }
  for (const profile of profilesByAuthUserId.values()) {
    if (profile.brokerId) brokerIds.add(profile.brokerId);
  }

  if (ownerBrokerId) {
    brokerIds.delete(ownerBrokerId);
  }

  const brokerTracking = await Promise.all(
    [...brokerIds].map(async (brokerId) => {
      const [broker, brokerProfiles] = await Promise.all([
        ctx.db.get(brokerId),
        listProfilesByBrokerId(ctx, brokerId),
      ]);
      const brokerAuthUserIds = new Set(
        brokerProfiles
          .map((profile) => profile.authUserId)
          .filter((authUserId): authUserId is string => Boolean(authUserId)),
      );

      const brokerDeals = nonArchivedDeals.filter((deal) => deal.relatedBrokerId === brokerId);
      const brokerCases = offerCases.filter((offerCase) =>
        participants.some(
          (participant) => participant.offerCaseId === offerCase._id && participant.brokerId === brokerId,
        ),
      );
      const brokerActivities = offerActivities.filter((activity) =>
        brokerCases.some((offerCase) => offerCase._id === activity.offerCaseId),
      );
      const brokerViewerRows = activeViewerRows.filter((entry) => brokerAuthUserIds.has(entry.authUserId));
      const brokerEvents = projectEvents.filter(
        (entry) => entry.actorAuthUserId && brokerAuthUserIds.has(entry.actorAuthUserId),
      );

      const views = brokerEvents.filter((entry) => VIEW_EVENT_TYPES.has(entry.eventType as ProjectAnalyticsEventType)).length;
      const clicks = brokerEvents.filter((entry) => CLICK_EVENT_TYPES.has(entry.eventType as ProjectAnalyticsEventType)).length;

      const latestDeal = [...brokerDeals].sort(
        (left, right) => (right.createdAt ?? right._creationTime) - (left.createdAt ?? left._creationTime),
      )[0] ?? null;
      const latestCase = [...brokerCases].sort((left, right) => right.lastActivityAt - left.lastActivityAt)[0] ?? null;

      let state: BrokerAnalyticsState = "viewer_only";
      if (brokerDeals.some((deal) => deal.stage === "won") || brokerCases.some((entry) => entry.stage === "closed_won")) {
        state = "closed_won";
      } else if (brokerDeals.some((deal) => deal.stage === "lost") || brokerCases.some((entry) => entry.stage === "closed_lost")) {
        state = "closed_lost";
      } else if (brokerDeals.some((deal) => normalizeRelationType(deal) === "broker_managed")) {
        state = "client_linked";
      } else if (brokerCases.some((entry) => isActiveCase(entry.stage))) {
        state = "offer_active";
      }

      const linkedClientName =
        latestDeal?.contactName ??
        (latestDeal?.crmClientId ? crmClientsById.get(String(latestDeal.crmClientId))?.name ?? null : null) ??
        latestCase?.clientContext?.clientName ??
        null;

      const standaloneCases = brokerCases.filter(
        (offerCase) =>
          !offerCase.linkedDealId ||
          !brokerDeals.some((deal) => String(deal._id) === String(offerCase.linkedDealId)),
      );

      const standaloneCustomerRows = standaloneCases.map((offerCase) => {
        const relatedPackage = offerPackagesById.get(String(offerCase.offerPackageId)) ?? null;
        const activityKey = resolveBrokerActivity({
          offerCase,
          offerPackage: relatedPackage,
        });

        return {
          id: `offer:${String(offerCase._id)}`,
          name: offerCase.clientContext?.clientName ?? offerCase.headline ?? "عميل من متابعة وسيط",
          relationType: "broker_managed" as const,
          relationTypeLabel: relationTypeLabel("broker_managed"),
          isTrackedCustomer: Boolean(offerCase.clientContext?.crmClientId || offerCase.linkedDealId),
          activityKey,
          activityLabel: brokerActivityLabel(activityKey),
          stageKey: mapOfferCaseStageToDeveloperStage(offerCase.stage),
          stageLabel: developerStageLabel(mapOfferCaseStageToDeveloperStage(offerCase.stage)),
          secondaryStateKey: offerCase.stage,
          secondaryStateLabel: offerCaseStageLabel(offerCase.stage),
          lastActivityAt: offerCase.lastActivityAt ?? offerCase.updatedAt ?? offerCase.createdAt,
        };
      });

      const customers = [
        ...brokerDeals.map((deal) => {
          const relationType = normalizeRelationType(deal);
          const relatedCase = deal.offerCaseId
            ? brokerCases.find((offerCase) => String(offerCase._id) === String(deal.offerCaseId))
            : null;
          const relatedPackage = relatedCase ? offerPackagesById.get(String(relatedCase.offerPackageId)) ?? null : null;
          const activityKey = resolveBrokerActivity({
            deal,
            offerCase: relatedCase,
            offerPackage: relatedPackage,
          });

          return {
            id: `deal:${String(deal._id)}`,
            name:
              deal.contactName ??
              (deal.crmClientId ? crmClientsById.get(String(deal.crmClientId))?.name ?? null : null) ??
              deal.title,
            relationType,
            relationTypeLabel: relationTypeLabel(relationType),
            isTrackedCustomer: true,
            activityKey,
            activityLabel: brokerActivityLabel(activityKey),
            stageKey: deal.stage,
            stageLabel: developerStageLabel(deal.stage),
            secondaryStateKey: relatedCase ? relatedCase.stage : null,
            secondaryStateLabel: relatedCase ? offerCaseStageLabel(relatedCase.stage) : null,
            lastActivityAt: deal.createdAt ?? deal._creationTime ?? null,
          };
        }),
        ...standaloneCustomerRows,
      ].sort((left, right) => (right.lastActivityAt ?? 0) - (left.lastActivityAt ?? 0));

      const currentActivityKey = resolveBrokerCurrentActivity(customers);

      const timeline = [
        ...brokerDeals.map((deal) => ({
          id: `deal:${String(deal._id)}`,
          kind: (deal.stage === "won" || deal.stage === "lost" ? "closed" : "deal") as
            | "deal"
            | "closed",
          title:
            deal.stage === "won"
              ? "تم إغلاق عميل بنجاح"
              : deal.stage === "lost"
                ? "تم فقدان عميل"
                : `العميل في ${developerStageLabel(deal.stage)}`,
          subtitle:
            deal.contactName ??
            (deal.crmClientId ? crmClientsById.get(String(deal.crmClientId))?.name ?? null : null) ??
            deal.title,
          createdAt: deal.createdAt ?? deal._creationTime ?? 0,
        })),
        ...standaloneCases.map((offerCase) => ({
          id: `offer-case:${String(offerCase._id)}`,
          kind: offerCase.stage === "closed_won" || offerCase.stage === "closed_lost" ? "closed" : "linked_customer",
          title:
            offerCase.clientContext?.crmClientId || offerCase.linkedDealId
              ? "تم ربط عميل بالمشروع"
              : `حالة ${offerCaseStageLabel(offerCase.stage)}`,
          subtitle: offerCase.clientContext?.clientName ?? offerCase.headline ?? "متابعة وسيط",
          createdAt: offerCase.createdAt,
        })),
        ...brokerActivities.map((activity) => ({
          id: `activity:${String(activity._id)}`,
          kind:
            activity.kind === "closed_won" || activity.kind === "closed_lost"
              ? ("closed" as const)
              : ("offer_case" as const),
          title: offerActivityTitle(activity),
          subtitle:
            brokerCases.find((offerCase) => offerCase._id === activity.offerCaseId)?.clientContext?.clientName ??
            "نشاط تعاون",
          createdAt: activity.createdAt,
        })),
      ]
        .filter((entry) => entry.createdAt > 0)
        .sort((left, right) => right.createdAt - left.createdAt)
        .slice(0, 12);

      const lastActivityAt = Math.max(
        0,
        ...brokerViewerRows.map((entry) => entry.updatedAt),
        ...brokerEvents.map((entry) => entry.createdAt),
        ...brokerActivities.map((entry) => entry.createdAt),
        ...brokerCases.map((entry) => entry.lastActivityAt),
        ...brokerDeals.map((entry) => entry.createdAt ?? entry._creationTime ?? 0),
      );

      return {
        brokerId: String(brokerId),
        brokerName: broker?.name ?? brokerProfiles[0]?.name ?? "وسيط غير محدد",
        brokerAvatarLabel: buildAvatarLabel(broker?.name ?? brokerProfiles[0]?.name ?? "وسيط"),
        brokerPhone: broker?.phone ?? brokerProfiles[0]?.email ?? null,
        state,
        stateLabel: brokerStateLabel(state),
        currentActivityKey,
        currentActivityLabel: currentActivityKey ? brokerActivityLabel(currentActivityKey) : null,
        linkedClientName,
        currentStageLabel: latestDeal
          ? dealStageLabel(latestDeal.stage)
          : latestCase
            ? offerCaseStageLabel(latestCase.stage)
            : brokerViewerRows.length > 0
              ? "فتح المشروع للمشاهدة"
              : "بدون نشاط",
        lastActivityAt: lastActivityAt > 0 ? lastActivityAt : null,
        views,
        clicks,
        totalCustomers: customers.length,
        trackedCustomers: customers.filter((entry) => entry.isTrackedCustomer).length,
        brokerManagedCustomers: customers.filter((entry) => entry.relationType === "broker_managed").length,
        internalCustomers: customers.filter((entry) => entry.relationType === "internal_client").length,
        closedWonCustomers: customers.filter((entry) => entry.stageKey === "won").length,
        closedLostCustomers: customers.filter((entry) => entry.stageKey === "lost").length,
        customers,
        timeline,
      };
    }),
  );

  const brokerRows = brokerTracking
    .map((entry) => ({
      brokerId: entry.brokerId,
      brokerName: entry.brokerName,
      brokerAvatarLabel: entry.brokerAvatarLabel,
      brokerPhone: entry.brokerPhone,
      state: entry.state,
      stateLabel: entry.stateLabel,
      linkedClientName: entry.customers[0]?.name ?? null,
      currentStageLabel: entry.customers[0]?.stageLabel ?? "بدون نشاط",
      lastActivityAt: entry.lastActivityAt,
      views: entry.views,
      clicks: entry.clicks,
    }))
    .sort((left, right) => (right.lastActivityAt ?? 0) - (left.lastActivityAt ?? 0));

  const stageSummary = [
    ...(["new", "contacted", "negotiation", "won", "lost"] as const)
      .map((stage) => ({
        key: `deal:${stage}`,
        label: dealStageLabel(stage),
        count: nonArchivedDeals.filter((deal) => deal.stage === stage).length,
        kind: "deal" as const,
      }))
      .filter((entry) => entry.count > 0),
    ...(["draft", "open", "targeted", "engaged", "agreed", "closed_won", "closed_lost", "archived"] as const)
      .map((stage) => ({
        key: `offer_case:${stage}`,
        label: offerCaseStageLabel(stage),
        count: offerCases.filter((offerCase) => offerCase.stage === stage).length,
        kind: "offer_case" as const,
      }))
      .filter((entry) => entry.count > 0),
  ];

  const recentEvents = [
    ...projectEvents.map((entry) => {
      const actor = entry.actorAuthUserId ? profilesByAuthUserId.get(entry.actorAuthUserId) : null;
      return {
        id: `event:${String(entry._id)}`,
        title: eventTitle(entry.eventType as ProjectAnalyticsEventType),
        subtitle: actor?.name ?? actor?.email ?? entry.source,
        createdAt: entry.createdAt,
      };
    }),
    ...activeViewerRows.map((entry) => {
      const viewer = profilesByAuthUserId.get(entry.authUserId);
      return {
        id: `viewer:${String(entry._id)}`,
        title: "تمت إضافة مشاهد للمشروع",
        subtitle: viewer?.name ?? viewer?.email ?? "مشاهد جديد",
        createdAt: entry.updatedAt,
      };
    }),
    ...offerActivities.map((activity) => ({
      id: `offer:${String(activity._id)}`,
      title: offerActivityTitle(activity),
      subtitle: "نشاط مرتبط بعرض أو تعاون",
      createdAt: activity.createdAt,
    })),
    ...nonArchivedDeals.map((deal) => ({
      id: `deal:${String(deal._id)}`,
      title: dealStageLabel(deal.stage),
      subtitle:
        deal.contactName ??
        (deal.crmClientId ? crmClientsById.get(String(deal.crmClientId))?.name ?? null : null) ??
        deal.title,
      createdAt: deal.createdAt ?? deal._creationTime ?? 0,
    })),
  ]
    .sort((left, right) => right.createdAt - left.createdAt)
    .slice(0, 20);

  const visibilityTrendMap = new Map(
    buildTrendWindow(VISIBILITY_TREND_DAYS).map((entry) => [
      entry.dateKey,
      {
        dateKey: entry.dateKey,
        label: entry.label,
        views: 0,
        clicks: 0,
      },
    ]),
  );

  for (const event of projectEvents) {
    const bucket = visibilityTrendMap.get(getUtcDateKey(event.createdAt));
    if (!bucket) continue;
    if (VIEW_EVENT_TYPES.has(event.eventType as ProjectAnalyticsEventType)) {
      bucket.views += 1;
    }
    if (CLICK_EVENT_TYPES.has(event.eventType as ProjectAnalyticsEventType)) {
      bucket.clicks += 1;
    }
  }

  const brokerStateSummary = (
    ["viewer_only", "offer_active", "client_linked", "closed_won", "closed_lost"] as const
  ).map((state) => ({
    key: state,
    label: brokerStateLabel(state),
    count: brokerRows.filter((row) => row.state === state).length,
  }));

  const interactionSummary = (
    [
      "project_detail_view",
      "project_analytics_view",
      "project_analyze_click",
      "project_edit_click",
      "project_create_offer_click",
      "project_open_inbox_click",
      "project_asset_open_click",
    ] as const
  )
    .map((eventType) => ({
      eventType,
      label: interactionLabel(eventType),
      count: projectEvents.filter((event) => event.eventType === eventType).length,
    }))
    .filter((entry) => entry.count > 0);

  const developerCustomers = brokerTracking.flatMap((entry) => entry.customers);
  const developerStageSummary = (
    ["new", "contacted", "negotiation", "won", "lost"] as const
  ).map((stage) => ({
    key: stage,
    label: developerStageLabel(stage),
    count: developerCustomers.filter((customer) => customer.stageKey === stage).length,
  }));

  return {
    projectId: String(propertyId),
    kpis: {
      connectedBrokers: brokerRows.length,
      brokerManagedClients: nonArchivedDeals.filter((deal) => normalizeRelationType(deal) === "broker_managed").length,
      totalViews,
      totalClicks,
      activeCases: activeCases.length,
      activeDeals: nonArchivedDeals.filter((deal) => !["won", "lost"].includes(deal.stage)).length,
    },
    brokerRows,
    stageSummary,
    recentEvents,
    visibilityTrend: [...visibilityTrendMap.values()],
    brokerStateSummary,
    interactionSummary,
    developerSummary: {
      totalCustomers: developerCustomers.length,
      trackedCustomers: developerCustomers.filter((customer) => customer.isTrackedCustomer).length,
      brokerManagedCustomers: developerCustomers.filter((customer) => customer.relationType === "broker_managed").length,
      internalCustomers: developerCustomers.filter((customer) => customer.relationType === "internal_client").length,
      activeBrokers: brokerTracking.filter((entry) => entry.totalCustomers > 0 || entry.state !== "viewer_only").length,
      closedWonCustomers: developerCustomers.filter((customer) => customer.stageKey === "won").length,
      closedLostCustomers: developerCustomers.filter((customer) => customer.stageKey === "lost").length,
    },
    developerStageSummary,
    brokerTracking: brokerTracking.sort((left, right) => (right.lastActivityAt ?? 0) - (left.lastActivityAt ?? 0)),
  };
}

/**
 * WHY:   Project owners need one owner-only analytics projection that combines access, CRM, collaboration, and tracked engagement.
 * WHAT:  Returns aggregated analytics for a single property, including KPI totals, broker relationship rows, stage counts, and developer drilldowns.
 * HOW:   Reuses owner access control, then joins property viewer access, deals, offer cases, CRM links, and tracked project events into one stable response.
 */
export const getProjectAnalytics = query({
  args: {
    propertyId: v.id("properties"),
  },
  handler: async (ctx, args) => {
    const { property } = await requireOwnedPropertyAccess(ctx, args.propertyId);
    return buildAnalytics({
      ctx,
      propertyId: args.propertyId,
      ownerBrokerId: property.brokerId,
    });
  },
});

/**
 * WHY:   Project detail and analytics surfaces need a durable engagement stream for later owner reporting.
 * WHAT:  Records one project interaction event for a caller who can currently read the property.
 * HOW:   Validates read access for owners and shared viewers, infers actor audience from the authenticated role, then inserts an analytics event row.
 */
export const recordProjectAnalyticsEvent = mutation({
  args: {
    propertyId: v.id("properties"),
    eventType: v.union(
      v.literal("project_detail_view"),
      v.literal("project_analytics_view"),
      v.literal("project_analyze_click"),
      v.literal("project_edit_click"),
      v.literal("project_create_offer_click"),
      v.literal("project_open_inbox_click"),
      v.literal("project_asset_open_click"),
    ),
    source: v.string(),
    conversationId: v.optional(v.id("inboxConversations")),
    offerCaseId: v.optional(v.id("offerCases")),
    dealId: v.optional(v.id("deals")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { access } = await requirePropertyReadAccess(ctx, {
      propertyId: args.propertyId,
      allowInboxShare: true,
    });

    await ctx.db.insert("projectAnalyticsEvents", {
      propertyId: args.propertyId,
      eventType: args.eventType,
      actorAuthUserId: access.authUserId,
      actorAudience: actorAudience(access.role),
      source: args.source,
      conversationId: args.conversationId,
      offerCaseId: args.offerCaseId,
      dealId: args.dealId,
      metadata: args.metadata,
      createdAt: Date.now(),
    });

    return { ok: true } as const;
  },
});
