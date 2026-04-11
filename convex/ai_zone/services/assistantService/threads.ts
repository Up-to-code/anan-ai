import type { QueryCtx } from "../../../_generated/server";
import type { Doc, Id } from "../../../_generated/dataModel";
import {
  getAgentMessageById,
  getAssistantThreadStateByThreadId,
  listAgentThreadMessages,
  listAssistantMessageStatesByThreadId,
  mapAssistantMessageState,
  mapAssistantThreadState,
} from "./runtime";
import type {
  AssistantKind,
  AssistantMessageRecord,
  AssistantOwner,
  AssistantThreadRecord,
  ThreadScope,
} from "./types";
import { WORKSPACE_KINDS } from "./types";
import { isWorkspaceKind, normalizeOwner } from "./utils";

function matchesAssistantKind(
  thread: { assistantKind?: AssistantKind },
  assistantKind?: AssistantKind,
): boolean {
  if (!assistantKind) return true;

  const kind = (thread.assistantKind ?? "default") as AssistantKind;
  if (assistantKind === "anan_workspace") {
    return WORKSPACE_KINDS.includes(kind);
  }
  return kind === assistantKind;
}

function getThreadScope(thread: { scope?: ThreadScope }): ThreadScope {
  return thread.scope === "organization" ? "organization" : "user";
}

function toAssistantKind(kind?: AssistantKind) {
  return kind ?? "default";
}

function canAccessThread(
  thread: AssistantThreadRecord,
  owner: AssistantOwner,
  assistantKind?: AssistantKind,
): boolean {
  if (!matchesAssistantKind(thread, assistantKind)) return false;

  const scope = getThreadScope(thread);
  if (scope === "organization" && isWorkspaceKind(assistantKind)) {
    if (owner.ownerType === "broker") {
      return Boolean(
        owner.ownerBrokerId &&
          thread.ownerBrokerId &&
          String(owner.ownerBrokerId) === String(thread.ownerBrokerId),
      );
    }
    if (owner.ownerType === "RED") {
      return Boolean(
        owner.ownerREDId &&
          thread.ownerREDId &&
          String(owner.ownerREDId) === String(thread.ownerREDId),
      );
    }
    return false;
  }

  return thread.userId === owner.userId;
}

function mapLegacyThread(
  thread: Doc<"assistantThreads">,
): AssistantThreadRecord {
  return {
    _id: String(thread._id),
    userId: thread.userId,
    scope: thread.scope,
    ownerType: thread.ownerType,
    ownerBrokerId: thread.ownerBrokerId,
    ownerREDId: thread.ownerREDId,
    mode: thread.mode,
    orchestratorName: thread.orchestratorName,
    assistantKind: thread.assistantKind,
    title: thread.title,
    legacyThreadId: thread._id,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
  };
}

function mapLegacyMessage(
  message: Doc<"assistantMessages">,
): AssistantMessageRecord {
  return {
    _id: String(message._id),
    threadId: String(message.threadId),
    role: message.role,
    content: message.content,
    mode: message.mode,
    metadata:
      message.metadata && typeof message.metadata === "object" && !Array.isArray(message.metadata)
        ? (message.metadata as Record<string, unknown>)
        : undefined,
    legacyMessageId: message._id,
    createdAt: message.createdAt,
  };
}

function getThreadDedupKey(thread: AssistantThreadRecord) {
  return thread.legacyThreadId
    ? `legacy:${String(thread.legacyThreadId)}`
    : `canonical:${thread._id}`;
}

