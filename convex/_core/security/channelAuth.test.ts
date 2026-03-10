import { describe, expect, it } from "vitest";
import { ensureChannelUserForPhone, issueChannelSession } from "./channelAuth";

function makeCtx(params: {
  existingSession?: any;
  existingUser?: any;
  inserted?: Array<{ table: string; value: any }>;
  patched?: Array<{ id: string; value: any }>;
}) {
  return {
    db: {
      query: (table: string) => ({
        withIndex: (_index: string, _builder: any) => ({
          first: async () => {
            if (table === "channelSessions") return params.existingSession ?? null;
            if (table === "users") return params.existingUser ?? null;
            return null;
          },
        }),
      }),
      insert: async (table: string, value: any) => {
        params.inserted?.push({ table, value });
        return `${table}-1`;
      },
      patch: async (id: string, value: any) => {
        params.patched?.push({ id, value });
      },
    },
  } as any;
}

describe("channelAuth", () => {
  it("issues a new channel session when none exists", async () => {
    const inserted: Array<{ table: string; value: any }> = [];
    const ctx = makeCtx({ inserted });

    const session = await issueChannelSession(ctx, {
      authUserId: "channel:whatsapp:966501234567",
      channel: "whatsapp",
    });

    expect(session.sessionToken.length).toBeGreaterThan(20);
    expect(inserted[0]?.table).toBe("channelSessions");
  });

  it("reuses the same user record for the same phone", async () => {
    const patched: Array<{ id: string; value: any }> = [];
    const ctx = makeCtx({
      existingUser: { _id: "users-1", displayName: "Old Name" },
      patched,
    });

    const result = await ensureChannelUserForPhone(ctx, {
      phoneNumber: "+966 50 123 4567",
      displayName: "New Name",
    });

    expect(result.userId).toBe("users-1");
    expect(result.authUserId).toBe("channel:whatsapp:966501234567");
    expect(patched[0]?.value.displayName).toBe("New Name");
  });
});
