import type { MutationCtx } from "../../_generated/server";

const CHANNEL_SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export type ChannelType = "whatsapp" | "web" | "app";

export async function issueChannelSession(
  ctx: MutationCtx,
  params: {
    authUserId: string;
    channel: ChannelType;
    metadata?: { sourceMessageId?: string };
  },
) {
  const now = Date.now();
  const expiresAt = now + CHANNEL_SESSION_TTL_MS;
  const sessionToken =
    crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");

  const existing = await ctx.db
    .query("channelSessions")
    .withIndex("authUserId_channel", (q: any) =>
      q.eq("authUserId", params.authUserId).eq("channel", params.channel),
    )
    .first();

  if (existing) {
    await ctx.db.patch(existing._id, {
      sessionToken,
      expiresAt,
      metadata: params.metadata,
    });
    return { sessionToken, sessionId: existing._id, expiresAt } as const;
  }

  const sessionId = await ctx.db.insert("channelSessions", {
    authUserId: params.authUserId,
    channel: params.channel,
    sessionToken,
    expiresAt,
    metadata: params.metadata,
  });

  return { sessionToken, sessionId, expiresAt } as const;
}

/**
 * WHY:   Channel traffic still needs a durable user record for memory, threads, and analytics.
 * WHAT:  Upserts a WhatsApp user in the shared `users` table.
 * HOW:   Reuses the auth-backed `users` table with extra app-specific fields.
 */
export async function ensureChannelUserForPhone(
  ctx: MutationCtx,
  params: { phoneNumber: string; displayName?: string },
) {
  const normalizedPhone = params.phoneNumber.replace(/\D/g, "");
  const authUserId = `channel:whatsapp:${normalizedPhone}`;

  const existing = await ctx.db
    .query("users")
    .withIndex("userId", (q) => q.eq("userId", normalizedPhone))
    .first();

  if (existing) {
    if (params.displayName && existing.displayName !== params.displayName) {
      await ctx.db.patch(existing._id, {
        displayName: params.displayName,
        name: params.displayName,
      });
    }
    return { authUserId, userId: existing._id } as const;
  }

  const userId = await ctx.db.insert("users", {
    userId: normalizedPhone,
    phone: normalizedPhone,
    phoneVerificationTime: Date.now(),
    isAnonymous: true,
    displayName: params.displayName,
    name: params.displayName ?? `WA ${normalizedPhone.slice(-4)}`,
    channel: "whatsapp",
  });

  return { authUserId, userId } as const;
}
