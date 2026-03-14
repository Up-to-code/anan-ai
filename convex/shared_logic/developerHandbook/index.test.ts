import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import schema from "../../schema";
import { apiRefs } from "../lib/generatedApiRefs";
import { modules } from "../../test.setup";

function makeIdentity(args: { subject: string; email: string; name: string }) {
  return {
    subject: args.subject,
    email: args.email,
    name: args.name,
  } as any;
}

async function seedUserProfile(
  t: ReturnType<typeof convexTest>,
  args: {
    authUserId: string;
    email: string;
    name: string;
    role: "user" | "broker" | "developer" | "RED" | "admin";
    brokerId?: string;
    REDId?: string;
  },
) {
  await t.run(async (ctx) => {
    await ctx.db.insert("userProfiles", {
      authUserId: args.authUserId,
      email: args.email,
      name: args.name,
      username: args.name.toLowerCase().replace(/\s+/g, "-"),
      usernameLower: args.name.toLowerCase().replace(/\s+/g, "-"),
      role: args.role,
      brokerId: args.brokerId,
      REDId: args.REDId,
      isActive: true,
      roleStatus: "approved",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as any);
  });
}

describe("developer handbook", () => {
  it("rejects plain end users (role gate)", async () => {
    const t = convexTest(schema, modules);
    const identity = makeIdentity({ subject: "auth-u", email: "u@example.com", name: "User" });
    await seedUserProfile(t, { authUserId: "auth-u", email: "u@example.com", name: "User", role: "user" });

    await expect(
      t.withIdentity(identity).query(
        apiRefs["shared_logic/developerHandbook/index"].retrieveDeveloperHandbookSnippets as never,
        { query: "convex", limit: 3 } as never,
      ),
    ).rejects.toThrow();
  });

  it("returns snippets for broker role using search index", async () => {
    const t = convexTest(schema, modules);
    const identity = makeIdentity({ subject: "auth-b", email: "b@example.com", name: "Broker Dev" });

    const brokerId = await t.run(async (ctx) => {
      return await ctx.db.insert("brokers", { name: "Broker 1", slug: "broker-1" } as any);
    });

    await seedUserProfile(t, {
      authUserId: "auth-b",
      email: "b@example.com",
      name: "Broker Dev",
      role: "broker",
      brokerId: brokerId as any,
    });

    await t.run(async (ctx) => {
      const now = Date.now();
      await ctx.db.insert("developerHandbookPages", {
        slug: "authz",
        title: "AuthZ checklist",
        content: "Authorization requires ownership checks and role gates.",
        category: "security",
        createdAt: now,
        updatedAt: now,
      } as any);
    });

    const results = (await t.withIdentity(identity).query(
      apiRefs["shared_logic/developerHandbook/index"].retrieveDeveloperHandbookSnippets as never,
      { query: "authorization", limit: 4 } as never,
    )) as any[];

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.slug).toBe("authz");
    expect(typeof results[0]?.excerpt).toBe("string");
  });
});

