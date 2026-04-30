import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import schema from "../../../schema";
import { internal } from "../../../_generated/api";
import { modules } from "../../../test.setup";
import { OAUTH_CONSENT_VERSION } from "../../../_core/oauth/constants";

type SeedOptions = {
  refreshUsedAt?: number;
  refreshRevokedAt?: number;
  refreshExpiresAt?: number;
  authorizationLastUsedAt?: number;
  authorizationExpiresAt?: number;
};

type SeededOAuthData = {
  now: number;
  clientId: string;
  refreshTokenHash: string;
  familyId: string;
  actorUserId: any;
  ownerBrokerId: any;
  tenantOrgId: string;
  authorizationId: any;
  refreshTokenId: any;
};

async function insertOAuthClientArtifacts(ctx: any, now: number, clientId: string, args: { ownerBrokerId: any; tenantOrgId: string }) {
  await ctx.db.insert("oauthClients", {
    clientId,
    name: "Client One",
    publisherName: "Anan",
    clientType: "public",
    redirectUris: ["https://client.example.com/callback"],
    allowedScopes: ["clients:read_own", "offline_access"],
    trusted: true,
    isActive: true,
    createdAt: now - 10_000,
    updatedAt: now - 10_000,
  } as any);
  await ctx.db.insert("oauthSubjectMappings", {
    clientId,
    tenantOrgId: args.tenantOrgId,
    ownerType: "broker",
    ownerBrokerId: args.ownerBrokerId,
    pairwiseSubject: "pairwise-subject-1",
    createdAt: now - 10_000,
  } as any);
}

async function seedOAuthData(t: ReturnType<typeof convexTest>, options: SeedOptions = {}): Promise<SeededOAuthData> {
  const now = Date.now();
  const clientId = "client-1";
  const refreshTokenHash = "refresh-old-hash";
  const familyId = "family-1";

  const seeded = await t.run(async (ctx) => {
    const actorUserId = await ctx.db.insert("users", { email: "oauth-user@example.com", name: "OAuth User" } as any);
    const ownerBrokerId = await ctx.db.insert("brokers", {
      name: "OAuth Broker",
      slug: "oauth-broker",
      status: "active",
    } as any);
    const tenantOrgId = "tenant-org-oauth-1";
    const authorizationId = await ctx.db.insert("oauthAuthorizations", {
      tenantOrgId,
      ownerType: "broker",
      ownerBrokerId,
      clientId,
      grantedScopes: ["clients:read_own", "offline_access"],
      offlineAccess: true,
      consentVersion: OAUTH_CONSENT_VERSION,
      createdAt: options.authorizationLastUsedAt ?? now - 5_000,
      updatedAt: options.authorizationLastUsedAt ?? now - 5_000,
      lastUsedAt: options.authorizationLastUsedAt ?? now - 5_000,
      expiresAt: options.authorizationExpiresAt,
      approvedByUserId: actorUserId,
    } as any);
    await insertOAuthClientArtifacts(ctx, now, clientId, { ownerBrokerId, tenantOrgId });
    const refreshTokenId = await ctx.db.insert("oauthRefreshTokens", {
      tokenHash: refreshTokenHash,
      familyId,
      clientId,
      tenantOrgId,
      ownerType: "broker",
      ownerBrokerId,
      approvedByUserId: actorUserId,
      authorizationId,
      scopes: ["clients:read_own", "offline_access"],
      expiresAt: options.refreshExpiresAt ?? now + 30 * 60 * 1000,
      usedAt: options.refreshUsedAt,
      revokedAt: options.refreshRevokedAt,
      createdAt: now - 1_000,
    } as any);
    return { actorUserId, ownerBrokerId, tenantOrgId, authorizationId, refreshTokenId };
  });

  return { ...seeded, now, clientId, refreshTokenHash, familyId };
}

function buildRotateArgs(seeded: SeededOAuthData, overrides: Partial<Record<string, unknown>> = {}) {
  return {
    clientId: seeded.clientId,
    refreshTokenHash: seeded.refreshTokenHash,
    clientSecretHash: undefined,
    accessTokenJti: "access-jti-1",
    accessTokenExpiresAt: seeded.now + 15 * 60 * 1000,
    nextRefreshTokenHash: "refresh-next-hash",
    nextRefreshTokenExpiresAt: seeded.now + 30 * 24 * 60 * 60 * 1000,
    now: seeded.now,
    ...overrides,
  } as never;
}

