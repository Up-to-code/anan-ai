import { convexAuth } from "@convex-dev/auth/server";
import { getGoogleProvider } from "./_core/security/providers";
import { normalizeBaseUrl, resolveAllowedOrigins } from "./_core/security/authRedirects";
import { resolveConvexAuthIssuer } from "./_core/security/authIssuer";
import { getProfileByAuthUserId } from "./shared_logic/lib/profile";

function resolveWebBaseUrl() {
  const isProduction =
    process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
  if (!isProduction) {
    return normalizeBaseUrl(
      process.env.SITE_URL ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.NEXT_PUBLIC_WEB_URL ||
        process.env.ANAN_WEB_URL ||
        process.env.VERCEL_PROJECT_PRODUCTION_URL ||
        process.env.VERCEL_URL ||
        "http://localhost:3000",
    );
  }
  return normalizeBaseUrl(
    process.env.ANAN_WEB_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_WEB_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      process.env.VERCEL_URL ||
      process.env.SITE_URL ||
      "http://localhost:3000",
  );
}

function deriveUsername(args: { email?: string | null; name?: string | null; authUserId: string }) {
  const emailLocalPart = args.email?.split("@")[0]?.trim();
  const seed = emailLocalPart || args.name || `user-${args.authUserId.slice(-6)}`;
  return seed
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32) || `user-${args.authUserId.slice(-6)}`;
}

async function syncUserProfile(ctx: any, userId: any) {
  const user = await ctx.db.get(userId);
  if (!user) return;

  const authUserId = String(userId);
  const existingByAuth = await getProfileByAuthUserId(ctx, authUserId);
  const existingByEmail =
    typeof user.email === "string"
      ? await ctx.db
          .query("userProfiles")
          .withIndex("email", (q: any) => q.eq("email", user.email))
          .first()
      : null;

  const now = Date.now();
  const username = existingByAuth?.username ?? existingByEmail?.username ?? deriveUsername({
    email: user.email,
    name: user.name ?? user.displayName ?? null,
    authUserId,
  });
  const patch = {
    authUserId,
    email: user.email,
    name: user.name ?? user.displayName ?? existingByAuth?.name ?? existingByEmail?.name ?? "مستخدم عنان",
    username,
    usernameLower: username.toLowerCase(),
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
    async redirect({ redirectTo }) {
      const webBaseUrl = resolveWebBaseUrl();
      const convexBaseUrl = resolveConvexAuthIssuer();
      const allowedOrigins = resolveAllowedOrigins({
        webBaseUrl,
        extraOrigins: [process.env.ANAN_ADMIN_URL],
        allowedOriginsEnv: process.env.ANAN_AUTH_ALLOWED_ORIGINS,
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
      });

      if (convexBaseUrl && webBaseUrl && redirectTo.startsWith(convexBaseUrl)) {
        const target = new URL(redirectTo);
        const web = new URL(webBaseUrl);
        target.protocol = web.protocol;
        target.host = web.host;
        return target.toString();
      }

      if (
        allowedOrigins.some((origin) => redirectTo.startsWith(origin))
      ) {
        return redirectTo;
      }

      if (redirectTo.startsWith("/")) {
        return webBaseUrl ? new URL(redirectTo, webBaseUrl).toString() : redirectTo;
      }

      return webBaseUrl || "/";
    },
    async afterUserCreatedOrUpdated(ctx, { userId }) {
      await syncUserProfile(ctx, userId);
    },
    async beforeSessionCreation(ctx, { userId }) {
      const authUserId = String(userId);
      const profile = await getProfileByAuthUserId(ctx, authUserId);
      if (profile?.isActive === false) {
        throw new Error("Account is deactivated");
      }
    },
  },
  jwt: {
    durationMs: 1000 * 60 * 60 * 24,
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
