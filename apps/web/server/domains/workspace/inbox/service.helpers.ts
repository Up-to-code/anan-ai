import { DomainError } from "@/server/contracts/errors";
import type { UploadedFileReference } from "@/server/contracts/files";
import type { WorkspaceBehavior } from "@/server/contracts/workspace";
import type { requireSessionContext } from "@/server/auth/session";
import type { getWorkspaceBehaviorForCurrentUser } from "@/server/domains/auth/workspaces/service";
import type { InboxRepository } from "@/server/infrastructure/convex/messaging/inbox";

export type InboxServiceDependencies = {
  requireSession: typeof requireSessionContext;
  getWorkspaceBehavior: typeof getWorkspaceBehaviorForCurrentUser;
  repository: InboxRepository;
};

export type CollaborationAccessContext = {
  session: Awaited<ReturnType<typeof requireSessionContext>>;
  workspace: WorkspaceBehavior;
  conversation: Awaited<ReturnType<InboxRepository["get"]>>;
};

export async function requireCollaborationContext(
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

export function buildActor(workspace: WorkspaceBehavior, authUserId: string) {
  return {
    authUserId,
    name: workspace.user.name ?? workspace.user.email ?? "عضو عنان",
    role: workspace.audience,
    organizationId: workspace.primaryOrganization?.id ?? null,
    organizationType: workspace.audience,
    organizationName: workspace.primaryOrganization?.name ?? null,
  } as const;
}

export function buildRecipient(conversation: Awaited<ReturnType<InboxRepository["get"]>>) {
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
export function getFileHref(file: UploadedFileReference) {
  return file.url;
}
