import { ConvexError } from "convex/values";
import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { getOptionalProfile, requireOfferSession, requireSender, requireVerifiedSender } from "./access";
import { resolveOfferRecipient } from "./recipients";

type OfferCaseType = "open_offer" | "private_offer" | "collaboration_case";
type OfferCaseStage =
  | "draft"
  | "open"
  | "targeted"
  | "engaged"
  | "agreed"
  | "closed_won"
  | "closed_lost"
  | "archived";
type OfferPackageVisibility = "open" | "private";
type OfferAllowedAudience = "brokers" | "developers" | "both";
type OfferParticipantRole = "inventory_owner" | "client_owner" | "execution_partner";
type OfferParticipantStatus = "pending" | "active" | "accepted" | "rejected";

type OfferClientContext = {
  crmClientId?: Id<"crmClients">;
  clientName: string;
  clientPhone?: string;
  clientBudget?: string;
  clientNeed: string;
};

type CreateOfferCaseArgs = {
  propertyId: Id<"properties">;
  price: number;
  message?: string;
  description?: string;
  visibility?: "public" | "private";
  caseType?: OfferCaseType;
  allowedAudience?: OfferAllowedAudience;
  commissionText?: string;
  permitStatus?: string;
  productStatus?: string;
  recipientAuthUserId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  toBrokerId?: Id<"brokers">;
  toREDId?: Id<"RED">;
  sourceConversationId?: Id<"inboxConversations">;
  attachments?: Doc<"offerPackages">["attachments"];
  clientContext?: OfferClientContext;
};

type UpdateOfferCaseDraftArgs = {
  id: Id<"offerCases">;
  conversationId?: Id<"inboxConversations">;
  propertyId: Id<"properties">;
  price: number;
  message?: string;
  description?: string;
  attachments?: Doc<"offerPackages">["attachments"];
  commissionText?: string;
  permitStatus?: string;
  productStatus?: string;
  allowedAudience?: OfferAllowedAudience;
  clientContext?: OfferClientContext;
};

type LegacyOfferStatus = "pending" | "accepted" | "rejected";
type LegacyPublicationState = "draft" | "published" | "archived";
type LegacyOfferVisibility = "public" | "private";

function assert(condition: unknown, message: string, code = "INVALID_STATE"): asserts condition {
  if (!condition) {
    throw new ConvexError({ code, message });
  }
}

function legacyStatusFromStage(stage: OfferCaseStage): LegacyOfferStatus {
  if (stage === "closed_lost" || stage === "archived") return "rejected";
  if (stage === "engaged" || stage === "agreed" || stage === "closed_won") return "accepted";
  return "pending";
}

function legacyPublicationStateFromStage(stage: OfferCaseStage): LegacyPublicationState {
  if (stage === "draft") return "draft";
  if (stage === "archived") return "archived";
  return "published";
}

function legacyVisibilityFromPackage(visibility: OfferPackageVisibility): LegacyOfferVisibility {
  return visibility === "open" ? "public" : "private";
}

function isClosedStage(stage: OfferCaseStage) {
  return stage === "closed_won" || stage === "closed_lost" || stage === "archived";
}

function resolveVisibility(args: CreateOfferCaseArgs): OfferPackageVisibility {
  if (args.caseType === "open_offer") return "open";
  if (args.visibility === "public") return "open";
  return "private";
}

function resolveCaseType(args: CreateOfferCaseArgs): OfferCaseType {
  if (args.caseType) return args.caseType;
  if (args.visibility === "public") return "open_offer";
  return args.clientContext ? "collaboration_case" : "private_offer";
}

function resolveStageForDraft(args: { caseType: OfferCaseType }) {
  return "draft" as const;
}

function resolveStageForPublish(type: OfferCaseType): OfferCaseStage {
  return type === "open_offer" ? "open" : "targeted";
}

async function getProfileByAuthUserId(ctx: QueryCtx | MutationCtx, authUserId: string) {
  return ctx.db
    .query("userProfiles")
    .withIndex("authUserId", (q: any) => q.eq("authUserId", authUserId))
    .first();
}

async function loadPropertySummary(ctx: QueryCtx | MutationCtx, propertyId: Id<"properties">) {
  const property = await ctx.db.get(propertyId);
  if (!property) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Property not found" });
  }
  return property;
}

async function insertActivity(
  ctx: MutationCtx,
  args: {
    offerCaseId: Id<"offerCases">;
    kind: Doc<"offerActivities">["kind"];
    actorAuthUserId?: string;
    message?: string;
  },
) {
  await ctx.db.insert("offerActivities", {
    offerCaseId: args.offerCaseId,
    kind: args.kind,
    actorAuthUserId: args.actorAuthUserId,
    message: args.message,
    createdAt: Date.now(),
  });
}

async function setCaseStage(
  ctx: MutationCtx,
  offerCaseId: Id<"offerCases">,
  stage: OfferCaseStage,
  extra?: Partial<Doc<"offerCases">>,
) {
  await ctx.db.patch(offerCaseId, {
    stage,
    updatedAt: Date.now(),
    lastActivityAt: Date.now(),
    ...(extra ?? {}),
  });
}

