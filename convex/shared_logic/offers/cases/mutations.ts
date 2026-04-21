import { ConvexError } from "convex/values";
import type { Doc, Id } from "../../../_generated/dataModel";
import type { MutationCtx } from "../../../_generated/server";
import { requireSender, requireVerifiedSender } from "../access";
import { attachOrganizationAssetsForTenant } from "../../organizationAssets";
import { isPropertyDistributionReady } from "../../projects/readiness";
import { resolveOfferRecipient } from "../recipients";
import { insertActivity, listParticipantsForCase, loadPropertySummary, participantMatchesAccess, setCaseStage } from "./repositories";
import { assert, resolveCaseType, resolveStageForDraft, resolveStageForPublish, resolveVisibility } from "./shared";
import type { CreateOfferCaseArgs, UpdateOfferCaseDraftArgs } from "./types";

async function createDealForAgreedCase(
  ctx: MutationCtx,
  args: {
    offerCase: Doc<"offerCases">;
    offerPackage: Doc<"offerPackages">;
    property: Doc<"properties"> | null;
    access: Awaited<ReturnType<typeof requireSender>>;
  },
) {
  const participants = await listParticipantsForCase(ctx, args.offerCase._id);
  const inventoryOwner = participants.find((participant) => participant.role === "inventory_owner");
  const clientOwner = participants.find((participant) => participant.role === "client_owner");
  const dealId = await ctx.db.insert("deals", {
    createdAt: Date.now(),
    title: args.offerCase.headline ?? args.property?.title ?? "Client requirement",
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
  const caseType = resolveCaseType(args);
  const packageVisibility = resolveVisibility(args);
  const property = args.propertyId ? await loadPropertySummary(ctx, args.propertyId) : null;
  if (caseType !== "collaboration_case") {
    assert(args.propertyId, "Property is required for property offers", "INVALID_ARGUMENT");
  }
  if (caseType === "collaboration_case") {
    assert(args.clientContext?.clientName && args.clientContext.clientNeed, "Client context is required for collaboration cases");
  }
  if (caseType === "open_offer") {
    assert(property && isPropertyDistributionReady(property), "Open offers require a Saudi-ready published project dossier", "PROJECT_READINESS_REQUIRED");
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
      stage: resolveStageForDraft(),
      visibility: packageVisibility,
      initiatedByAuthUserId: access.authUserId,
      sourceConversationId: args.sourceConversationId,
      headline: args.message ?? property?.title ?? "Client requirement",
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
    await attachOrganizationAssetsForTenant(ctx, {
      keys: (args.attachments ?? []).map((file) => file.key),
      attachedEntityType: "offer",
      attachedEntityId: String(offerCaseId),
      visibilityScope: "organization",
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
    stage: resolveStageForDraft(),
    visibility: packageVisibility,
    initiatedByAuthUserId: access.authUserId,
    sourceConversationId: args.sourceConversationId,
    headline: args.message ?? property?.title ?? "Property offer",
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
  await attachOrganizationAssetsForTenant(ctx, {
    keys: (args.attachments ?? []).map((file) => file.key),
    attachedEntityType: "offer",
    attachedEntityId: String(offerCaseId),
    visibilityScope: "organization",
  });
  return offerCaseId;
}

export async function createOfferService(ctx: MutationCtx, args: CreateOfferCaseArgs) {
  const offerCaseId = await createOfferCase(ctx, args, { draft: true });
  return buildDraftCreateResult(offerCaseId);
}

export async function createOfferDraftService(ctx: MutationCtx, args: CreateOfferCaseArgs) {
  const offerCaseId = await createOfferCase(ctx, args, { draft: true });
  return buildDraftCreateResult(offerCaseId);
}

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
  if (offerCase.type !== "collaboration_case") {
    assert(args.propertyId ?? offerPackage.propertyId, "Property is required for property offers", "INVALID_ARGUMENT");
  }
  await ctx.db.patch(offerCase._id, {
    headline: args.message,
    summary: args.description,
    clientContext: args.clientContext,
    updatedAt: Date.now(),
    lastActivityAt: Date.now(),
  });
  await ctx.db.patch(offerPackage._id, {
    ...(args.propertyId ? { propertyId: args.propertyId } : {}),
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
  await attachOrganizationAssetsForTenant(ctx, {
    keys: (args.attachments ?? []).map((file) => file.key),
    attachedEntityType: "offer",
    attachedEntityId: String(offerCase._id),
    visibilityScope: "organization",
  });
  return { ok: true } as const;
}

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
  const property = offerPackage.propertyId ? await loadPropertySummary(ctx, offerPackage.propertyId) : null;

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