async function collectCanonicalThreads(
  ctx: QueryCtx,
  owner: AssistantOwner,
  assistantKind?: AssistantKind,
  limit = 24,
): Promise<AssistantThreadRecord[]> {
  const mapped = (rows: Doc<"assistantThreadState">[]) =>
    rows.map((row) => mapAssistantThreadState(row));

  if (assistantKind && !isWorkspaceKind(assistantKind)) {
    const rows = await ctx.db
      .query("assistantThreadState")
      .withIndex("userId_assistantKind_updatedAt", (q: any) =>
        q.eq("userId", owner.userId).eq("assistantKind", toAssistantKind(assistantKind)),
      )
      .collect();
    return mapped(rows).slice(-limit);
  }

  if (assistantKind && isWorkspaceKind(assistantKind)) {
    const [userRows, orgRows] = await Promise.all([
      Promise.all(
        WORKSPACE_KINDS.map((kind) =>
          ctx.db
            .query("assistantThreadState")
            .withIndex("userId_assistantKind_updatedAt", (q: any) =>
              q.eq("userId", owner.userId).eq("assistantKind", kind),
            )
            .collect(),
        ),
      ),
      owner.ownerType === "broker" && owner.ownerBrokerId
        ? Promise.all(
            WORKSPACE_KINDS.map((kind) =>
              ctx.db
                .query("assistantThreadState")
                .withIndex("ownerBrokerId_assistantKind_updatedAt", (q: any) =>
                  q.eq("ownerBrokerId", owner.ownerBrokerId).eq("assistantKind", kind),
                )
                .collect(),
            ),
          )
        : owner.ownerType === "RED" && owner.ownerREDId
          ? Promise.all(
              WORKSPACE_KINDS.map((kind) =>
                ctx.db
                  .query("assistantThreadState")
                  .withIndex("ownerREDId_assistantKind_updatedAt", (q: any) =>
                    q.eq("ownerREDId", owner.ownerREDId).eq("assistantKind", kind),
                  )
                  .collect(),
              ),
            )
          : Promise.resolve([]),
    ]);

    return [...mapped(userRows.flat()), ...mapped(orgRows.flat())].slice(-limit);
  }

  const userRows = await ctx.db
    .query("assistantThreadState")
    .withIndex("userId", (q: any) => q.eq("userId", owner.userId))
    .collect();
  const orgRows =
    owner.ownerType === "broker" && owner.ownerBrokerId
      ? await ctx.db
          .query("assistantThreadState")
          .withIndex("ownerBrokerId", (q: any) => q.eq("ownerBrokerId", owner.ownerBrokerId))
          .collect()
      : owner.ownerType === "RED" && owner.ownerREDId
        ? await ctx.db
            .query("assistantThreadState")
            .withIndex("ownerREDId", (q: any) => q.eq("ownerREDId", owner.ownerREDId))
            .collect()
        : [];

  return [...mapped(userRows), ...mapped(orgRows)];
}

async function collectLegacyThreads(
  ctx: QueryCtx,
  owner: AssistantOwner,
  assistantKind?: AssistantKind,
): Promise<AssistantThreadRecord[]> {
  const dedupe = (rows: Doc<"assistantThreads">[]) =>
    rows
      .map(mapLegacyThread)
      .filter((thread) => canAccessThread(thread, owner, assistantKind));

  if (assistantKind && !isWorkspaceKind(assistantKind)) {
    const rows = await ctx.db
      .query("assistantThreads")
      .withIndex("userId_assistantKind_updatedAt", (q: any) =>
        q.eq("userId", owner.userId).eq("assistantKind", toAssistantKind(assistantKind)),
      )
      .collect();
    return dedupe(rows);
  }

  if (assistantKind && isWorkspaceKind(assistantKind)) {
    const [userRows, orgRows] = await Promise.all([
      Promise.all(
        WORKSPACE_KINDS.map((kind) =>
          ctx.db
            .query("assistantThreads")
            .withIndex("userId_assistantKind_updatedAt", (q: any) =>
              q.eq("userId", owner.userId).eq("assistantKind", kind),
            )
            .collect(),
        ),
      ),
      owner.ownerType === "broker" && owner.ownerBrokerId
        ? Promise.all(
            WORKSPACE_KINDS.map((kind) =>
              ctx.db
                .query("assistantThreads")
                .withIndex("ownerBrokerId_assistantKind_updatedAt", (q: any) =>
                  q.eq("ownerBrokerId", owner.ownerBrokerId).eq("assistantKind", kind),
                )
                .collect(),
            ),
          )
        : owner.ownerType === "RED" && owner.ownerREDId
          ? Promise.all(
              WORKSPACE_KINDS.map((kind) =>
                ctx.db
                  .query("assistantThreads")
                  .withIndex("ownerREDId_assistantKind_updatedAt", (q: any) =>
                    q.eq("ownerREDId", owner.ownerREDId).eq("assistantKind", kind),
                  )
                  .collect(),
              ),
            )
          : Promise.resolve([]),
    ]);

    return dedupe([...userRows.flat(), ...orgRows.flat()]);
  }

  const userRows = await ctx.db
    .query("assistantThreads")
    .withIndex("userId", (q: any) => q.eq("userId", owner.userId))
    .collect();
  const orgRows =
    owner.ownerType === "broker" && owner.ownerBrokerId
      ? await ctx.db
          .query("assistantThreads")
          .withIndex("ownerBrokerId", (q: any) => q.eq("ownerBrokerId", owner.ownerBrokerId))
          .collect()
      : owner.ownerType === "RED" && owner.ownerREDId
        ? await ctx.db
            .query("assistantThreads")
            .withIndex("ownerREDId", (q: any) => q.eq("ownerREDId", owner.ownerREDId))
            .collect()
        : [];

  return dedupe([...userRows, ...orgRows]);
}