function participantMatchesAccess(
  participant: Doc<"offerCaseParticipants">,
  access: Awaited<ReturnType<typeof requireSender>>,
) {
  return (
    participant.authUserId === access.authUserId ||
    (access.brokerId ? participant.brokerId === access.brokerId : false) ||
    (access.REDId ? participant.REDId === access.REDId : false)
  );
}

function isOpenlyVisible(offerCase: Doc<"offerCases">, offerPackage: Doc<"offerPackages">) {
  return offerCase.stage === "open" && offerPackage.visibility === "open";
}

async function listParticipantsForCase(ctx: QueryCtx | MutationCtx, offerCaseId: Id<"offerCases">) {
  return ctx.db
    .query("offerCaseParticipants")
    .withIndex("offerCaseId", (q) => q.eq("offerCaseId", offerCaseId))
    .collect();
}

async function buildParticipantSummary(
  ctx: QueryCtx | MutationCtx,
  participant: Doc<"offerCaseParticipants">,
) {
  const profile = participant.authUserId ? await getProfileByAuthUserId(ctx, participant.authUserId) : null;
  const broker = participant.brokerId ? await ctx.db.get(participant.brokerId) : null;
  const red = participant.REDId ? await ctx.db.get(participant.REDId) : null;
  const organizationName = broker?.name ?? red?.name ?? profile?.name ?? profile?.email ?? "طرف غير معروف";
  const organizationType = broker ? "broker" : red ? "developer" : null;
  return {
    id: String(participant._id),
    role: participant.role,
    status: participant.status,
    authUserId: participant.authUserId ?? null,
    organizationId: participant.brokerId ? String(participant.brokerId) : participant.REDId ? String(participant.REDId) : null,
    organizationType,
    organizationName,
    name: profile?.name ?? organizationName,
  };
}

async function buildActivitySummary(
  ctx: QueryCtx | MutationCtx,
  activity: Doc<"offerActivities">,
) {
  const actor = activity.actorAuthUserId ? await getProfileByAuthUserId(ctx, activity.actorAuthUserId) : null;
  return {
    id: String(activity._id),
    kind: activity.kind,
    message: activity.message ?? null,
    createdAt: activity.createdAt,
    actorName: actor?.name ?? actor?.email ?? null,
  };
}

function isPresent<T>(value: T | null | undefined): value is T {
  return value != null;
}

function buildQueueDefinition(audience: "broker" | "developer") {
  return audience === "broker"
    ? [
        { key: "client_needs_match", label: "My Client Needs Match", description: "Client-backed collaboration cases you are driving." },
        { key: "inventory_i_can_share", label: "My Inventory I Can Share", description: "Inventory packages you can publish or target." },
        { key: "incoming_opportunities", label: "Incoming Opportunities", description: "Open opportunities and targeted requests visible to you." },
        { key: "shared_by_me", label: "Shared By Me", description: "Offers and cases you started or targeted." },
        { key: "active_collaborations", label: "Active Collaborations", description: "Cases in engagement or agreement." },
        { key: "archived", label: "Archived", description: "Closed and archived cases." },
      ]
    : [
        { key: "open_inventory", label: "Open Inventory Offers", description: "Developer-owned inventory packages currently open." },
        { key: "incoming_broker_requests", label: "Incoming Broker Requests", description: "Private and collaboration requests sent to you." },
        { key: "targeted_shares", label: "Targeted Shares", description: "Targeted cases you created from your inventory." },
        { key: "active_collaborations", label: "Active Collaborations", description: "Cases in engagement or agreement." },
        { key: "archived", label: "Archived", description: "Closed and archived cases." },
      ];
}

async function buildCaseSummary(
  ctx: QueryCtx | MutationCtx,
  offerCase: Doc<"offerCases">,
  access: Awaited<ReturnType<typeof requireSender>> | null,
) {
  const offerPackage = await ctx.db.get(offerCase.offerPackageId);
  if (!offerPackage) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Offer package not found" });
  }
  const property = await ctx.db.get(offerPackage.propertyId);
  const participants = await listParticipantsForCase(ctx, offerCase._id);
  const participantSummaries = await Promise.all(participants.map((participant) => buildParticipantSummary(ctx, participant)));
  const owner = participantSummaries.find((participant) => participant.role === "inventory_owner") ?? participantSummaries[0] ?? null;
  const targeted = participants.find((participant) => participant.role === "execution_partner") ?? null;
  const isVisible =
    !access ||
    isOpenlyVisible(offerCase, offerPackage) ||
    participants.some((participant) => participantMatchesAccess(participant, access));

  if (!isVisible) {
    return null;
  }

  return {
    id: String(offerCase._id),
    packageId: String(offerPackage._id),
    type: offerCase.type,
    stage: offerCase.stage,
    status: legacyStatusFromStage(offerCase.stage),
    publicationState: legacyPublicationStateFromStage(offerCase.stage),
    visibility: legacyVisibilityFromPackage(offerPackage.visibility),
    propertyId: String(offerPackage.propertyId),
    message: offerCase.headline ?? offerPackage.title ?? property?.title ?? "Offer case",
    description: offerCase.summary ?? offerPackage.summary ?? null,
    senderName: owner?.organizationName ?? null,
    recipientAuthUserId: targeted?.authUserId ?? null,
    sourceConversationId: offerCase.sourceConversationId ? String(offerCase.sourceConversationId) : null,
    property: property
      ? {
          id: String(property._id),
          title: property.title,
          address: property.address ?? property.location ?? "غير محدد",
          price: property.price,
          imageUrl: property.heroImage?.url ?? property.media?.[0]?.url,
        }
      : null,
    price: offerPackage.askingPrice,
    commissionText: offerPackage.commissionText ?? null,
    permitStatus: offerPackage.permitStatus ?? null,
    productStatus: offerPackage.productStatus ?? null,
    allowedAudience: offerPackage.allowedAudience,
    attachments: offerPackage.attachments ?? [],
    clientContext: offerCase.clientContext
      ? {
          crmClientId: offerCase.clientContext.crmClientId ? String(offerCase.clientContext.crmClientId) : null,
          clientName: offerCase.clientContext.clientName,
          clientPhone: offerCase.clientContext.clientPhone ?? null,
          clientBudget: offerCase.clientContext.clientBudget ?? null,
          clientNeed: offerCase.clientContext.clientNeed,
        }
      : null,
    participants: participantSummaries,
    href: `/ws/offers/${offerCase._id}`,
    createdAt: offerCase.createdAt,
    updatedAt: offerCase.updatedAt,
  };
}

