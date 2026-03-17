import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import schema from "../../../schema";
import { internalRefs } from "../../lib/generatedApiRefs";
import { modules } from "../../../test.setup";
import { OAUTH_CONSENT_VERSION } from "../../../_core/oauth/constants";

type SeedOptions = {
  refreshUsedAt?: number;
  refreshRevokedAt?: number;
  refreshExpiresAt?: number;
};

async function seedOAuthData(t: ReturnType<typeof convexTest>, options: SeedOptions = {}) {
  const now = Date.now();
  const clientId = "client-1";
  const refreshTokenHash = "refresh-old-hash";
  const familyId = "family-1";

  const seeded = await t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", {
      email: "oauth-user@example.com",
      name: "OAuth User",
    } as any);
    const authorizationId = await ctx.db.insert("oauthAuthorizations", {
      userId,
      clientId,
      grantedScopes: ["profile", "offline_access"],
      offlineAccess: true,
      consentVersion: OAUTH_CONSENT_VERSION,
      createdAt: now - 5_000,
      updatedAt: now - 5_000,
      lastUsedAt: now - 5_000,
    } as any);
    await ctx.db.insert("oauthClients", {
      clientId,
      name: "Client One",
      publisherName: "Anan",
      clientType: "public",
      redirectUris: ["https://client.example.com/callback"],
      allowedScopes: ["profile", "offline_access"],
      trusted: false,
      isActive: true,
      createdAt: now - 10_000,
      updatedAt: now - 10_000,
    } as any);
    await ctx.db.insert("oauthSubjectMappings", {
      clientId,
      userId,
      pairwiseSubject: "pairwise-subject-1",
      createdAt: now - 10_000,
    } as any);
    const refreshTokenId = await ctx.db.insert("oauthRefreshTokens", {
      tokenHash: refreshTokenHash,
      familyId,
      clientId,
      userId,
      authorizationId,
      scopes: ["profile", "offline_access"],
      expiresAt: options.refreshExpiresAt ?? (now + (30 * 60 * 1000)),
      usedAt: options.refreshUsedAt,
      revokedAt: options.refreshRevokedAt,
      createdAt: now - 1_000,
    } as any);

    return {
      userId,
      authorizationId,
      refreshTokenId,
    };
  });

  return {
    ...seeded,
    now,
    clientId,
    refreshTokenHash,
    familyId,
  };
}

