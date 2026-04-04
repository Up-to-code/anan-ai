import { requireSessionContext } from "@/server/auth/session";
import { DomainError } from "@/server/contracts/errors";
import type {
  BootstrapOfferConversationInput,
  CreatePrivateOfferInConversationInput,
  MarkConversationReadInput,
  PublishConversationOfferInput,
  ResolveDirectConversationInput,
  RespondToConversationOfferInput,
  SetConversationArchivedInput,
  SendConversationMessageInput,
  ShareDealInConversationInput,
  ShareFileInConversationInput,
  ShareProjectInConversationInput,
  UpdatePrivateOfferDraftInConversationInput,
} from "@/server/contracts/inbox";
import {
  convexInboxRepository,
} from "@/server/infrastructure/convex/messaging/inbox";
import { convexOrganizationAssetsRepository } from "@/server/infrastructure/convex/organizations/assets";
import { getWorkspaceBehaviorForCurrentUser } from "@/server/domains/auth/workspaces/service";
import { getWorkspaceCrmZone, getWorkspaceOffersZone, getWorkspacePropertyZone } from "@/server/ws/zones";
import {
  buildActor,
  buildRecipient,
  getFileHref,
  type InboxServiceDependencies,
  requireCollaborationContext,
} from "./service.helpers";

const defaultDependencies: InboxServiceDependencies = {
  requireSession: requireSessionContext,
  getWorkspaceBehavior: getWorkspaceBehaviorForCurrentUser,
  repository: convexInboxRepository,
};

/**
 * WHY:   The workspace inbox index should load conversation data from one server-owned service boundary.
 * WHAT:  Returns the authenticated user's inbox conversation summaries.
 * HOW:   Resolves the current session token once, then delegates the read to the inbox repository adapter.
 */
export async function listInboxConversations(
  archived = false,
  dependencies: InboxServiceDependencies = defaultDependencies,
) {
  const session = await dependencies.requireSession();
  return dependencies.repository.list(session.token, archived);
}

/**
 * WHY:   Workspace chrome needs unread counts without loading full conversation lists on every request.
 * WHAT:  Returns the authenticated user's total unread inbox count.
 * HOW:   Resolves the current session token once, then delegates to a lightweight repository summary query.
 */
export async function getInboxUnreadSummaryForCurrentUser(
  dependencies: InboxServiceDependencies = defaultDependencies,
) {
  const session = await dependencies.requireSession();
  return dependencies.repository.getUnreadSummary(session.token);
}

/**
 * WHY:   Inbox detail routes should load a specific thread through the same server boundary as list/search flows.
 * WHAT:  Returns the full message history and participant summary for one conversation id.
 * HOW:   Authenticates the request with the current session token, then delegates to the repository detail read.
 */
export async function getInboxConversation(
  conversationId: string,
  dependencies: InboxServiceDependencies = defaultDependencies,
) {
  const session = await dependencies.requireSession();
  return dependencies.repository.get(session.token, conversationId);
}

/**
 * WHY:   Starting a direct inbox thread should stay behind one stable server interface for routes and pages.
 * WHAT:  Resolves the deterministic direct-conversation id for the requested target user.
 * HOW:   Uses the authenticated session token and forwards the validated input to the inbox repository mutation.
 */
export async function resolveInboxConversation(
  input: ResolveDirectConversationInput,
  dependencies: InboxServiceDependencies = defaultDependencies,
) {
  const session = await dependencies.requireSession();
  return dependencies.repository.resolve(session.token, input);
}

/**
 * WHY:   Offer detail screens need one server-owned entrypoint for opening the correct conversation with starter offer context.
 * WHAT:  Resolves and seeds the direct offer conversation for the current workspace user.
 * HOW:   Uses the current session token, delegates to the Convex-backed inbox repository, and returns the created or reused conversation id.
 */
export async function bootstrapInboxOfferConversation(
  input: BootstrapOfferConversationInput,
  dependencies: InboxServiceDependencies = defaultDependencies,
) {
  const session = await dependencies.requireSession();
  return dependencies.repository.bootstrapOffer(session.token, input);
}

/**
 * WHY:   Composing inbox replies should pass through a single server-owned mutation boundary.
 * WHAT:  Sends a text or structured inbox message for the current authenticated user.
 * HOW:   Resolves the session token and forwards the validated payload to the repository send mutation.
 */
export async function sendInboxMessage(
  input: SendConversationMessageInput,
  dependencies: InboxServiceDependencies = defaultDependencies,
) {
  const session = await dependencies.requireSession();
  return dependencies.repository.send(session.token, input);
}

