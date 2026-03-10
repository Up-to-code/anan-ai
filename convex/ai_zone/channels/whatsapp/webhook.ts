/**
 * WhatsApp webhook handler.
 */
import { httpAction } from "../../../_generated/server";
import { apiRefs, internalRefs } from "../../../shared_logic/lib/generatedApiRefs";
import { extractWebhookEvents } from "./api";
import { WhatsAppService } from "./service";
import { processVoicePipeline } from "./preprocess/voicePipeline";
import { processTextPipeline } from "./preprocess/textPipeline";
import { VOICE_FALLBACK_MESSAGE_AR } from "../rules/whatsapp.rules";

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

  let body: string;
  try {
    body = await request.text();
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  const events = extractWebhookEvents(body);
  if (events.length === 0) {
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID ?? events[0]?.phoneNumberId ?? "";
  const waService = new WhatsAppService(phoneNumberId);

  for (const event of events) {
    const userId = event.from;
    const displayName = event.displayName;

    await ctx.runMutation(apiRefs["shared_logic/users/whatsapp"].ensureWhatsAppUser, {
      userId,
      displayName,
    });

    let textToProcess = event.text;
    if (event.mediaType === "audio" && event.mediaId) {
      const voiceResult = await processVoicePipeline({
        mediaId: event.mediaId,
        userId,
      });
      if (!voiceResult.success) {
        await waService.sendText(userId, voiceResult.fallbackMessage, event.messageId);
        continue;
      }
      textToProcess = voiceResult.text;
    }

    const processed = processTextPipeline({
      text: textToProcess,
      channelType: "whatsapp",
      userId,
      displayName,
    });

    try {
      const reply = await ctx.runAction(
        internalRefs["ai_zone/channels/whatsapp/actions"].generateReply,
        {
          userId: processed.userId,
          message: processed.text,
          displayName: processed.displayName,
          threadId: processed.threadId,
        },
      );
      await waService.sendText(userId, reply.text, event.messageId);
    } catch (err) {
      console.error("Webhook process error:", err);
      await waService.sendText(
        userId,
        VOICE_FALLBACK_MESSAGE_AR,
        event.messageId,
      );
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