function dedupeAccessibleThreads(
  threads: AssistantThreadRecord[],
  owner: AssistantOwner,
  assistantKind?: AssistantKind,
) {
  const deduped: AssistantThreadRecord[] = [];
  const seen = new Set<string>();
  for (const thread of threads) {
    const key = getThreadDedupKey(thread);
    if (seen.has(key)) continue;
    seen.add(key);
    if (canAccessThread(thread, owner, assistantKind)) {
      deduped.push(thread);
    }
  }
  return deduped.sort((a, b) => b.updatedAt - a.updatedAt);
}

async function collectAccessibleThreads(
  ctx: QueryCtx,
  owner: AssistantOwner,
  assistantKind?: AssistantKind,
  limit = 24,
) {
  const [canonicalThreads, legacyThreads] = await Promise.all([
    collectCanonicalThreads(ctx, owner, assistantKind, limit),
    collectLegacyThreads(ctx, owner, assistantKind),
  ]);
  return dedupeAccessibleThreads(
    [...canonicalThreads, ...legacyThreads],
    owner,
    assistantKind,
  ).slice(0, limit);
}

export async function getLatestThread(
  ctx: QueryCtx,
  ownerOrUser: string | AssistantOwner,
  assistantKind?: AssistantKind,
): Promise<AssistantThreadRecord | null> {
  const owner = normalizeOwner(ownerOrUser);
  const threads = await collectAccessibleThreads(ctx, owner, assistantKind, 12);
  if (threads.length === 0) return null;

  if (isWorkspaceKind(assistantKind)) {
    const latestOrganizationThread = threads.find(
      (thread) => getThreadScope(thread) === "organization",
    );
    if (latestOrganizationThread) {
      return latestOrganizationThread;
    }
  }

  return threads[0] ?? null;
}

export async function listRecentThreads(
  ctx: QueryCtx,
  ownerOrUser: string | AssistantOwner,
  assistantKind?: AssistantKind,
  limit = 6,
) {
  const owner = normalizeOwner(ownerOrUser);
  const threads = await collectAccessibleThreads(ctx, owner, assistantKind, Math.max(limit, 6));

  if (!isWorkspaceKind(assistantKind)) {
    return threads.slice(0, limit);
  }

  const organizationThreads = threads.filter(
    (thread) => getThreadScope(thread) === "organization",
  );
  const legacyUserThreads = threads.filter(
    (thread) => getThreadScope(thread) !== "organization",
  );
  return [...organizationThreads, ...legacyUserThreads].slice(0, limit);
}

export async function getAccessibleThread(
  ctx: QueryCtx,
  ownerOrUser: string | AssistantOwner,
  threadId: string,
  assistantKind?: AssistantKind,
) {
  const owner = normalizeOwner(ownerOrUser);

  const canonicalThreadState = await getAssistantThreadStateByThreadId(ctx, threadId);
  if (canonicalThreadState) {
    const canonicalThread = mapAssistantThreadState(canonicalThreadState);
    return canAccessThread(canonicalThread, owner, assistantKind) ? canonicalThread : null;
  }

  const legacyThreadId = ctx.db.normalizeId("assistantThreads", threadId);
  if (!legacyThreadId) return null;

  const legacyThread = await ctx.db.get(legacyThreadId);
  if (!legacyThread) return null;
  const mapped = mapLegacyThread(legacyThread);
  return canAccessThread(mapped, owner, assistantKind) ? mapped : null;
}

