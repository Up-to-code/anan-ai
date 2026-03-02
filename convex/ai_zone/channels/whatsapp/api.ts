/**
 * WhatsApp Cloud API – webhook parsing and message extraction.
 */

export interface ExtractedMessage {
  from: string;
  messageId?: string;
  text: string;
  phoneNumberId?: string;
  displayName?: string;
  mediaType?: "text" | "image" | "audio" | "video" | "document";
  mediaId?: string;
}

interface WebhookMessage {
  from?: string;
  id?: string;
  type?: string;
  text?: { body: string };
  image?: { id?: string; caption?: string };
  audio?: { id?: string };
  voice?: { id?: string };
  video?: { id?: string; caption?: string };
  document?: { id?: string; filename?: string; caption?: string };
}

/**
 * Extract message events from WhatsApp webhook body.
 */
export function extractWebhookEvents(body: string): ExtractedMessage[] {
  const data = JSON.parse(body) as {
    entry?: Array<{
      changes?: Array<{
        value?: {
          metadata?: { phone_number_id?: string };
          contacts?: Array<{ wa_id?: string; profile?: { name?: string } }>;
          messages?: WebhookMessage[];
        };
      }>;
    }>;
  };

  const events: ExtractedMessage[] = [];

  for (const entry of data.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value?.messages) continue;

      const contact = value.contacts?.[0];
      const phoneNumberId = value.metadata?.phone_number_id ?? "";
      const displayName = contact?.profile?.name ?? "";

      for (const msg of value.messages) {
        const base = {
          from: msg.from ?? "",
          messageId: msg.id,
          phoneNumberId,
          displayName,
        };

        if (msg.text?.body) {
          events.push({ ...base, text: msg.text.body, mediaType: "text" });
          continue;
        }
        if (msg.image) {
          events.push({
            ...base,
            text: msg.image.caption
              ? `[Image. Caption: ${msg.image.caption}]`
              : "User sent an image.",
            mediaType: "image",
            mediaId: msg.image.id,
          });
          continue;
        }
        if (msg.audio) {
          events.push({
            ...base,
            text: "User sent an audio message.",
            mediaType: "audio",
            mediaId: msg.audio.id,
          });
          continue;
        }
        if (msg.voice) {
          events.push({
            ...base,
            text: "User sent a voice message.",
            mediaType: "audio",
            mediaId: msg.voice.id,
          });
          continue;
        }
        if (msg.video) {
          events.push({
            ...base,
            text: msg.video.caption
              ? `[Video. Caption: ${msg.video.caption}]`
              : "User sent a video.",
            mediaType: "video",
            mediaId: msg.video.id,
          });
          continue;
        }
        if (msg.document) {
          events.push({
            ...base,
            text: msg.document.caption
              ? `[Document. Caption: ${msg.document.caption}]`
              : "User sent a document.",
            mediaType: "document",
            mediaId: msg.document.id,
          });
          continue;
        }
      }
    }
  }
  return events;
}
