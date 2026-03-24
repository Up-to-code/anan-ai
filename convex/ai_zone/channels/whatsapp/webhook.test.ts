import { describe, expect, it, vi } from "vitest";
import {
  handleWhatsAppWebhookGet,
  handleWhatsAppWebhookPostRequest,
  verifyWhatsAppSignature,
} from "./webhook";

async function signBody(body: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return `sha256=${Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;
}

function makeWebhookRequest(body: string, signature: string) {
  return new Request("https://example.com/api/whatsapp/webhook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hub-signature-256": signature,
    },
    body,
  });
}

describe("whatsapp webhook", () => {
  it("returns the verification challenge for valid GET requests", async () => {
    process.env.WHATSAPP_VERIFY_TOKEN = "verify-token";
    const response = await handleWhatsAppWebhookGet(
      null,
      new Request(
        "https://example.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=verify-token&hub.challenge=123",
      ),
    );
    expect(await response.text()).toBe("123");
  });

  it("verifies signed webhook payloads", async () => {
    process.env.WHATSAPP_APP_SECRET = "secret";
    const body = JSON.stringify({ entry: [] });
    const signature = await signBody(body, "secret");
    await expect(verifyWhatsAppSignature(body, signature)).resolves.toBe(true);
  });

  it("rejects POST requests with an invalid signature", async () => {
    process.env.WHATSAPP_APP_SECRET = "secret";
    const response = await handleWhatsAppWebhookPostRequest(
      {},
      makeWebhookRequest(JSON.stringify({ entry: [] }), "sha256=invalid"),
    );
    expect(response.status).toBe(401);
  });

  it("returns received for webhook payloads with no message events", async () => {
    process.env.WHATSAPP_APP_SECRET = "secret";
    const body = JSON.stringify({ entry: [] });
    const signature = await signBody(body, "secret");
    const response = await handleWhatsAppWebhookPostRequest(
      {},
      makeWebhookRequest(body, signature),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: true });
  });

  it("deduplicates already-claimed inbound message ids", async () => {
    process.env.WHATSAPP_APP_SECRET = "secret";
    const body = JSON.stringify({
      entry: [
        {
          changes: [
            {
              value: {
                metadata: { phone_number_id: "123" },
                contacts: [{ wa_id: "966501234567", profile: { name: "Ahmed" } }],
                messages: [{ from: "966501234567", id: "wamid-1", text: { body: "hello" } }],
              },
            },
          ],
        },
      ],
    });
    const signature = await signBody(body, "secret");
    const processEvent = vi.fn();
    const sendText = vi.fn();
    const ctx = {
      runMutation: vi.fn(async (_ref: unknown, args: { messageId?: string }) => {
        if (args.messageId === "wamid-1") {
          return { proceed: false, status: "processed" };
        }
        return null;
      }),
    };

    const response = await handleWhatsAppWebhookPostRequest(
      ctx,
      makeWebhookRequest(body, signature),
      {
        createService: () => ({ sendText } as any),
        processEvent: processEvent as any,
      },
    );

    expect(response.status).toBe(200);
    expect(processEvent).not.toHaveBeenCalled();
    expect(sendText).not.toHaveBeenCalled();
  });

  it("marks failures and sends a fallback reply", async () => {
    process.env.WHATSAPP_APP_SECRET = "secret";
    const body = JSON.stringify({
      entry: [
        {
          changes: [
            {
              value: {
                metadata: { phone_number_id: "123" },
                contacts: [{ wa_id: "966501234567", profile: { name: "Ahmed" } }],
                messages: [{ from: "966501234567", id: "wamid-2", text: { body: "hello" } }],
              },
            },
          ],
        },
      ],
    });
    const signature = await signBody(body, "secret");
    const sendText = vi.fn().mockResolvedValue({ success: true, messageId: "fallback-1" });
    const ctx = {
      runMutation: vi.fn(async (_ref: unknown, args: { messageId?: string }) => {
        if (args.messageId === "wamid-2") {
          return { proceed: true, status: "processing" };
        }
        return null;
      }),
    };

    const response = await handleWhatsAppWebhookPostRequest(
      ctx,
      makeWebhookRequest(body, signature),
      {
        createService: () => ({ sendText } as any),
        processEvent: vi.fn(async () => {
          throw new Error("boom");
        }) as any,
      },
    );

    expect(response.status).toBe(200);
    expect(sendText).toHaveBeenCalledTimes(1);
    expect(ctx.runMutation).toHaveBeenCalled();
  });
});