/**
 * WHY:   Active inbox threads must clear unread state through the server layer instead of calling repositories directly.
 * WHAT:  Marks one conversation as read for the current authenticated user.
 * HOW:   Resolves the session token and delegates the read-state mutation to the inbox repository.
 */
export async function markInboxConversationRead(
  input: MarkConversationReadInput,
  dependencies: InboxServiceDependencies = defaultDependencies,
) {
  const session = await dependencies.requireSession();
  return dependencies.repository.markRead(session.token, input);
}

export async function setInboxConversationArchived(
  input: SetConversationArchivedInput,
  dependencies: InboxServiceDependencies = defaultDependencies,
) {
  const session = await dependencies.requireSession();
  return dependencies.repository.setArchived(session.token, input);
}

/**
 * WHY:   Recipient discovery should stay centralized so inbox search behavior matches the backend collaboration model.
 * WHAT:  Searches messageable inbox targets for the current authenticated user.
 * HOW:   Reuses the repository's collaboration-aware target search with the session token already resolved.
 */
export async function searchInboxTargets(
  query: string,
  dependencies: InboxServiceDependencies = defaultDependencies,
) {
  const session = await dependencies.requireSession();
  return dependencies.repository.searchTargets(session.token, query);
}

/**
 * WHY:   Broker↔developer threads need a file-sharing action that emits a structured inbox card instead of raw pasted URLs.
 * WHAT:  Shares one uploaded file into the active conversation with actor/recipient context and a deep-link action.
 * HOW:   Verifies collaboration access, then sends a typed inbox event card through the existing inbox repository mutation.
 */
export async function shareInboxFileInConversation(
  input: ShareFileInConversationInput,
  dependencies: InboxServiceDependencies = defaultDependencies,
) {
  const { session, workspace, conversation } = await requireCollaborationContext(input.conversationId, dependencies);
  const summary = input.note?.trim() || `تمت مشاركة الملف ${input.file.name}`;

  await convexOrganizationAssetsRepository.attachOrganizationAssets(session.token, {
    keys: [input.file.key],
    attachedEntityType: "conversation",
    attachedEntityId: conversation.id,
    visibilityScope: "organization",
  });

  return dependencies.repository.send(session.token, {
    conversationId: input.conversationId,
    type: "file_share",
    body: summary,
    metadata: {
      contextType: "file_share",
      actor: buildActor(workspace, session.context.userId),
      recipient: buildRecipient(conversation),
      title: input.file.name,
      summary,
      href: getFileHref(input.file),
      action: {
        type: "open_file",
        label: "افتح الملف",
        href: getFileHref(input.file),
      },
      file: input.file,
    },
  });
}

export async function shareInboxProjectInConversation(
  input: ShareProjectInConversationInput,
  dependencies: InboxServiceDependencies = defaultDependencies,
) {
  const { session, workspace, conversation } = await requireCollaborationContext(input.conversationId, dependencies);
  const propertyZone = getWorkspacePropertyZone(workspace.audience, workspace.ownerContext);
  const property = await propertyZone.getProperty({ id: input.propertyId }).catch(() => null);

  if (!property) {
    throw new DomainError({
      code: "NOT_FOUND",
      message: "Project not found",
      status: 404,
    });
  }

  const summary = input.note?.trim() || property.location || property.address || "تمت مشاركة مشروع من المساحة";

  return dependencies.repository.send(session.token, {
    conversationId: input.conversationId,
    type: "project_share",
    body: input.note?.trim() || `تمت مشاركة مشروع ${property.title}`,
    metadata: {
      contextType: "project_share",
      actor: buildActor(workspace, session.context.userId),
      recipient: buildRecipient(conversation),
      title: property.title,
      summary,
      href: `/ws/projects/${property._id}`,
      action: {
        type: "open_project",
        label: "افتح المشروع",
        href: `/ws/projects/${property._id}`,
      },
      propertyId: property._id,
      location: property.location ?? property.address ?? null,
      imageUrl: property.heroImage?.url ?? property.media?.[0]?.url ?? null,
    },
  });
}

