import { requireSessionContext } from "@/server/auth/session";
import { DomainError } from "@/server/contracts/errors";
import type { UploadedFileReference } from "@/server/contracts/files";
import type {
  BootstrapOfferConversationInput,
  CreatePrivateOfferInConversationInput,
  MarkConversationReadInput,
  ResolveDirectConversationInput,
  SendConversationMessageInput,
  ShareDealInConversationInput,
  ShareFileInConversationInput,
  ShareProjectInConversationInput,
} from "@/server/contracts/inbox";
import type { WorkspaceBehavior } from "@/server/contracts/workspace";
import {
  convexInboxRepository,
  type InboxRepository,
} from "@/server/infrastructure/convex/inboxRepository";
import { getWorkspaceBehaviorForCurrentUser } from "@/server/domains/workspaces/service";
import { getWorkspaceCrmZone, getWorkspaceOffersZone, getWorkspacePropertyZone } from "@/server/ws/zones";

type InboxServiceDependencies = {
  requireSession: typeof requireSessionContext;
  getWorkspaceBehavior: typeof getWorkspaceBehaviorForCurrentUser;
  repository: InboxRepository;
};

const defaultDependencies: InboxServiceDependencies = {
  requireSession: requireSessionContext,
  getWorkspaceBehavior: getWorkspaceBehaviorForCurrentUser,
  repository: convexInboxRepository,
};

type CollaborationAccessContext = {
  session: Awaited<ReturnType<typeof requireSessionContext>>;
  workspace: WorkspaceBehavior;
  conversation: Awaited<ReturnType<InboxRepository["get"]>>;
};

/**
 * WHY:   Collaboration cards should only be created inside broker↔developer inbox threads in this phase.
 * WHAT:  Resolves the authenticated session, workspace behavior, and current conversation in one shared helper.
 * HOW:   Loads session/workspace concurrently, verifies broker/developer audience, and rejects non-collaboration recipients early.
 */
async function requireCollaborationContext(
  conversationId: string,
  dependencies: InboxServiceDependencies,
): Promise<CollaborationAccessContext> {
  const [session, workspace] = await Promise.all([
    dependencies.requireSession(),
    dependencies.getWorkspaceBehavior(),
  ]);

  if (workspace.audience !== "broker" && workspace.audience !== "developer") {
    throw new DomainError({
      code: "FORBIDDEN",
      message: "Inbox collaboration actions are only available for brokers and developers",
      status: 403,
    });
  }

  if (!workspace.ownerContext || !workspace.primaryOrganization) {
    throw new DomainError({
      code: "FORBIDDEN",
      message: "Organization context is required for inbox collaboration",
      status: 403,
    });
  }

  const conversation = await dependencies.repository.get(session.token, conversationId);
  const recipientRole = conversation.otherUser.role;
  if (recipientRole !== "broker" && recipientRole !== "developer") {
    throw new DomainError({
      code: "FORBIDDEN",
      message: "Inbox collaboration actions are limited to broker and developer threads",
      status: 403,
    });
  }

  return { session, workspace, conversation };
}

function buildActor(workspace: WorkspaceBehavior, authUserId: string) {
  return {
    authUserId,
    name: workspace.user.name ?? workspace.user.email ?? "عضو أنان",
    role: workspace.audience,
    organizationId: workspace.primaryOrganization?.id ?? null,
    organizationType: workspace.audience,
    organizationName: workspace.primaryOrganization?.name ?? null,
  } as const;
}

function buildRecipient(conversation: Awaited<ReturnType<InboxRepository["get"]>>) {
  return {
    recipientAuthUserId: conversation.otherUser.id,
    organizationId: conversation.otherUser.brokerId ?? conversation.otherUser.redId ?? null,
    organizationType: conversation.otherUser.organizationType ?? null,
    organizationName: conversation.otherUser.organizationName ?? null,
  } as const;
}

/**
 * WHY:   The inbox collaboration journey needs one consistent URL target for files that were already uploaded.
 * WHAT:  Returns the user-facing action link for a shared file.
 * HOW:   Reuses the UploadThing/public URL stored on the uploaded file reference.
 */
function getFileHref(file: UploadedFileReference) {
  return file.url;
}

/**
 * WHY:   The workspace inbox index should load conversation data from one server-owned service boundary.
 * WHAT:  Returns the authenticated user's inbox conversation summaries.
 * HOW:   Resolves the current session token once, then delegates the read to the inbox repository adapter.
 */
export async function listInboxConversations(
  dependencies: InboxServiceDependencies = defaultDependencies,
) {
  const session = await dependencies.requireSession();
  return dependencies.repository.list(session.token);
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

/**
 * WHY:   Project references should be shared from the inbox without forcing users to leave the active collaboration thread.
 * WHAT:  Sends a structured project-share card for one workspace property.
 * HOW:   Loads the property through the audience-aware workspace zone, then emits a typed inbox event card to the conversation.
 */
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

/**
 * WHY:   CRM handoff belongs inside broker↔developer collaboration so users can share a live deal from the thread itself.
 * WHAT:  Sends a structured deal-share card for one accessible CRM record.
 * HOW:   Reads the deal through the current audience's CRM zone, validates ownership implicitly, and posts a typed inbox event.
 */
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
 * WHAT:  Creates and publishes a private offer addressed to the specific thread participant.
 * HOW:   Validates collaboration access, resolves the recipient auth user and org ids from the conversation, then delegates to the workspace offers zone.
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

  const created = await offersZone.createOffer({
    propertyId: input.propertyId,
    price: input.price,
    message: input.message,
    description: input.description,
    visibility: "private",
    attachments: input.attachments,
    recipientAuthUserId: conversation.otherUser.id,
    toBrokerId: recipientBrokerId,
    toREDId: recipientREDId,
  });

  await offersZone.publishOffer({ id: created.offerId });
  return created;
}
