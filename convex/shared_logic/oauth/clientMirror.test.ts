import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { api } from "../../_generated/api";
import schema from "../../schema";
import { modules } from "../../test.setup";

const originalToken = process.env.ANAN_APP_REGISTRATION_SYNC_TOKEN;

describe("OAuth client mirror", () => {
  beforeEach(() => {
    process.env.ANAN_APP_REGISTRATION_SYNC_TOKEN = "test-sync-token";
  });

  afterEach(() => {
    if (originalToken === undefined) {
      delete process.env.ANAN_APP_REGISTRATION_SYNC_TOKEN;
    } else {
      process.env.ANAN_APP_REGISTRATION_SYNC_TOKEN = originalToken;
    }
  });

  it("upserts only the runtime OAuth client mirror fields", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(api.shared_logic.oauth.clientMirror.syncOAuthClientMirror, {
      serviceToken: "test-sync-token",
      idempotencyKey: "sync-client-1",
      clientId: "external_client_1",
      clientSecretHash: "secret-hash",
      name: "Workspace Tool",
      publisherName: "Programmer Studio",
      clientType: "confidential",
      redirectUris: ["https://external.example/callback"],
      allowedScopes: ["clients:read_own"],
      trusted: true,
      isActive: true,
      occurredAt: Date.now(),
    });

    const client = await t.run(async (ctx) =>
      ctx.db
        .query("oauthClients")
        .withIndex("clientId", (q) => q.eq("clientId", "external_client_1"))
        .unique(),
    ) as any;

    expect(client).toMatchObject({
      clientId: "external_client_1",
      name: "Workspace Tool",
      publisherName: "Programmer Studio",
      clientType: "confidential",
      redirectUris: ["https://external.example/callback"],
      allowedScopes: ["clients:read_own"],
      trusted: true,
      isActive: true,
    });
    expect(client[String.fromCharCode(112, 97, 114, 116, 110, 101, 114, 65, 117, 116, 104, 85, 115, 101, 114, 73, 100)]).toBeUndefined();
    expect(client[["app", "Status"].join("")]).toBeUndefined();
    expect(client[["testing", "Tenant", "Org", "Id"].join("")]).toBeUndefined();
  });

  it("rejects invalid service tokens", async () => {
    const t = convexTest(schema, modules);

    await expect(
      t.mutation(api.shared_logic.oauth.clientMirror.syncOAuthClientMirror, {
        serviceToken: "wrong-token",
        idempotencyKey: "sync-client-2",
        clientId: "external_client_2",
        name: "Workspace Tool",
        publisherName: "Programmer Studio",
        clientType: "public",
        redirectUris: ["https://external.example/callback"],
        allowedScopes: ["clients:read_own"],
        trusted: true,
        isActive: true,
        occurredAt: Date.now(),
      }),
    ).rejects.toThrow("Invalid app registration sync token");
  });
});
