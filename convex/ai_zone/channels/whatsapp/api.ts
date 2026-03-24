/**
 * WhatsApp Cloud API – webhook parsing and message extraction.
 */

export interface ExtractedMessage {
  from: string;
  messageId?: string;
  text: string;
  phoneNumberId?: string;
  displayName?: string;
  messageType:
    | "text"
    | "image"
    | "audio"
    | "video"
    | "document"
    | "interactive_button_reply"
    | "interactive_list_reply";
  mediaId?: string;
  interactiveReplyId?: string;
  interactiveReplyTitle?: string;
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
  interactive?: {
    button_reply?: { id?: string; title?: string };
    list_reply?: { id?: string; title?: string; description?: string };
  };
}

type WebhookValue = {
  metadata?: { phone_number_id?: string };
  contacts?: Array<{ wa_id?: string; profile?: { name?: string } }>;
  messages?: WebhookMessage[];
};

type WebhookBody = {
  entry?: Array<{
    changes?: Array<{
      value?: WebhookValue;
    }>;
  }>;
};

function parseWebhookBody(body: string): WebhookBody {
  return JSON.parse(body) as WebhookBody;
}

function buildImageText(message: WebhookMessage) {
  return message.image?.caption
    ? `[Image. Caption: ${message.image.caption}]`
    : "User sent an image.";
}

function buildVideoText(message: WebhookMessage) {
  return message.video?.caption
    ? `[Video. Caption: ${message.video.caption}]`
    : "User sent a video.";
}

function buildDocumentText(message: WebhookMessage) {
  return message.document?.caption
    ? `[Document. Caption: ${message.document.caption}]`
    : "User sent a document.";
}

function toExtractedMessage(
  message: WebhookMessage,
  base: Pick<ExtractedMessage, "from" | "messageId" | "phoneNumberId" | "displayName">,
): ExtractedMessage | null {
  if (message.text?.body) {
    return { ...base, text: message.text.body, messageType: "text" };
  }
  if (message.interactive?.button_reply) {
    return {
      ...base,
      text: message.interactive.button_reply.title ?? "",
      messageType: "interactive_button_reply",
      interactiveReplyId: message.interactive.button_reply.id,
      interactiveReplyTitle: message.interactive.button_reply.title,
    };
  }
  if (message.interactive?.list_reply) {
    return {
      ...base,
      text: message.interactive.list_reply.title ?? "",
      messageType: "interactive_list_reply",
      interactiveReplyId: message.interactive.list_reply.id,
      interactiveReplyTitle: message.interactive.list_reply.title,
    };
  }
  if (message.image) {
    return { ...base, text: buildImageText(message), messageType: "image", mediaId: message.image.id };
  }
  if (message.audio) {
    return { ...base, text: "User sent an audio message.", messageType: "audio", mediaId: message.audio.id };
  }
  if (message.voice) {
    return { ...base, text: "User sent a voice message.", messageType: "audio", mediaId: message.voice.id };
  }
  if (message.video) {
    return { ...base, text: buildVideoText(message), messageType: "video", mediaId: message.video.id };
  }
  if (message.document) {
    return { ...base, text: buildDocumentText(message), messageType: "document", mediaId: message.document.id };
  }
  return null;
}

function extractEventsFromValue(value?: WebhookValue) {
  if (!value?.messages) return [];
  const contact = value.contacts?.[0];
  const base = {
    from: "",
    messageId: undefined as string | undefined,
    phoneNumberId: value.metadata?.phone_number_id ?? "",
    displayName: contact?.profile?.name ?? "",
  };

  return value.messages.flatMap((message) => {
    const extracted = toExtractedMessage(message, {
      ...base,
      from: message.from ?? "",
      messageId: message.id,
    });
    return extracted ? [extracted] : [];
  });
}

/**
 * Extract message events from WhatsApp webhook body.
 */
export function extractWebhookEvents(body: string): ExtractedMessage[] {
  const data = parseWebhookBody(body);
  return (data.entry ?? []).flatMap((entry) =>
    (entry.changes ?? []).flatMap((change) => extractEventsFromValue(change.value)),
  );
}
