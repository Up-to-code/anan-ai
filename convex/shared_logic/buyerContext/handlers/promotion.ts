type PromotionArgs = {
  ctx: any;
  fromUserId: string;
  toUserId: string;
};

async function movePublicAssistantThreads(args: PromotionArgs) {
  const publicThreads = await args.ctx.db
    .query("assistantThreads")
    .withIndex("userId", (q: any) => q.eq("userId", args.fromUserId))
    .collect();

  const movedThreadIds: Array<any> = [];
  for (const thread of publicThreads) {
    if (thread.assistantKind !== "anan_main_public") continue;
    await args.ctx.db.patch(thread._id, {
      userId: args.toUserId,
    });
    movedThreadIds.push(thread._id);
  }

  return movedThreadIds;
}

async function loadWebBuyerState(ctx: any, userId: string) {
  return ctx.db
    .query("buyerChannelStates")
    .withIndex("channel_userId", (q: any) =>
      q.eq("channel", "web").eq("userId", userId),
    )
    .first();
}

async function promoteWebBuyerState(args: PromotionArgs) {
  const guestState = await loadWebBuyerState(args.ctx, args.fromUserId);
  const existingAuthState = await loadWebBuyerState(args.ctx, args.toUserId);

  let activeThreadId = guestState?.threadId ?? existingAuthState?.threadId;

  if (!guestState) {
    return { activeThreadId };
  }

  const nextState = {
    userId: args.toUserId,
    threadId: guestState.threadId,
    state: guestState.state,
    selectedPropertyId:
      guestState.selectedPropertyId ?? existingAuthState?.selectedPropertyId,
    lastResultPropertyIds:
      guestState.lastResultPropertyIds.length > 0
        ? guestState.lastResultPropertyIds
        : (existingAuthState?.lastResultPropertyIds ?? []),
    lastSearchQuery:
      guestState.lastSearchQuery ?? existingAuthState?.lastSearchQuery,
    qualification:
      guestState.qualification ?? existingAuthState?.qualification,
    updatedAt: Date.now(),
  };

  if (existingAuthState) {
    await args.ctx.db.patch(existingAuthState._id, nextState as any);
  } else {
    await args.ctx.db.insert("buyerChannelStates", {
      channel: "web",
      ...nextState,
      createdAt: guestState.createdAt,
    } as any);
  }

  await args.ctx.db.delete(guestState._id);
  activeThreadId = guestState.threadId ?? activeThreadId;

  return { activeThreadId };
}

async function promoteGuestMemories(args: PromotionArgs) {
  const guestMemories = await args.ctx.db
    .query("agentMemory")
    .withIndex("userId", (q: any) => q.eq("userId", args.fromUserId))
    .collect();

  for (const memory of guestMemories) {
    const duplicate = await args.ctx.db
      .query("agentMemory")
      .withIndex("userId_and_key", (q: any) =>
        q.eq("userId", args.toUserId).eq("key", memory.key),
      )
      .first();

    if (duplicate && duplicate.memoryType === memory.memoryType) {
      await args.ctx.db.patch(duplicate._id, {
        value: memory.value,
        confidence: Math.max(
          duplicate.confidence ?? 0,
          memory.confidence ?? 0,
        ),
        expiresAt: memory.expiresAt,
        metadata: memory.metadata,
        threadId: memory.threadId ?? duplicate.threadId,
        source: memory.source ?? duplicate.source,
      });
      await args.ctx.db.delete(memory._id);
      continue;
    }

    await args.ctx.db.patch(memory._id, {
      userId: args.toUserId,
    });
  }
}

async function reassignOwnedRows(args: PromotionArgs) {
  const guestSearchLogs = await args.ctx.db
    .query("searchLogs")
    .withIndex("userId", (q: any) => q.eq("userId", args.fromUserId))
    .collect();

  for (const log of guestSearchLogs) {
    await args.ctx.db.patch(log._id, { userId: args.toUserId });
  }

  const guestResearch = await args.ctx.db
    .query("knowledgeResearch")
    .withIndex("by_userId_and_createdAt", (q: any) =>
      q.eq("userId", args.fromUserId),
    )
    .collect();

  for (const row of guestResearch) {
    await args.ctx.db.patch(row._id, { userId: args.toUserId });
  }
}

export async function promoteBuyerContext(args: PromotionArgs) {
  if (args.fromUserId === args.toUserId) {
    const activeState = await loadWebBuyerState(args.ctx, args.toUserId);
    return {
      movedThreadIds: [],
      activeThreadId: activeState?.threadId,
    };
  }

  const movedThreadIds = await movePublicAssistantThreads(args);
  const { activeThreadId } = await promoteWebBuyerState(args);

  await promoteGuestMemories(args);
  await reassignOwnedRows(args);

  return {
    movedThreadIds,
    activeThreadId,
  };
}
