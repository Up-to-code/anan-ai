import type { MutationCtx } from "../../_generated/server";
import { appendConversationEvent } from "./conversations";
import type {
  DealShareMetadata,
  FileShareMetadata,
  InviteEventMetadata,
  ProjectShareMetadata,
  RoleEventMetadata,
} from "./types";

/**
 * WHY:   Organization collaboration history should live in the same direct thread as business messages, not only in settings screens.
 * WHAT:  Appends a non-text collaboration card such as a file/project/deal share or invite/role event.
 * HOW:   Reuses the deterministic direct-conversation resolver and the shared unread-count update path for event cards.
 */
export async function appendInboxCollaborationEvent(
  ctx: MutationCtx,
  args: {
    senderUserId: string;
    recipientUserId: string;
    type: "file_share" | "project_share" | "deal_share" | "invite_event" | "role_event";
    body: string;
    metadata:
      | FileShareMetadata
      | ProjectShareMetadata
      | DealShareMetadata
      | InviteEventMetadata
      | RoleEventMetadata;
  }
) {
  return appendConversationEvent(ctx, {
    senderUserId: args.senderUserId,
    recipientUserId: args.recipientUserId,
    type: args.type,
    body: args.body,
    metadata: args.metadata as unknown as Record<string, unknown>,
  });
}