describe("oauth token storage internals", () => {
  it("rotates refresh tokens successfully", async () => {
    const t = convexTest(schema, modules);
    const seeded = await seedOAuthData(t);

    const result = await t.mutation(
      internalRefs["shared_logic/oauth/internal/tokens"].rotateRefreshToken,
      {
        clientId: seeded.clientId,
        refreshTokenHash: seeded.refreshTokenHash,
        clientSecretHash: undefined,
        accessTokenJti: "access-jti-1",
        accessTokenExpiresAt: seeded.now + (15 * 60 * 1000),
        nextRefreshTokenHash: "refresh-next-hash",
        nextRefreshTokenExpiresAt: seeded.now + (30 * 24 * 60 * 60 * 1000),
        now: seeded.now,
      } as never,
    );

    expect((result as any).refreshFamilyId).toBe(seeded.familyId);

    const refreshFamily = await t.run(async (ctx) =>
      ctx.db
        .query("oauthRefreshTokens")
        .withIndex("familyId", (q) => q.eq("familyId", seeded.familyId))
        .collect(),
    );
    expect(refreshFamily).toHaveLength(2);
    expect(refreshFamily.some((token) => token.tokenHash === seeded.refreshTokenHash && token.usedAt === seeded.now)).toBe(true);
    expect(refreshFamily.some((token) => token.tokenHash === "refresh-next-hash" && token.usedAt === undefined)).toBe(true);
  });

  it("revokes refresh family and access tokens when replay is detected", async () => {
    const t = convexTest(schema, modules);
    const seeded = await seedOAuthData(t, { refreshUsedAt: Date.now() - 1_000 });

    await t.run(async (ctx) => {
      await ctx.db.insert("oauthRefreshTokens", {
        tokenHash: "refresh-sibling-hash",
        familyId: seeded.familyId,
        clientId: seeded.clientId,
        userId: seeded.userId,
        authorizationId: seeded.authorizationId,
        scopes: ["profile", "offline_access"],
        expiresAt: seeded.now + (30 * 60 * 1000),
        createdAt: seeded.now - 1_000,
      } as any);

      await ctx.db.insert("oauthAccessTokens", {
        jti: "access-jti-replay-1",
        clientId: seeded.clientId,
        userId: seeded.userId,
        authorizationId: seeded.authorizationId,
        scopes: ["profile", "offline_access"],
        expiresAt: seeded.now + (15 * 60 * 1000),
        createdAt: seeded.now - 1_000,
      } as any);
    });

    const replayResult = await t.mutation(
      internalRefs["shared_logic/oauth/internal/tokens"].rotateRefreshToken,
      {
        clientId: seeded.clientId,
        refreshTokenHash: seeded.refreshTokenHash,
        clientSecretHash: undefined,
        accessTokenJti: "access-jti-replay-2",
        accessTokenExpiresAt: seeded.now + (15 * 60 * 1000),
        nextRefreshTokenHash: "refresh-next-hash",
        nextRefreshTokenExpiresAt: seeded.now + (30 * 24 * 60 * 60 * 1000),
        now: seeded.now,
      } as never,
    );
    expect(replayResult).toEqual({ replayDetected: true });

    const [familyTokens, accessTokens] = await Promise.all([
      t.run(async (ctx) =>
        ctx.db
          .query("oauthRefreshTokens")
          .withIndex("familyId", (q) => q.eq("familyId", seeded.familyId))
          .collect()),
      t.run(async (ctx) =>
        ctx.db
          .query("oauthAccessTokens")
          .withIndex("clientId", (q) => q.eq("clientId", seeded.clientId))
          .collect()),
    ]);
    expect(familyTokens.every((token) => token.revokedAt !== undefined && token.replayDetectedAt !== undefined)).toBe(true);
    expect(
      accessTokens
        .filter((token) => token.authorizationId === seeded.authorizationId)
        .every((token) => token.revokedAt !== undefined),
    ).toBe(true);
  });

  it("revokes access tokens when refresh-family revocation runs", async () => {
    const t = convexTest(schema, modules);
    const seeded = await seedOAuthData(t);

    await t.run(async (ctx) => {
      await ctx.db.insert("oauthAccessTokens", {
        jti: "access-jti-revoke-1",
        clientId: seeded.clientId,
        userId: seeded.userId,
        authorizationId: seeded.authorizationId,
        scopes: ["profile"],
        expiresAt: seeded.now + (15 * 60 * 1000),
        createdAt: seeded.now - 1_000,
      } as any);
    });

    const result = await t.mutation(
      internalRefs["shared_logic/oauth/internal/tokens"].revokeRefreshTokenFamily,
      {
        clientId: seeded.clientId,
        clientSecretHash: undefined,
        refreshTokenHash: seeded.refreshTokenHash,
        now: seeded.now,
      } as never,
    );

    expect(result).toEqual({ revoked: true });

    const accessTokens = await t.run(async (ctx) =>
      ctx.db
        .query("oauthAccessTokens")
        .withIndex("clientId", (q) => q.eq("clientId", seeded.clientId))
        .collect());
    expect(accessTokens.every((token) => token.revokedAt === seeded.now)).toBe(true);
  });

  it("returns invalid grant for expired or revoked refresh tokens", async () => {
    const t = convexTest(schema, modules);
    const seeded = await seedOAuthData(t, {
      refreshRevokedAt: Date.now() - 1_000,
    });

    await expect(
      t.mutation(
        internalRefs["shared_logic/oauth/internal/tokens"].rotateRefreshToken,
        {
          clientId: seeded.clientId,
          refreshTokenHash: seeded.refreshTokenHash,
          clientSecretHash: undefined,
          accessTokenJti: "access-jti-revoked-1",
          accessTokenExpiresAt: seeded.now + (15 * 60 * 1000),
          nextRefreshTokenHash: "refresh-next-hash",
          nextRefreshTokenExpiresAt: seeded.now + (30 * 24 * 60 * 60 * 1000),
          now: seeded.now,
        } as never,
      ),
    ).rejects.toThrow("Refresh token is expired or revoked");
  });
});
