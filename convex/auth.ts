import { convexAuth } from "@convex-dev/auth/server";
import { getGoogleProvider } from "./_core/security/providers";

async function syncUserProfile(ctx: any, userId: any, existingUserId: any) {
  const user = await ctx.db.get(userId);
  if (!user) return;

  const authUserId = String(userId);
  const existingByAuth = await ctx.db
    .query("userProfiles")
    .withIndex("authUserId", (q: any) => q.eq("authUserId", authUserId))
    .first();
  const existingByEmail =
    typeof user.email === "string"
      ? await ctx.db
          .query("userProfiles")
          .withIndex("email", (q: any) => q.eq("email", user.email))
          .first()
      : null;

  const now = Date.now();
  const patch = {
    authUserId,
    email: user.email,
    name: user.name ?? user.displayName ?? existingByAuth?.name ?? existingByEmail?.name ?? "مستخدم أنان",
    isActive: existingByAuth?.isActive ?? existingByEmail?.isActive ?? true,
    createdAt: existingByAuth?.createdAt ?? existingByEmail?.createdAt ?? now,
    updatedAt: now,
  };

  const target = existingByAuth ?? existingByEmail;
  if (target) {
    await ctx.db.patch(target._id, patch);
    return;
  }

  await ctx.db.insert("userProfiles", {
    ...patch,
    role: "user",
    roleStatus: "approved",
  });
}

/**
 * WHY:   Backend authentication now lives directly inside Convex instead of Better Auth.
 * WHAT:  Exposes the Convex Auth runtime, OAuth routes, and auth actions.
 * HOW:   Configures a single Google OAuth provider and projects user identity claims into JWTs.
 */
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [getGoogleProvider],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, { userId, existingUserId }) {
      await syncUserProfile(ctx, userId, existingUserId);
    },
    async beforeSessionCreation(ctx, { userId }) {
      const authUserId = String(userId);
      const profile = (await ctx.db.query("userProfiles").collect()).find(
        (entry: any) => entry.authUserId === authUserId,
      );
      if (profile?.isActive === false) {
        throw new Error("Account is deactivated");
      }
    },
  },
  jwt: {
    durationMs: 1000 * 60 * 60,
    customClaims: async (ctx, { userId }) => {
      const user = await ctx.db.get(userId);
      return {
        email: user?.email,
        name: user?.name ?? user?.displayName,
        pictureUrl: user?.image,
      };
    },
  },
});
