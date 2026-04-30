import { ConvexError } from "convex/values";
import type { Doc, Id } from "../../../_generated/dataModel";
import type { QueryCtx } from "../../../_generated/server";
import { requireSender } from "../access";
import { getProfileByAuthUserId, listParticipantsForCase, participantMatchesAccess } from "./repositories";
import { assert, isClosedStage, isOpenlyVisible, isPresent, legacyPublicationStateFromStage, legacyStatusFromStage, legacyVisibilityFromPackage } from "./shared";

async function buildParticipantSummary(
  ctx: QueryCtx,
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
  ctx: QueryCtx,
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

function extractPropertySummary(property: Doc<"properties"> | null) {
  const presentation = property?.body?.presentation;
  if (
    presentation &&
    typeof presentation === "object" &&
    "descriptionShort" in presentation &&
    typeof presentation.descriptionShort === "string"
  ) {
    const trimmed = presentation.descriptionShort.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
}

function extractPropertyGallery(property: Doc<"properties"> | null) {
  if (!property) return [];

  const urls = [
    property.heroImage?.url ?? null,
    ...(property.media?.map((media) => media.url ?? null) ?? []),
  ].filter((url): url is string => typeof url === "string" && url.length > 0);

  return [...new Set(urls)];
}

async function buildPrimaryOrganization(args: {
  ctx: QueryCtx;
  ownerParticipant: Doc<"offerCaseParticipants"> | null;
  ownerSummary: Awaited<ReturnType<typeof buildParticipantSummary>> | null;
}) {
  const { ctx, ownerParticipant, ownerSummary } = args;
  if (!ownerParticipant && !ownerSummary) {
    return null;
  }

  const broker = ownerParticipant?.brokerId ? await ctx.db.get(ownerParticipant.brokerId) : null;
  const red = ownerParticipant?.REDId ? await ctx.db.get(ownerParticipant.REDId) : null;
  const logoId = broker?.logoId ?? red?.logoId ?? null;

  return {
    id: ownerParticipant?.brokerId
      ? String(ownerParticipant.brokerId)
      : ownerParticipant?.REDId
        ? String(ownerParticipant.REDId)
        : ownerSummary?.organizationId ?? null,
    name: ownerSummary?.organizationName ?? broker?.name ?? red?.name ?? "طرف غير معروف",
    type: broker ? "broker" : red ? "developer" : ownerSummary?.organizationType ?? null,
    logoUrl: logoId ? await ctx.storage.getUrl(logoId) : null,
    website: broker?.website ?? red?.website ?? null,
    contactEmail: broker?.contactEmail ?? red?.contactEmail ?? null,
    phone: broker?.phone ?? red?.phone ?? null,
  };
}

async function buildCaseSummary(
  ctx: QueryCtx,
  offerCase: Doc<"offerCases">,
  access: Awaited<ReturnType<typeof requireSender>> | null,
) {
  const offerPackage = await ctx.db.get(offerCase.offerPackageId);
  if (!offerPackage) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Offer package not found" });
  }
  const property = offerPackage.propertyId ? await ctx.db.get(offerPackage.propertyId) : null;
  const participants = await listParticipantsForCase(ctx, offerCase._id);
  const participantSummaries = await Promise.all(participants.map((participant) => buildParticipantSummary(ctx, participant)));
  const ownerParticipant = participants.find((participant) => participant.role === "inventory_owner") ?? participants[0] ?? null;
  const owner = participantSummaries.find((participant) => participant.role === "inventory_owner") ?? participantSummaries[0] ?? null;
  const targeted = participants.find((participant) => participant.role === "execution_provider") ?? null;
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
    propertyId: offerPackage.propertyId ? String(offerPackage.propertyId) : null,
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
          beds: property.beds,
          baths: property.baths,
          sqft: property.sqft,
          location: property.location,
          area: property.area,
          imageUrl: property.heroImage?.url ?? property.media?.[0]?.url,
        }
      : null,
    propertyGallery: extractPropertyGallery(property),
    propertySummary: extractPropertySummary(property),
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
          budgetMin: offerCase.clientContext.budgetMin,
          budgetMax: offerCase.clientContext.budgetMax,
          location: offerCase.clientContext.location ?? null,
          area: offerCase.clientContext.area ?? null,
          bedsMin: offerCase.clientContext.bedsMin,
          bathsMin: offerCase.clientContext.bathsMin,
          sqftMin: offerCase.clientContext.sqftMin,
          sqftMax: offerCase.clientContext.sqftMax,
        }
      : null,
    primaryOrganization: await buildPrimaryOrganization({
      ctx,
      ownerParticipant,
      ownerSummary: owner,
    }),
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
  const isExecutionProvider = matchingParticipants.some((participant) => participant.role === "execution_provider");
  const executionParticipant = matchingParticipants.find((participant) => participant.role === "execution_provider");
  return {
    isInventoryOwner,
    isClientOwner,
    isExecutionProvider,
    canEditDraft: isInventoryOwner && args.offerCase.stage === "draft",
    canPublish: isInventoryOwner && args.offerCase.stage === "draft",
    canArchive: (isInventoryOwner || isClientOwner) && !isClosedStage(args.offerCase.stage),
    canEngage: args.offerCase.stage === "open" && !isInventoryOwner,
    canRespond: isExecutionProvider && args.offerCase.stage === "targeted" && executionParticipant?.status !== "rejected",
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
    isRecipient: allowedActions.isExecutionProvider,
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
  const isExecutionProvider = summary.participants.some(
    (participant) =>
      participant.role === "execution_provider" &&
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
  if (isExecutionProvider && (summary.type === "private_offer" || summary.type === "collaboration_case")) {
    return "incoming_broker_requests";
  }
  if (isOwner && summary.type === "open_offer") return "open_inventory";
  return "targeted_shares";
}

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
      participant.role === "execution_provider" &&
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

export async function listSentOffersService(ctx: QueryCtx) {
  const snapshot = await getWorkspaceOfferQueuesService(ctx);
  return snapshot.sent;
}

export async function listReceivedOffersService(ctx: QueryCtx) {
  const snapshot = await getWorkspaceOfferQueuesService(ctx);
  return snapshot.received;
}

export async function listPublicOffersService(ctx: QueryCtx) {
  const snapshot = await getWorkspaceOfferQueuesService(ctx);
  return snapshot.marketplace;
}

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

export async function getOfferLiveStateService(
  ctx: QueryCtx,
  args: { offerId: Id<"offerCases"> | string },
) {
  const access = await requireSender(ctx);
  const offerCase = await ctx.db.get(args.offerId as Id<"offerCases">);
  if (!offerCase) return null;
  return buildCaseDetail(ctx, offerCase, access);
}