function buildAllowedActions(args: {
  offerCase: Doc<"offerCases">;
  participants: Doc<"offerCaseParticipants">[];
  access: Awaited<ReturnType<typeof requireSender>>;
}) {
  const matchingParticipants = args.participants.filter((participant) => participantMatchesAccess(participant, args.access));
  const isInventoryOwner = matchingParticipants.some((participant) => participant.role === "inventory_owner");
  const isClientOwner = matchingParticipants.some((participant) => participant.role === "client_owner");
  const isExecutionPartner = matchingParticipants.some((participant) => participant.role === "execution_partner");
  const executionParticipant = matchingParticipants.find((participant) => participant.role === "execution_partner");
  return {
    isInventoryOwner,
    isClientOwner,
    isExecutionPartner,
    canEditDraft: isInventoryOwner && args.offerCase.stage === "draft",
    canPublish: isInventoryOwner && args.offerCase.stage === "draft",
    canArchive: (isInventoryOwner || isClientOwner) && !isClosedStage(args.offerCase.stage),
    canEngage: args.offerCase.stage === "open" && !isInventoryOwner,
    canRespond: isExecutionPartner && args.offerCase.stage === "targeted" && executionParticipant?.status !== "rejected",
    canMarkAgreed: (isInventoryOwner || isClientOwner) && args.offerCase.stage === "engaged",
    canCloseWon: (isInventoryOwner || isClientOwner) && args.offerCase.stage === "agreed",
    canCloseLost: (isInventoryOwner || isClientOwner) && args.offerCase.stage === "agreed",
  };
}

async function buildCaseDetail(
  ctx: QueryCtx,
  offerCase: Doc<"offerCases">,
  access: Awaited<ReturnType<typeof requireSender>>,
) {
  const summary = await buildCaseSummary(ctx, offerCase, access);
  if (!summary) {
    return null;
  }
  const participants = await listParticipantsForCase(ctx, offerCase._id);
  const activities = await ctx.db
    .query("offerActivities")
    .withIndex("offerCaseId", (q) => q.eq("offerCaseId", offerCase._id))
    .collect();
  const allowedActions = buildAllowedActions({ offerCase, participants, access });
  return {
    ...summary,
    propertyTitle: summary.property?.title ?? summary.message,
    propertyAddress: summary.property?.address ?? "غير محدد",
    propertyImageUrl: summary.property?.imageUrl ?? null,
    isOwner: allowedActions.isInventoryOwner,
    isRecipient: allowedActions.isExecutionPartner,
    canEditDraft: allowedActions.canEditDraft,
    canPublish: allowedActions.canPublish,
    canArchive: allowedActions.canArchive,
    canRespond: allowedActions.canRespond,
    allowedActions,
    activity: await Promise.all(
      [...activities]
        .sort((left, right) => left.createdAt - right.createdAt)
        .map((activity) => buildActivitySummary(ctx, activity)),
    ),
  };
}

async function resolveVisibleCasesForAccess(
  ctx: QueryCtx,
  access: Awaited<ReturnType<typeof requireSender>>,
) {
  const [participantMatches, openCases] = await Promise.all([
    Promise.all([
      ctx.db.query("offerCaseParticipants").withIndex("authUserId", (q) => q.eq("authUserId", access.authUserId)).collect(),
      access.brokerId
        ? ctx.db.query("offerCaseParticipants").withIndex("brokerId", (q) => q.eq("brokerId", access.brokerId!)).collect()
        : Promise.resolve([] as Doc<"offerCaseParticipants">[]),
      access.REDId
        ? ctx.db.query("offerCaseParticipants").withIndex("REDId", (q) => q.eq("REDId", access.REDId!)).collect()
        : Promise.resolve([] as Doc<"offerCaseParticipants">[]),
    ]),
    ctx.db.query("offerCases").withIndex("stage", (q) => q.eq("stage", "open")).collect(),
  ]);

  const participantCaseIds = new Set(
    participantMatches.flat().map((participant) => String(participant.offerCaseId)),
  );
  const cases = new Map<string, Doc<"offerCases">>();
  for (const offerCaseId of participantCaseIds) {
    const offerCase = await ctx.db.get(offerCaseId as Id<"offerCases">);
    if (offerCase) {
      cases.set(String(offerCase._id), offerCase);
    }
  }
  for (const offerCase of openCases) {
    cases.set(String(offerCase._id), offerCase);
  }
  return [...cases.values()].sort((left, right) => right.lastActivityAt - left.lastActivityAt);
}

