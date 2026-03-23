/**
 * WhatsApp webhook handler.
 */
import { httpAction } from "../../../_generated/server";
import { api, internal } from "../../../_generated/api";
import { extractWebhookEvents } from "./api";
import { WhatsAppService } from "./service";
import { processVoicePipeline } from "./preprocess/voicePipeline";
import { processTextPipeline } from "./preprocess/textPipeline";
import { VOICE_FALLBACK_MESSAGE_AR } from "../rules/whatsapp.rules";
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

async function resolveTextToProcess(event: ReturnType<typeof extractWebhookEvents>[number]) {
  if (event.mediaType !== "audio" || !event.mediaId) {
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

async function processWebhookEvent(ctx: any, waService: WhatsAppService, event: ReturnType<typeof extractWebhookEvents>[number]) {
  const userId = event.from;
  await ctx.runMutation(api.shared_logic.users.whatsapp.ensureWhatsAppUser, {
    userId,
    displayName: event.displayName,
  });
  const processed = processTextPipeline({
    text: await resolveTextToProcess(event),
    channelType: "whatsapp",
    userId,
    displayName: event.displayName,
  });
  try {
    const reply = await ctx.runAction(internal.ai_zone.channels.whatsapp.actions.generateReply, {
      userId: processed.userId,
      message: processed.text,
      displayName: processed.displayName,
      threadId: processed.threadId as Id<"assistantThreads"> | undefined,
    });
    await waService.sendText(userId, reply.text, event.messageId);
  } catch (err) {
    console.error("Webhook process error:", err);
    await waService.sendText(userId, VOICE_FALLBACK_MESSAGE_AR, event.messageId);
  }
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

/** POST /api/whatsapp/webhook – inbound messages */
export const handleWhatsAppWebhookPost = httpAction(async (ctx, request) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  const body = await readWebhookBody(request);
  if (body === null) {
    return new Response("Bad Request", { status: 400 });
  }
  const events = extractWebhookEvents(body);
  if (events.length === 0) {
    return receivedResponse();
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID ?? events[0]?.phoneNumberId ?? "";
  const waService = new WhatsAppService(phoneNumberId);
  for (const event of events) await processWebhookEvent(ctx, waService, event);
  return receivedResponse();
});