export async function shareInboxDealInConversation(
  input: ShareDealInConversationInput,
  dependencies: InboxServiceDependencies = defaultDependencies,
) {
  const { session, workspace, conversation } = await requireCollaborationContext(input.conversationId, dependencies);
  const crmZone = getWorkspaceCrmZone(workspace.audience, workspace.ownerContext);
  const deals = await crmZone.listDeals();
  const deal = deals.find((item) => item.id === input.dealId) ?? null;

  if (!deal) {
    throw new DomainError({
      code: "NOT_FOUND",
      message: "Deal not found",
      status: 404,
    });
  }
  const summary = input.note?.trim() || deal.description || deal.contactName || "تمت مشاركة صفقة CRM";
  return dependencies.repository.send(session.token, {
    conversationId: input.conversationId,
    type: "deal_share",
    body: input.note?.trim() || `تمت مشاركة صفقة ${deal.title}`,
    metadata: {
      contextType: "deal_share",
      actor: buildActor(workspace, session.context.userId),
      recipient: buildRecipient(conversation),
      title: deal.title,
      summary,
      href: `/ws/crm/clients/${deal.id}`,
      action: {
        type: "open_deal",
        label: "افتح الصفقة",
        href: `/ws/crm/clients/${deal.id}`,
      },
      dealId: deal.id,
      stage: deal.stage,
      value: deal.value ?? null,
      propertyId: deal.propertyId ?? null,
    },
  });
}

/**
 * WHY:   Targeted private offers should be creatable from the active conversation so users do not have to restart the flow elsewhere.
 * WHAT:  Creates a private offer draft addressed to the specific thread participant.
 * HOW:   Validates collaboration access, resolves the recipient auth user and org ids from the conversation, then delegates to the workspace offers zone draft flow.
 */
export async function createInboxPrivateOfferInConversation(
  input: CreatePrivateOfferInConversationInput,
  dependencies: InboxServiceDependencies = defaultDependencies,
) {
  const { workspace, conversation } = await requireCollaborationContext(input.conversationId, dependencies);
  const offersZone = getWorkspaceOffersZone(workspace.audience, workspace.ownerContext);
  const recipientBrokerId = conversation.otherUser.brokerId ?? undefined;
  const recipientREDId = conversation.otherUser.redId ?? undefined;

  if (!conversation.otherUser.id || (!recipientBrokerId && !recipientREDId)) {
    throw new DomainError({
      code: "INVALID_ARGUMENT",
      message: "A specific recipient user and organization are required for private offers",
      status: 400,
    });
  }

  return offersZone.createOfferDraft({
    propertyId: input.propertyId,
    price: input.price,
    message: input.message,
    description: input.description,
    visibility: "private",
    attachments: input.attachments,
    sourceConversationId: conversation.id,
    recipientAuthUserId: conversation.otherUser.id,
    toBrokerId: recipientBrokerId,
    toREDId: recipientREDId,
  });
}

/**
 * WHY:   Draft-first inbox offers need a focused update path that keeps the recipient locked to the active conversation.
 * WHAT:  Updates one private offer draft linked to the current conversation.
 * HOW:   Verifies collaboration access, then delegates the draft patch to the workspace offers zone with the conversation guard.
 */
export async function updateInboxPrivateOfferDraft(
  input: UpdatePrivateOfferDraftInConversationInput,
  dependencies: InboxServiceDependencies = defaultDependencies,
) {
  const { workspace } = await requireCollaborationContext(input.conversationId, dependencies);
  const offersZone = getWorkspaceOffersZone(workspace.audience, workspace.ownerContext);
  return offersZone.updateOfferDraft({
    id: input.offerId,
    conversationId: input.conversationId,
    propertyId: input.propertyId,
    price: input.price,
    message: input.message,
    description: input.description,
    attachments: input.attachments,
  });
}

/**
 * WHY:   Draft activation should happen from the inbox thread where the private offer was prepared.
 * WHAT:  Publishes one conversation-linked private offer and delivers it to the recipient.
 * HOW:   Verifies collaboration access, then delegates publish + side effects to the workspace offers zone.
 */
export async function publishInboxConversationOffer(
  input: PublishConversationOfferInput,
  dependencies: InboxServiceDependencies = defaultDependencies,
) {
  const { workspace } = await requireCollaborationContext(input.conversationId, dependencies);
  const offersZone = getWorkspaceOffersZone(workspace.audience, workspace.ownerContext);
  return offersZone.publishConversationOffer({
    id: input.offerId,
    conversationId: input.conversationId,
  });
}

/**
 * WHY:   Recipients should be able to accept or reject private offers without leaving the inbox flow.
 * WHAT:  Responds to one inbox-linked offer for the current recipient.
 * HOW:   Verifies collaboration access and delegates the response mutation to the workspace offers zone.
 */
export async function respondToInboxConversationOffer(
  input: RespondToConversationOfferInput,
  dependencies: InboxServiceDependencies = defaultDependencies,
) {
  const { workspace } = await requireCollaborationContext(input.conversationId, dependencies);
  const offersZone = getWorkspaceOffersZone(workspace.audience, workspace.ownerContext);
  await offersZone.respondToOffer({
    id: input.offerId,
    status: input.status,
  });
  return { ok: true } as const;
}