async function runRotateMutation(t: ReturnType<typeof convexTest>, seeded: SeededOAuthData, overrides: Partial<Record<string, unknown>> = {}) {
  return t.mutation(internal.shared_logic.oauth.internal.tokens.rotateRefreshToken, buildRotateArgs(seeded, overrides));
}

async function seedReplayTokens(t: ReturnType<typeof convexTest>, seeded: SeededOAuthData) {
    await t.run(async (ctx) => {
      await ctx.db.insert("oauthRefreshTokens", {
        tokenHash: "refresh-sibling-hash",
        familyId: seeded.familyId,
        clientId: seeded.clientId,
        tenantOrgId: seeded.tenantOrgId,
        ownerType: "broker",
        ownerBrokerId: seeded.ownerBrokerId,
        approvedByUserId: seeded.actorUserId,
        authorizationId: seeded.authorizationId,
        scopes: ["clients:read_own", "offline_access"],
        expiresAt: seeded.now + 30 * 60 * 1000,
        createdAt: seeded.now - 1_000,
      } as any);
      await ctx.db.insert("oauthAccessTokens", {
        jti: "access-jti-replay-1",
        clientId: seeded.clientId,
        tenantOrgId: seeded.tenantOrgId,
        ownerType: "broker",
        ownerBrokerId: seeded.ownerBrokerId,
        approvedByUserId: seeded.actorUserId,
        authorizationId: seeded.authorizationId,
        scopes: ["clients:read_own", "offline_access"],
        expiresAt: seeded.now + 15 * 60 * 1000,
        createdAt: seeded.now - 1_000,
      } as any);
  });
}

function registerRotateSuccessTest() {
  it("rotates refresh tokens successfully", async () => {
    const t = convexTest(schema, modules);
    const seeded = await seedOAuthData(t);
    const result = await runRotateMutation(t, seeded);

    expect((result as any).refreshFamilyId).toBe(seeded.familyId);

    const refreshFamily = await t.run(async (ctx) => ctx.db.query("oauthRefreshTokens").withIndex("familyId", (q) => q.eq("familyId", seeded.familyId)).collect());
    expect(refreshFamily).toHaveLength(2);
    expect(refreshFamily.some((token) => token.tokenHash === seeded.refreshTokenHash && token.usedAt === seeded.now)).toBe(true);
    expect(refreshFamily.some((token) => token.tokenHash === "refresh-next-hash" && token.usedAt === undefined)).toBe(true);
  });
}

function registerReplayDetectionTest() {
  it("revokes refresh family and access tokens when replay is detected", async () => {
    const t = convexTest(schema, modules);
    const seeded = await seedOAuthData(t, { refreshUsedAt: Date.now() - 1_000 });
    await seedReplayTokens(t, seeded);

    const replayResult = await runRotateMutation(t, seeded, {
      accessTokenJti: "access-jti-replay-2",
      nextRefreshTokenHash: "refresh-next-hash",
    });
    expect(replayResult).toEqual({ replayDetected: true });

    const [familyTokens, accessTokens] = await Promise.all([
      t.run(async (ctx) => ctx.db.query("oauthRefreshTokens").withIndex("familyId", (q) => q.eq("familyId", seeded.familyId)).collect()),
      t.run(async (ctx) => ctx.db.query("oauthAccessTokens").withIndex("clientId", (q) => q.eq("clientId", seeded.clientId)).collect()),
    ]);
    expect(familyTokens.every((token) => token.revokedAt !== undefined && token.replayDetectedAt !== undefined)).toBe(true);
    expect(accessTokens.filter((token) => token.authorizationId === seeded.authorizationId).every((token) => token.revokedAt !== undefined)).toBe(true);
  });
}

