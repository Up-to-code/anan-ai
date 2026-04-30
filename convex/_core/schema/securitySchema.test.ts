import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";

import schema from "../../schema";
import { modules } from "../../test.setup";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

describe("Convex security schema", () => {
  it("keeps Better Auth generated OAuth tables out of the canonical app schema", () => {
    const rootSchema = readFileSync(join(repoRoot, "schema.ts"), "utf8");

    expect(rootSchema).not.toContain("betterAuth/schema");
    expect(rootSchema).toContain("./_core/schema/auth");
  });

  it("rejects organization assets with unsupported MIME metadata", async () => {
    const t = convexTest(schema, modules);

    await expect(
      t.run((ctx) =>
        ctx.db.insert("organizationAssets", {
          tenantOrgId: "tenant-1",
          uploaderAuthUserId: "auth-user-1",
          category: "project_image",
          kind: "image",
          key: "asset-1",
          url: "https://utfs.io/f/asset-1.svg",
          name: "asset-1.svg",
          size: 100,
          mime: "image/svg+xml",
          sha256: "a".repeat(64),
          lifecycleState: "active",
          visibilityScope: "public_project",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as never),
      ),
    ).rejects.toThrow();
  });

  it("rejects malformed ZaneAI webhook outbox payloads", async () => {
    const t = convexTest(schema, modules);

    await expect(
      t.run((ctx) =>
        ctx.db.insert("zaneAiWebhookOutbox", {
          eventId: "evt-1",
          version: "org.sync.v1",
          action: "project.delete",
          destination: "zaneai",
          sourceSystem: "anan",
          tenantOrgId: "tenant-1",
          payload: {
            version: "org.sync.v1",
            action: "project.delete",
            occurredAt: Date.now(),
            source: { system: "anan", environment: "test", tenantOrgId: "tenant-1" },
          },
          status: "pending",
          attempts: 0,
          nextAttemptAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as never),
      ),
    ).rejects.toThrow();
  });
});
