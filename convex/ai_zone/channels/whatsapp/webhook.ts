/**
 * WhatsApp webhook handler.
 */
import { httpAction } from "../../../_generated/server";
import { apiRefs, internalRefs } from "../../../shared_logic/lib/generatedApiRefs";
import { extractWebhookEvents } from "./api";
import { type SendResult, WhatsAppService } from "./service";
import { processVoicePipeline } from "./preprocess/voicePipeline";
import { processTextPipeline } from "./preprocess/textPipeline";
import {
  VOICE_FALLBACK_MESSAGE_AR,
  WHATSAPP_GENERIC_ERROR_MESSAGE_AR,
} from "../rules/whatsapp.rules";
import type { Id } from "../../../_generated/dataModel";

function receivedResponse() {
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

async function readWebhookBody(request: Request) {
  try {
    return await request.text();
  } catch {
    return null;
  }
}

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

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}

/**
 * WHY:   Meta signs webhook POST bodies and the edge must reject forged traffic early.
 * WHAT:  Verifies the `x-hub-signature-256` header against the raw request body.
 * HOW:   Computes an HMAC SHA-256 digest with the configured app secret and compares it in constant time.
 */
export async function verifyWhatsAppSignature(body: string, signatureHeader: string | null) {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !signatureHeader) return false;
  const expected = await signBody(body, secret);
  return constantTimeEqual(expected, signatureHeader);
}

async function resolveTextToProcess(event: ReturnType<typeof extractWebhookEvents>[number]) {
  if (event.messageType !== "audio" || !event.mediaId) {
    return event.text;
  }
  const voiceResult = await processVoicePipeline({
    mediaId: event.mediaId,
    userId: event.from,
  });
  if (!voiceResult.success) {
    return `${voiceResult.assistantContextText}\n${voiceResult.fallbackMessage}`;
  }
  return voiceResult.text;
}

async function processWebhookEvent(
  ctx: any,
  waService: WhatsAppService,
  event: ReturnType<typeof extractWebhookEvents>[number],
) {
  const userId = event.from;
  await ctx.runMutation(apiRefs["shared_logic/users/whatsapp"].ensureWhatsAppUser, {
    userId,
    displayName: event.displayName,
  });

  const processed = processTextPipeline({
    text: await resolveTextToProcess(event),
    channelType: "whatsapp",
    userId,
    displayName: event.displayName,
    messageType: event.messageType,
    interactiveReplyId: event.interactiveReplyId,
    interactiveReplyTitle: event.interactiveReplyTitle,
  });

  const reply = await ctx.runAction(
    internalRefs["user_zone/whatsapp/index"].generateBuyerReply,
    {
      userId: processed.userId,
      message: processed.text,
      displayName: processed.displayName,
      messageId: event.messageId,
      messageType: processed.messageType,
      interactiveReplyId: processed.interactiveReplyId,
      interactiveReplyTitle: processed.interactiveReplyTitle,
    },
  );

  const sendResults = await waService.sendMessageSequence(
    userId,
    reply.outboundMessages,
    event.messageId,
  );
  return {
    threadId: reply.turn.threadId as Id<"assistantThreads">,
    sendResults,
  };
}

/** GET /api/whatsapp/webhook – Meta verification */
export async function handleWhatsAppWebhookGet(_ctx: unknown, request: Request): Promise<Response> {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN && challenge) {
    return new Response(challenge);
  }
  return new Response("Forbidden", { status: 403 });
}

type WebhookDeps = {
  createService?: (phoneNumberId: string) => WhatsAppService;
  processEvent?: typeof processWebhookEvent;
};

/**
 * WHY:   The POST webhook is the production ingress for deterministic buyer traffic from WhatsApp.
 * WHAT:  Validates the request, deduplicates inbound messages, delegates one buyer turn, and sends the reply sequence.
 * HOW:   Verifies Meta signatures, claims receipt rows by message id, then uses the user-zone deterministic assistant.
 */
export async function handleWhatsAppWebhookPostRequest(
  ctx: any,
  request: Request,
  deps: WebhookDeps = {},
) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const body = await readWebhookBody(request);
  if (body === null) {
    return new Response("Bad Request", { status: 400 });
  }

  // Reject unsigned or mismatched payloads before parsing or writing any buyer state.
  const isValidSignature = await verifyWhatsAppSignature(
    body,
    request.headers.get("x-hub-signature-256"),
  );
  if (!isValidSignature) {
    return new Response("Unauthorized", { status: 401 });
  }

  let events;
  try {
    events = extractWebhookEvents(body);
  } catch {
    return new Response("Bad Request", { status: 400 });
  }
  if (events.length === 0) {
    return receivedResponse();
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID ?? events[0]?.phoneNumberId ?? "";
  const waService = (deps.createService ?? ((resolvedPhoneNumberId) => new WhatsAppService(resolvedPhoneNumberId)))(
    phoneNumberId,
  );
  const processEvent = deps.processEvent ?? processWebhookEvent;

  for (const event of events) {
    if (event.messageId) {
      const claim = await ctx.runMutation(
        internalRefs["user_zone/whatsapp/state"].claimInboundMessageReceipt,
        {
          channel: "whatsapp",
          messageId: event.messageId,
          userId: event.from,
        },
      );
      // The receipt table is the canonical dedupe guard for webhook retries.
      if (!claim.proceed) {
        console.info("ai_zone.whatsapp.duplicate", {
          channel: "whatsapp",
          userId: event.from,
          messageId: event.messageId,
          messageType: event.messageType,
        });
        continue;
      }
    }

    try {
      const result = await processEvent(ctx, waService, event);
      const failedSend = result.sendResults.find((sendResult) => sendResult.success !== true);
      if (failedSend) {
        throw new Error(failedSend.error ?? "WHATSAPP_SEND_FAILED");
      }

      if (event.messageId) {
        await ctx.runMutation(
          internalRefs["user_zone/whatsapp/state"].completeInboundMessageReceipt,
          {
            channel: "whatsapp",
            messageId: event.messageId,
            userId: event.from,
            threadId: result.threadId,
            replyMessageIds: result.sendResults
              .map((sendResult: SendResult) => sendResult.messageId)
              .filter(Boolean),
          },
        );
      }

      console.info("ai_zone.whatsapp.sent", {
        channel: "whatsapp",
        userId: event.from,
        messageId: event.messageId,
        messageType: event.messageType,
        threadId: result.threadId,
        sendResult: result.sendResults.map((sendResult) => ({
          success: sendResult.success,
          messageId: sendResult.messageId,
        })),
      });
    } catch (err) {
      console.error("ai_zone.whatsapp.process_error", {
        channel: "whatsapp",
        userId: event.from,
        messageId: event.messageId,
        messageType: event.messageType,
        error: err instanceof Error ? err.message : "unknown_error",
      });

      if (event.messageId) {
        await ctx.runMutation(
          internalRefs["user_zone/whatsapp/state"].failInboundMessageReceipt,
          {
            channel: "whatsapp",
            messageId: event.messageId,
            userId: event.from,
            failureCode: err instanceof Error ? err.message : "unknown_error",
          },
        );
      }

      await waService.sendText(
        event.from,
        event.messageType === "audio"
          ? VOICE_FALLBACK_MESSAGE_AR
          : WHATSAPP_GENERIC_ERROR_MESSAGE_AR,
        event.messageId,
      );
    }
  }

  return receivedResponse();
}

/** POST /api/whatsapp/webhook – inbound messages */
export const handleWhatsAppWebhookPost = httpAction(handleWhatsAppWebhookPostRequest);