function queueSelector(args: {
  audience: "broker" | "developer";
  summary: Awaited<ReturnType<typeof buildCaseSummary>>;
  access: Awaited<ReturnType<typeof requireSender>>;
}) {
  const summary = args.summary;
  if (!summary) return null;
  const isClosed = summary.stage === "archived" || summary.stage === "closed_won" || summary.stage === "closed_lost";
  const isOwner = summary.participants.some(
    (participant) =>
      participant.role === "inventory_owner" &&
      (participant.authUserId === args.access.authUserId ||
        (args.access.brokerId ? participant.organizationId === String(args.access.brokerId) : false) ||
        (args.access.REDId ? participant.organizationId === String(args.access.REDId) : false)),
  );
  const isClientOwner = summary.participants.some(
    (participant) =>
      participant.role === "client_owner" &&
      (participant.authUserId === args.access.authUserId ||
        (args.access.brokerId ? participant.organizationId === String(args.access.brokerId) : false) ||
        (args.access.REDId ? participant.organizationId === String(args.access.REDId) : false)),
  );
  const isExecutionPartner = summary.participants.some(
    (participant) =>
      participant.role === "execution_partner" &&
      (participant.authUserId === args.access.authUserId ||
        (args.access.brokerId ? participant.organizationId === String(args.access.brokerId) : false) ||
        (args.access.REDId ? participant.organizationId === String(args.access.REDId) : false)),
  );

  if (isClosed) return "archived";

  if (args.audience === "broker") {
    if (summary.type === "collaboration_case" && isClientOwner) return "client_needs_match";
    if (isOwner && (summary.type === "open_offer" || summary.type === "private_offer")) return "inventory_i_can_share";
    if (summary.stage === "engaged" || summary.stage === "agreed") return "active_collaborations";
    if (isOwner || isClientOwner) return "shared_by_me";
    return "incoming_opportunities";
  }

  if (summary.stage === "engaged" || summary.stage === "agreed") return "active_collaborations";
  if (isExecutionPartner && (summary.type === "private_offer" || summary.type === "collaboration_case")) {
    return "incoming_broker_requests";
  }
  if (isOwner && summary.type === "open_offer") return "open_inventory";
  return "targeted_shares";
}

async function createDealForAgreedCase(
  ctx: MutationCtx,
  args: {
    offerCase: Doc<"offerCases">;
    offerPackage: Doc<"offerPackages">;
    property: Doc<"properties">;
    access: Awaited<ReturnType<typeof requireSender>>;
  },
) {
  const participants = await listParticipantsForCase(ctx, args.offerCase._id);
  const inventoryOwner = participants.find((participant) => participant.role === "inventory_owner");
  const clientOwner = participants.find((participant) => participant.role === "client_owner");
  const dealId = await ctx.db.insert("deals", {
    createdAt: Date.now(),
    title: args.offerCase.headline ?? args.property.title,
    description: args.offerCase.summary ?? args.offerPackage.summary,
    value: args.offerPackage.askingPrice,
    stage: "new",
    relationType: "broker_managed",
    crmClientId: args.offerCase.clientContext?.crmClientId,
    relatedBrokerId: clientOwner?.brokerId ?? inventoryOwner?.brokerId,
    REDId: inventoryOwner?.REDId ?? clientOwner?.REDId,
    brokerId: inventoryOwner?.brokerId ?? clientOwner?.brokerId,
    propertyId: args.offerPackage.propertyId,
    offerCaseId: args.offerCase._id,
    contactName: args.offerCase.clientContext?.clientName,
    contactPhone: args.offerCase.clientContext?.clientPhone,
    lastUpdatedBy: args.access.authUserId,
  });
  await ctx.db.patch(args.offerCase._id, { linkedDealId: dealId });
  return dealId;
}

async function buildDraftCreateResult(offerCaseId: Id<"offerCases">) {
  return {
    offerId: String(offerCaseId),
    caseId: String(offerCaseId),
    conversationId: null,
    starterMessageCreated: false,
    notification: null,
  };
}

