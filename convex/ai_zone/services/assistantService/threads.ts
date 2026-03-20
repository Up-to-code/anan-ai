import type { QueryCtx } from "../../../_generated/server";
import type { Doc, Id } from "../../../_generated/dataModel";
import type { AssistantKind, AssistantOwner, ThreadScope } from "./types";
import { WORKSPACE_KINDS } from "./types";
import { isWorkspaceKind, normalizeOwner } from "./utils";

function matchesAssistantKind(
  thread: Doc<"assistantThreads">,
  assistantKind?: AssistantKind
): boolean {
  if (!assistantKind) return true;

  const kind = (thread.assistantKind ?? "default") as AssistantKind;
  if (assistantKind === "anan_workspace") {
    return WORKSPACE_KINDS.includes(kind);
  }
  return kind === assistantKind;
}

function getThreadScope(thread: Doc<"assistantThreads">): ThreadScope {
  return (thread as { scope?: ThreadScope }).scope === "organization"
    ? "organization"
    : "user";
}

function canAccessThread(
  thread: Doc<"assistantThreads">,
  owner: AssistantOwner,
  assistantKind?: AssistantKind
): boolean {
  if (!matchesAssistantKind(thread, assistantKind)) return false;

  const scope = getThreadScope(thread);
  if (scope === "organization" && isWorkspaceKind(assistantKind)) {
    if (owner.ownerType === "broker") {
      return Boolean(
        owner.ownerBrokerId &&
          thread.ownerBrokerId &&
          String(owner.ownerBrokerId) === String(thread.ownerBrokerId)
      );
    }
    if (owner.ownerType === "RED") {
      return Boolean(
        owner.ownerREDId &&
          thread.ownerREDId &&
          String(owner.ownerREDId) === String(thread.ownerREDId)
      );
    }
    return false;
  }

  return thread.userId === owner.userId;
}

async function collectOrganizationThreads(
  ctx: QueryCtx,
  owner: AssistantOwner,
  assistantKind?: AssistantKind
) {
  if (!isWorkspaceKind(assistantKind)) {
    return [] as Doc<"assistantThreads">[];
  }
  if (owner.ownerType === "broker" && owner.ownerBrokerId) {
    return ctx.db
      .query("assistantThreads")
      .withIndex("ownerBrokerId", (q: any) => q.eq("ownerBrokerId", owner.ownerBrokerId))
      .collect();
  }
  if (owner.ownerType === "RED" && owner.ownerREDId) {
    return ctx.db
      .query("assistantThreads")
      .withIndex("ownerREDId", (q: any) => q.eq("ownerREDId", owner.ownerREDId))
      .collect();
  }
  return [] as Doc<"assistantThreads">[];
}

function dedupeAccessibleThreads(
  threads: Doc<"assistantThreads">[],
  owner: AssistantOwner,
  assistantKind?: AssistantKind
) {
  const deduped: Doc<"assistantThreads">[] = [];
  const seen = new Set<string>();
  for (const thread of threads) {
    const id = String(thread._id);
    if (seen.has(id)) continue;
    seen.add(id);
    if (canAccessThread(thread, owner, assistantKind)) {
      deduped.push(thread);
    }
  }
  return deduped.sort((a, b) => b.updatedAt - a.updatedAt);
}

async function collectAccessibleThreads(
  ctx: QueryCtx,
  owner: AssistantOwner,
  assistantKind?: AssistantKind
): Promise<Doc<"assistantThreads">[]> {
  const userThreads = await ctx.db
    .query("assistantThreads")
    .withIndex("userId", (q: any) => q.eq("userId", owner.userId))
    .collect();
  const organizationThreads = await collectOrganizationThreads(ctx, owner, assistantKind);
  return dedupeAccessibleThreads([...userThreads, ...organizationThreads], owner, assistantKind);
}

/**
 * Fetches the most recent assistant thread for a given owner context.
 */
export async function getLatestThread(
  ctx: QueryCtx,
  ownerOrUser: string | AssistantOwner,
  assistantKind?: AssistantKind
): Promise<Doc<"assistantThreads"> | null> {
  const owner = normalizeOwner(ownerOrUser);
  const threads = await collectAccessibleThreads(ctx, owner, assistantKind);
  if (threads.length === 0) return null;

  if (isWorkspaceKind(assistantKind)) {
    const latestOrganizationThread = threads.find(
      (thread) => getThreadScope(thread) === "organization"
    );
    if (latestOrganizationThread) {
      return latestOrganizationThread;
    }
  }

  return threads[0] ?? null;
}

/**
 * Returns recent assistant threads for the current owner context and assistant kind.
 */
export async function listRecentThreads(
  ctx: QueryCtx,
  ownerOrUser: string | AssistantOwner,
  assistantKind?: AssistantKind,
  limit = 6
) {
  const owner = normalizeOwner(ownerOrUser);
  const threads = await collectAccessibleThreads(ctx, owner, assistantKind);

  if (!isWorkspaceKind(assistantKind)) {
    return threads.slice(0, limit);
  }

  const organizationThreads = threads.filter(
    (thread) => getThreadScope(thread) === "organization"
  );
  const legacyUserThreads = threads.filter(
    (thread) => getThreadScope(thread) !== "organization"
  );
  return [...organizationThreads, ...legacyUserThreads].slice(0, limit);
}

/**
 * Lists all messages for a thread, verifying ownership first.
 */
export async function listThreadMessages(
  ctx: QueryCtx,
  owner: AssistantOwner,
  threadId?: Id<"assistantThreads">,
  assistantKind?: AssistantKind
) {
  const thread = threadId
    ? await ctx.db.get(threadId)
    : await getLatestThread(ctx, owner, assistantKind);
  if (!thread || !canAccessThread(thread, owner, assistantKind)) return [];

  const messages = await ctx.db
    .query("assistantMessages")
    .withIndex("threadId", (q) => q.eq("threadId", thread._id))
    .collect();

  return messages.sort((a, b) => a.createdAt - b.createdAt);
}

/**
 * Internal helper to fetch a specific message content by ID.
 * Used by durable workflows which only receive the message ID.
 */
export async function getMessageContent(
  ctx: QueryCtx,
  messageId: Id<"assistantMessages">
): Promise<Doc<"assistantMessages"> | null> {
  return ctx.db.get(messageId);
}