async function listLegacyMessages(
  ctx: QueryCtx,
  threadId: Id<"assistantThreads">,
) {
  const messages = await ctx.db
    .query("assistantMessages")
    .withIndex("threadId_createdAt", (q) => q.eq("threadId", threadId))
    .collect();

  return messages
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((message) => mapLegacyMessage(message));
}

async function listCanonicalMessages(
  ctx: QueryCtx,
  thread: AssistantThreadRecord,
) {
  const [messageDocs, messageStateRowsRaw] = await Promise.all([
    listAgentThreadMessages(ctx, thread._id),
    listAssistantMessageStatesByThreadId(ctx, thread._id),
  ]);
  const messageStateRows = messageStateRowsRaw as Doc<"assistantMessageState">[];
  const stateByMessageId = new Map(
    messageStateRows.map((row: Doc<"assistantMessageState">) => [row.messageId, row] as const),
  );
  const canonicalMessages = messageDocs.map((message) =>
    mapAssistantMessageState({
      message,
      state: stateByMessageId.get(message._id) ?? null,
    }),
  );

  if (!thread.legacyThreadId) {
    return canonicalMessages.sort((a, b) => a.createdAt - b.createdAt);
  }

  const legacyMessages = await listLegacyMessages(ctx, thread.legacyThreadId);
  const mappedLegacyIds = new Set(
    messageStateRows
      .map((row: Doc<"assistantMessageState">) => row.legacyMessageId)
      .filter((id): id is Id<"assistantMessages"> => Boolean(id))
      .map((id: Id<"assistantMessages">) => String(id)),
  );

  const unmappedLegacyMessages = legacyMessages.filter(
    (message) => !mappedLegacyIds.has(String(message.legacyMessageId)),
  );

  return [...unmappedLegacyMessages, ...canonicalMessages].sort(
    (a, b) => a.createdAt - b.createdAt,
  );
}

export async function listThreadMessages(
  ctx: QueryCtx,
  owner: AssistantOwner,
  threadId?: string,
  assistantKind?: AssistantKind,
) {
  const thread = threadId
    ? await getAccessibleThread(ctx, owner, threadId, assistantKind)
    : await getLatestThread(ctx, owner, assistantKind);
  if (!thread || !canAccessThread(thread, owner, assistantKind)) return [];

  const canonicalThreadState = await getAssistantThreadStateByThreadId(ctx, thread._id);
  if (canonicalThreadState) {
    return listCanonicalMessages(ctx, thread);
  }

  if (!thread.legacyThreadId) return [];
  return listLegacyMessages(ctx, thread.legacyThreadId);
}

export async function getLatestThreadPreview(
  ctx: QueryCtx,
  threadId: string,
) {
  const threadState = await getAssistantThreadStateByThreadId(ctx, threadId);
  if (threadState) {
    const messages = await listCanonicalMessages(ctx, mapAssistantThreadState(threadState));
    return messages.at(-1)?.content;
  }

  const legacyThreadId = ctx.db.normalizeId("assistantThreads", threadId);
  if (!legacyThreadId) return undefined;
  const messages = await listLegacyMessages(ctx, legacyThreadId);
  return messages.at(-1)?.content;
}

export async function getMessageContent(
  ctx: QueryCtx,
  messageId: string,
): Promise<AssistantMessageRecord | null> {
  const componentMessage = await getAgentMessageById(ctx, messageId);
  if (componentMessage) {
    const state = (await ctx.db
      .query("assistantMessageState")
      .withIndex("messageId", (q) => q.eq("messageId", messageId))
      .first());
    return mapAssistantMessageState({
      message: componentMessage,
      state,
    });
  }

  const legacyMessageId = ctx.db.normalizeId("assistantMessages", messageId);
  if (!legacyMessageId) return null;
  const legacyMessage = await ctx.db.get(legacyMessageId);
  return legacyMessage ? mapLegacyMessage(legacyMessage) : null;
}