async function createOfferCase(
  ctx: MutationCtx,
  args: CreateOfferCaseArgs,
  options: { draft: boolean },
) {
  const access = options.draft ? await requireSender(ctx) : await requireVerifiedSender(ctx);
  const property = await loadPropertySummary(ctx, args.propertyId);
  const caseType = resolveCaseType(args);
  const packageVisibility = resolveVisibility(args);
  if (caseType === "collaboration_case") {
    assert(args.clientContext?.clientName && args.clientContext.clientNeed, "Client context is required for collaboration cases");
  }
  if (caseType !== "open_offer") {
    const recipient = await resolveOfferRecipient(ctx, {
      visibility: "private",
      toBrokerId: args.toBrokerId,
      toREDId: args.toREDId,
      recipientAuthUserId: args.recipientAuthUserId,
      recipientEmail: args.recipientEmail,
      recipientPhone: args.recipientPhone,
    });
    assert(recipient.toBrokerId || recipient.toREDId || args.recipientAuthUserId, "Private and collaboration cases require a specific recipient", "INVALID_TARGET");
    const now = Date.now();
    const offerPackageId = await ctx.db.insert("offerPackages", {
      propertyId: args.propertyId,
      ownerAuthUserId: access.authUserId,
      fromBrokerId: access.brokerId,
      fromREDId: access.REDId,
      title: args.message,
      summary: args.description,
      askingPrice: args.price,
      commissionText: args.commissionText,
      permitStatus: args.permitStatus,
      productStatus: args.productStatus,
      visibility: packageVisibility,
      allowedAudience: args.allowedAudience ?? "both",
      notes: args.description,
      attachments: args.attachments,
      createdAt: now,
      updatedAt: now,
    });
    const offerCaseId = await ctx.db.insert("offerCases", {
      offerPackageId,
      type: caseType,
      stage: resolveStageForDraft({ caseType }),
      visibility: packageVisibility,
      initiatedByAuthUserId: access.authUserId,
      sourceConversationId: args.sourceConversationId,
      headline: args.message ?? property.title,
      summary: args.description,
      clientContext: args.clientContext,
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
    });
    await ctx.db.insert("offerCaseParticipants", {
      offerCaseId,
      authUserId: access.authUserId,
      brokerId: access.brokerId,
      REDId: access.REDId,
      role: "inventory_owner",
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
    if (caseType === "collaboration_case") {
      await ctx.db.insert("offerCaseParticipants", {
        offerCaseId,
        authUserId: access.authUserId,
        brokerId: access.brokerId,
        REDId: access.REDId,
        role: "client_owner",
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
    }
    await ctx.db.insert("offerCaseParticipants", {
      offerCaseId,
      authUserId: args.recipientAuthUserId,
      brokerId: recipient.toBrokerId,
      REDId: recipient.toREDId,
      role: "execution_partner",
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
    await insertActivity(ctx, {
      offerCaseId,
      kind: "case_created",
      actorAuthUserId: access.authUserId,
      message: caseType === "collaboration_case" ? "Collaboration case drafted" : "Private case drafted",
    });
    return offerCaseId;
  }

  const now = Date.now();
  const offerPackageId = await ctx.db.insert("offerPackages", {
    propertyId: args.propertyId,
    ownerAuthUserId: access.authUserId,
    fromBrokerId: access.brokerId,
    fromREDId: access.REDId,
    title: args.message,
    summary: args.description,
    askingPrice: args.price,
    commissionText: args.commissionText,
    permitStatus: args.permitStatus,
    productStatus: args.productStatus,
    visibility: packageVisibility,
    allowedAudience: args.allowedAudience ?? "both",
    notes: args.description,
    attachments: args.attachments,
    createdAt: now,
    updatedAt: now,
  });
  const offerCaseId = await ctx.db.insert("offerCases", {
    offerPackageId,
    type: "open_offer",
    stage: resolveStageForDraft({ caseType: "open_offer" }),
    visibility: packageVisibility,
    initiatedByAuthUserId: access.authUserId,
    sourceConversationId: args.sourceConversationId,
    headline: args.message ?? property.title,
    summary: args.description,
    clientContext: undefined,
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
  });
  await ctx.db.insert("offerCaseParticipants", {
    offerCaseId,
    authUserId: access.authUserId,
    brokerId: access.brokerId,
    REDId: access.REDId,
    role: "inventory_owner",
    status: "active",
    createdAt: now,
    updatedAt: now,
  });
  await insertActivity(ctx, {
    offerCaseId,
    kind: "case_created",
    actorAuthUserId: access.authUserId,
    message: "Open offer drafted",
  });
  return offerCaseId;
}

/**
 * WHY:   Offer creation should write the new package+case aggregate instead of the legacy single record.
 * WHAT:  Creates a draft offer case owned by the current sender.
 * HOW:   Persists the package, case, participants, and initial activity inside the fresh offers 2.0 tables.
 */
export async function createOfferService(ctx: MutationCtx, args: CreateOfferCaseArgs) {
  const offerCaseId = await createOfferCase(ctx, args, { draft: true });
  return buildDraftCreateResult(offerCaseId);
}

/**
 * WHY:   Inbox-targeted offers still need a draft-first entrypoint before the sender explicitly publishes the case.
 * WHAT:  Creates a draft targeted or collaboration case linked to an inbox conversation when provided.
 * HOW:   Reuses the same aggregate creation path while keeping the stage in `draft`.
 */
export async function createOfferDraftService(ctx: MutationCtx, args: CreateOfferCaseArgs) {
  const offerCaseId = await createOfferCase(ctx, args, { draft: true });
  return buildDraftCreateResult(offerCaseId);
}

/**
 * WHY:   The web workspace now needs one queue snapshot built from the three-party collaboration model.
 * WHAT:  Returns audience-specific offer queues plus legacy projections for compatibility consumers.
 * HOW:   Resolves visible cases for the current sender, maps them into queue buckets, and derives legacy lists from the same source.
 */
export async function getWorkspaceOfferQueuesService(ctx: QueryCtx) {
  const access = await requireSender(ctx);
  const audience = access.brokerId ? "broker" : "developer";
  const visibleCases = await resolveVisibleCasesForAccess(ctx, access);
  const summaries = (await Promise.all(visibleCases.map((offerCase) => buildCaseSummary(ctx, offerCase, access)))).filter(isPresent);
  const queueDefinitions = buildQueueDefinition(audience);
  const queueMap = new Map<string, typeof summaries>();
  for (const definition of queueDefinitions) {
    queueMap.set(definition.key, []);
  }
  for (const summary of summaries) {
    const queueKey = queueSelector({ audience, summary, access });
    if (!queueKey) continue;
    const items = queueMap.get(queueKey) ?? [];
    items.push(summary);
    queueMap.set(queueKey, items);
  }

  const sent = summaries.filter((summary) =>
    summary.participants.some((participant) =>
      participant.role === "inventory_owner" &&
      (participant.authUserId === access.authUserId ||
        (access.brokerId ? participant.organizationId === String(access.brokerId) : false) ||
        (access.REDId ? participant.organizationId === String(access.REDId) : false)),
    ),
  );
  const received = summaries.filter((summary) =>
    summary.participants.some((participant) =>
      participant.role === "execution_partner" &&
      (participant.authUserId === access.authUserId ||
        (access.brokerId ? participant.organizationId === String(access.brokerId) : false) ||
        (access.REDId ? participant.organizationId === String(access.REDId) : false)),
    ),
  );
  const marketplace = summaries.filter((summary) => summary.stage === "open" && summary.visibility === "public");

  return {
    audience,
    queues: queueDefinitions.map((definition) => ({
      key: definition.key,
      label: definition.label,
      description: definition.description,
      items: queueMap.get(definition.key) ?? [],
    })),
    sent,
    received,
    marketplace,
  };
}

/**
 * WHY:   Compatibility readers like AI command routing still need a simple “sent offers” list.
 * WHAT:  Returns cases where the current sender is the inventory owner.
 * HOW:   Delegates to the new queue snapshot and reuses its normalized case summaries.
 */
export async function listSentOffersService(ctx: QueryCtx) {
  const snapshot = await getWorkspaceOfferQueuesService(ctx);
  return snapshot.sent;
}

/**
 * WHY:   Compatibility readers still expect one received-offers collection.
 * WHAT:  Returns targeted cases where the current sender is the execution partner.
 * HOW:   Delegates to the new queue snapshot to avoid maintaining a second visibility implementation.
 */
export async function listReceivedOffersService(ctx: QueryCtx) {
  const snapshot = await getWorkspaceOfferQueuesService(ctx);
  return snapshot.received;
}

/**
 * WHY:   Public/open offer discovery must now read from the open case model instead of the legacy offers table.
 * WHAT:  Returns all open cases visible in the marketplace.
 * HOW:   Delegates to the new queue snapshot and filters to open public items.
 */
export async function listPublicOffersService(ctx: QueryCtx) {
  const snapshot = await getWorkspaceOfferQueuesService(ctx);
  return snapshot.marketplace;
}

/**
 * WHY:   Inbox composer draft reloads still need the current sender's unsent conversation-linked cases.
 * WHAT:  Returns private draft cases linked to one inbox conversation for the current sender.
 * HOW:   Loads cases by conversation, filters to owner-visible drafts, and maps them into the live detail shape.
 */
export async function listConversationPrivateOfferDraftsService(
  ctx: QueryCtx,
  args: { conversationId: Id<"inboxConversations"> },
) {
  const access = await requireSender(ctx);
  const offerCases = await ctx.db
    .query("offerCases")
    .withIndex("sourceConversationId", (q) => q.eq("sourceConversationId", args.conversationId))
    .collect();

  const details = await Promise.all(
    offerCases
      .filter((offerCase) => offerCase.stage === "draft")
      .map((offerCase) => buildCaseDetail(ctx, offerCase, access)),
  );
  return details.filter(isPresent);
}

/**
 * WHY:   The offers detail page and inbox cards both need a role-aware case workspace payload.
 * WHAT:  Returns one visible offer case with actions, participants, package data, and activity.
 * HOW:   Loads the case from the new tables, authorizes visibility through participant membership or open visibility, and maps the detail response.
 */
export async function getOfferLiveStateService(
  ctx: QueryCtx,
  args: { offerId: Id<"offerCases"> | string },
) {
  const access = await requireSender(ctx);
  const offerCase = await ctx.db.get(args.offerId as Id<"offerCases">);
  if (!offerCase) return null;
  return buildCaseDetail(ctx, offerCase, access);
}

/**
 * WHY:   Draft updates must stay scoped to owner-controlled cases and their linked offer package.
 * WHAT:  Updates one draft case and its underlying package metadata.
 * HOW:   Validates ownership, enforces draft stage, patches the case summary, and patches the package product fields.
 */
export async function updateOfferDraftService(ctx: MutationCtx, args: UpdateOfferCaseDraftArgs) {
  const access = await requireSender(ctx);
  const offerCase = await ctx.db.get(args.id);
  assert(offerCase, "Offer case not found", "NOT_FOUND");
  const participants = await listParticipantsForCase(ctx, args.id);
  const isOwner = participants.some(
    (participant) => participant.role === "inventory_owner" && participantMatchesAccess(participant, access),
  );
  assert(isOwner, "Only inventory owners can edit draft cases", "FORBIDDEN");
  assert(offerCase.stage === "draft", "Only draft cases can be edited");
  if (args.conversationId && offerCase.sourceConversationId && offerCase.sourceConversationId !== args.conversationId) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Offer case does not belong to this conversation" });
  }
  const offerPackage = await ctx.db.get(offerCase.offerPackageId);
  assert(offerPackage, "Offer package not found", "NOT_FOUND");
  await ctx.db.patch(offerCase._id, {
    headline: args.message,
    summary: args.description,
    clientContext: args.clientContext,
    updatedAt: Date.now(),
    lastActivityAt: Date.now(),
  });
  await ctx.db.patch(offerPackage._id, {
    propertyId: args.propertyId,
    title: args.message,
    summary: args.description,
    askingPrice: args.price,
    attachments: args.attachments,
    commissionText: args.commissionText,
    permitStatus: args.permitStatus,
    productStatus: args.productStatus,
    allowedAudience: args.allowedAudience ?? offerPackage.allowedAudience,
    updatedAt: Date.now(),
  });
  await insertActivity(ctx, {
    offerCaseId: offerCase._id,
    kind: "note_added",
    actorAuthUserId: access.authUserId,
    message: "Draft updated",
  });
  return { ok: true } as const;
}

/**
 * WHY:   Drafts should only become visible when the owner explicitly publishes the case.
 * WHAT:  Publishes one draft case into either `open` or `targeted`.
 * HOW:   Requires a verified sender, confirms inventory ownership, and advances the stage based on the case type.
 */
export async function publishOfferService(
  ctx: MutationCtx,
  args: { id: Id<"offerCases"> },
) {
  const access = await requireVerifiedSender(ctx);
  const offerCase = await ctx.db.get(args.id);
  assert(offerCase, "Offer case not found", "NOT_FOUND");
  const participants = await listParticipantsForCase(ctx, args.id);
  const isOwner = participants.some(
    (participant) => participant.role === "inventory_owner" && participantMatchesAccess(participant, access),
  );
  assert(isOwner, "Only inventory owners can publish draft cases", "FORBIDDEN");
  assert(offerCase.stage === "draft", "Only draft cases can be published");
  const nextStage = resolveStageForPublish(offerCase.type);
  await setCaseStage(ctx, args.id, nextStage);
  await insertActivity(ctx, {
    offerCaseId: args.id,
    kind: "case_published",
    actorAuthUserId: access.authUserId,
    message: nextStage === "open" ? "Open offer published" : "Targeted case published",
  });
  return { ok: true } as const;
}

/**
 * WHY:   Inbox-originated targeted cases must publish only from the owning conversation.
 * WHAT:  Publishes a draft case linked to a specific inbox conversation.
 * HOW:   Reuses the normal publish rules and additionally verifies the stored source conversation id.
 */
export async function publishConversationOfferService(
  ctx: MutationCtx,
  args: { id: Id<"offerCases">; conversationId: Id<"inboxConversations"> },
) {
  const offerCase = await ctx.db.get(args.id);
  assert(offerCase, "Offer case not found", "NOT_FOUND");
  assert(offerCase.sourceConversationId === args.conversationId, "Offer case does not belong to this conversation", "FORBIDDEN");
  await publishOfferService(ctx, { id: args.id });
  return {
    offerId: String(args.id),
    caseId: String(args.id),
    conversationId: String(args.conversationId),
    starterMessageCreated: false,
    notification: null,
  };
}

/**
 * WHY:   Owners need a reversible, non-destructive way to retire cases from active queues.
 * WHAT:  Archives one case when the current sender controls it.
 * HOW:   Validates owner/client-owner access, then moves the case into the terminal archived stage.
 */
export async function archiveOfferService(
  ctx: MutationCtx,
  args: { id: Id<"offerCases"> },
) {
  const access = await requireSender(ctx);
  const offerCase = await ctx.db.get(args.id);
  assert(offerCase, "Offer case not found", "NOT_FOUND");
  const participants = await listParticipantsForCase(ctx, args.id);
  const canArchive = participants.some(
    (participant) =>
      (participant.role === "inventory_owner" || participant.role === "client_owner") &&
      participantMatchesAccess(participant, access),
  );
  assert(canArchive, "Only case owners can archive active cases", "FORBIDDEN");
  await setCaseStage(ctx, args.id, "archived");
  await insertActivity(ctx, {
    offerCaseId: args.id,
    kind: "archived",
    actorAuthUserId: access.authUserId,
    message: "Case archived",
  });
  return { ok: true } as const;
}

/**
 * WHY:   Open offers must turn into active collaboration when another party joins them.
 * WHAT:  Opens engagement on one published open offer for the current verified sender.
 * HOW:   Verifies visibility, adds or reactivates an execution-partner participant, and advances the case to `engaged`.
 */
export async function applyToOfferService(
  ctx: MutationCtx,
  args: { offerId: Id<"offerCases">; message?: string },
) {
  const access = await requireVerifiedSender(ctx);
  const offerCase = await ctx.db.get(args.offerId);
  assert(offerCase, "Offer case not found", "NOT_FOUND");
  const offerPackage = await ctx.db.get(offerCase.offerPackageId);
  assert(offerPackage, "Offer package not found", "NOT_FOUND");
  assert(offerCase.stage === "open" && offerPackage.visibility === "open", "Only open offers can be engaged");
  const participants = await listParticipantsForCase(ctx, args.offerId);
  const isOwner = participants.some(
    (participant) => participant.role === "inventory_owner" && participantMatchesAccess(participant, access),
  );
  assert(!isOwner, "Owners cannot engage their own open offer", "FORBIDDEN");
  const existingExecutionPartner = participants.find(
    (participant) => participant.role === "execution_partner" && participantMatchesAccess(participant, access),
  );
  if (existingExecutionPartner) {
    await ctx.db.patch(existingExecutionPartner._id, {
      status: "accepted",
      updatedAt: Date.now(),
    });
  } else {
    await ctx.db.insert("offerCaseParticipants", {
      offerCaseId: args.offerId,
      authUserId: access.authUserId,
      brokerId: access.brokerId,
      REDId: access.REDId,
      role: "execution_partner",
      status: "accepted",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
  await setCaseStage(ctx, args.offerId, "engaged");
  await insertActivity(ctx, {
    offerCaseId: args.offerId,
    kind: "engaged",
    actorAuthUserId: access.authUserId,
    message: args.message ?? "Execution partner engaged the open offer",
  });
  return {
    offerId: String(args.offerId),
    caseId: String(args.offerId),
    conversationId: null,
    starterMessageCreated: false,
    notification: null,
  };
}

/**
 * WHY:   Targeted recipients need one accept/reject transition that feeds the new lifecycle instead of toggling a legacy status flag.
 * WHAT:  Accepts or rejects one targeted case for the current execution partner.
 * HOW:   Verifies recipient access, updates the participant decision, and advances the case into `engaged` or `closed_lost`.
 */
export async function updateOfferStatusService(
  ctx: MutationCtx,
  args: { id: Id<"offerCases">; status: "accepted" | "rejected" },
) {
  const access = await requireSender(ctx);
  const offerCase = await ctx.db.get(args.id);
  assert(offerCase, "Offer case not found", "NOT_FOUND");
  const participants = await listParticipantsForCase(ctx, args.id);
  const executionParticipant = participants.find(
    (participant) => participant.role === "execution_partner" && participantMatchesAccess(participant, access),
  );
  assert(executionParticipant, "Only the targeted execution partner can respond to this case", "FORBIDDEN");
  assert(offerCase.stage === "targeted", "Only targeted cases can be responded to");
  await ctx.db.patch(executionParticipant._id, {
    status: args.status,
    updatedAt: Date.now(),
  });
  if (args.status === "accepted") {
    await setCaseStage(ctx, args.id, "engaged");
    await insertActivity(ctx, {
      offerCaseId: args.id,
      kind: "accepted",
      actorAuthUserId: access.authUserId,
      message: "Execution partner accepted the case",
    });
    return;
  }
  await setCaseStage(ctx, args.id, "closed_lost", {
    closeNote: "Targeted execution partner rejected the case",
  });
  await insertActivity(ctx, {
    offerCaseId: args.id,
    kind: "rejected",
    actorAuthUserId: access.authUserId,
    message: "Execution partner rejected the case",
  });
}

/**
 * WHY:   The detail workspace needs explicit stage actions beyond the legacy apply/respond pair.
 * WHAT:  Advances one visible case through `agreed`, `closed_won`, or `closed_lost`.
 * HOW:   Restricts each action to owner/client-owner roles and creates the CRM deal only when the case reaches `agreed`.
 */
export async function advanceOfferCaseStageService(
  ctx: MutationCtx,
  args: {
    id: Id<"offerCases">;
    action: "mark_agreed" | "close_won" | "close_lost";
  },
) {
  const access = await requireSender(ctx);
  const offerCase = await ctx.db.get(args.id);
  assert(offerCase, "Offer case not found", "NOT_FOUND");
  const participants = await listParticipantsForCase(ctx, args.id);
  const isOwnerOrClientOwner = participants.some(
    (participant) =>
      (participant.role === "inventory_owner" || participant.role === "client_owner") &&
      participantMatchesAccess(participant, access),
  );
  assert(isOwnerOrClientOwner, "Only the owning side can advance this case", "FORBIDDEN");
  const offerPackage = await ctx.db.get(offerCase.offerPackageId);
  assert(offerPackage, "Offer package not found", "NOT_FOUND");
  const property = await loadPropertySummary(ctx, offerPackage.propertyId);

  if (args.action === "mark_agreed") {
    assert(offerCase.stage === "engaged", "Only engaged cases can move to agreed");
    await setCaseStage(ctx, args.id, "agreed");
    if (!offerCase.linkedDealId) {
      await createDealForAgreedCase(ctx, { offerCase, offerPackage, property, access });
    }
    await insertActivity(ctx, {
      offerCaseId: args.id,
      kind: "agreed",
      actorAuthUserId: access.authUserId,
      message: "Case moved to agreed",
    });
    return { ok: true } as const;
  }

  assert(offerCase.stage === "agreed", "Only agreed cases can be closed");
  const targetStage = args.action === "close_won" ? "closed_won" : "closed_lost";
  await setCaseStage(ctx, args.id, targetStage);
  await insertActivity(ctx, {
    offerCaseId: args.id,
    kind: targetStage,
    actorAuthUserId: access.authUserId,
    message: targetStage === "closed_won" ? "Case closed as won" : "Case closed as lost",
  });
  return { ok: true } as const;
}