function registerRevokeFamilyTest() {
  it("revokes access tokens when refresh-family revocation runs", async () => {
    const t = convexTest(schema, modules);
    const seeded = await seedOAuthData(t);

    await t.run(async (ctx) => {
      await ctx.db.insert("oauthAccessTokens", {
        jti: "access-jti-revoke-1",
        clientId: seeded.clientId,
        tenantOrgId: seeded.tenantOrgId,
        ownerType: "broker",
        ownerBrokerId: seeded.ownerBrokerId,
        approvedByUserId: seeded.actorUserId,
        authorizationId: seeded.authorizationId,
        scopes: ["clients:read_own"],
        expiresAt: seeded.now + 15 * 60 * 1000,
        createdAt: seeded.now - 1_000,
      } as any);
    });

    const result = await t.mutation(internal.shared_logic.oauth.internal.tokens.revokeRefreshTokenFamily, {
      clientId: seeded.clientId,
      clientSecretHash: undefined,
      refreshTokenHash: seeded.refreshTokenHash,
      now: seeded.now,
    } as never);

    expect(result).toEqual({ revoked: true });

    const accessTokens = await t.run(async (ctx) => ctx.db.query("oauthAccessTokens").withIndex("clientId", (q) => q.eq("clientId", seeded.clientId)).collect());
    expect(accessTokens.every((token) => token.revokedAt === seeded.now)).toBe(true);
  });
}

function registerInvalidGrantTest() {
  it("returns invalid grant for expired or revoked refresh tokens", async () => {
    const t = convexTest(schema, modules);
    const seeded = await seedOAuthData(t, { refreshRevokedAt: Date.now() - 1_000 });

    await expect(
      runRotateMutation(t, seeded, {
        accessTokenJti: "access-jti-revoked-1",
        nextRefreshTokenHash: "refresh-next-hash",
      }),
    ).rejects.toThrow("Refresh token is expired or revoked");
  });
}

function registerAuthorizationExpiryTest() {
  it("expires organization authorization after the inactivity window", async () => {
    const t = convexTest(schema, modules);
    const now = Date.now();
    const seeded = await seedOAuthData(t, {
      authorizationLastUsedAt: now - 51 * 24 * 60 * 60 * 1000,
    });

    const result = await runRotateMutation(t, seeded, {
      accessTokenJti: "access-jti-expired-1",
      nextRefreshTokenHash: "refresh-next-expired-hash",
      now,
    });

    const authorization = await t.run(async (ctx) => ctx.db.get(seeded.authorizationId)) as any;
    expect(result).toEqual({ authorizationExpired: true });
    expect(authorization?.revokedAt).toBe(now);
  });
}

function registerInactiveExternalClientTest() {
  it("blocks authorization requests for inactive mirrored external clients", async () => {
    const t = convexTest(schema, modules);
    const now = Date.now();
    await t.run(async (ctx) => {
      await ctx.db.insert("oauthClients", {
        clientId: "inactive-external-client",
        name: "Inactive External App",
        publisherName: "External Publisher",
        clientType: "public",
        redirectUris: ["https://external.test/callback"],
        allowedScopes: ["clients:read_own"],
        trusted: true,
        isActive: false,
        createdAt: now,
        updatedAt: now,
      } as any);
    });

    await expect(
      t.query(internal.shared_logic.oauth.internal.authorize.validateAuthorizationRequest, {
        clientId: "inactive-external-client",
        redirectUri: "https://external.test/callback",
        scope: "clients:read_own",
        state: "state-1",
        codeChallenge: "challenge-1",
        codeChallengeMethod: "S256",
      } as never),
    ).rejects.toThrow("Unknown or inactive OAuth client");
  });
}

function registerUntrustedExternalClientTest() {
  it("blocks authorization requests for untrusted mirrored external clients", async () => {
    const t = convexTest(schema, modules);
    const now = Date.now();
    await t.run(async (ctx) => {
      await ctx.db.insert("oauthClients", {
        clientId: "untrusted-external-client",
        name: "Untrusted External App",
        publisherName: "External Publisher",
        clientType: "public",
        redirectUris: ["https://external.test/callback"],
        allowedScopes: ["clients:read_own", "clients:create", "offline_access"],
        trusted: false,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      } as any);
    });

    await expect(
      t.query(internal.shared_logic.oauth.internal.authorize.validateAuthorizationRequest, {
        clientId: "untrusted-external-client",
        redirectUri: "https://external.test/callback",
        scope: "clients:create offline_access",
        state: "state-1",
        codeChallenge: "challenge-1",
        codeChallengeMethod: "S256",
      } as never),
    ).rejects.toThrow("OAuth client is not active for authorization");
  });
}

function registerOAuthTokenStorageTests() {
  registerRotateSuccessTest();
  registerReplayDetectionTest();
  registerRevokeFamilyTest();
  registerInvalidGrantTest();
  registerAuthorizationExpiryTest();
  registerInactiveExternalClientTest();
  registerUntrustedExternalClientTest();
}

describe("oauth token storage internals", registerOAuthTokenStorageTests);
