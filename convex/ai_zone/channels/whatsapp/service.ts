/**
 * WhatsApp Cloud API service – text, interactive replies, and safe sequencing.
 */
import {
  MAX_NORMAL_MESSAGES_PER_TURN,
  WA_LINE_MAX_CHARS,
  WA_MAX_LINES,
  WHATSAPP_SEND_GAP_MS,
} from "../rules/whatsapp.rules";

const WHATSAPP_API_VERSION = "v21.0";

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export type WhatsAppOutboundMessage =
  | { type: "text"; text: string }
  | {
      type: "reply_buttons";
      body: string;
      footer?: string;
      buttons: Array<{ id: string; title: string }>;
    }
  | {
      type: "list";
      header?: string;
      body: string;
      footer?: string;
      buttonText: string;
      sectionTitle: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    };

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function wrapTextLine(line: string) {
  if (line.length <= WA_LINE_MAX_CHARS) return [line];
  const words = line.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= WA_LINE_MAX_CHARS) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    current = word;
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * WHY:   WhatsApp text replies need hard limits before they are sent to the transport API.
 * WHAT:  Splits one logical text message into WhatsApp-safe chunks.
 * HOW:   Wraps long lines first, then groups them into chunks bounded by the repo line-count rules.
 */
export function chunkTextForWhatsApp(text: string) {
  const normalizedLines = text
    .split(/\n+/)
    .flatMap((line) => wrapTextLine(line.trim()))
    .filter(Boolean);

  if (normalizedLines.length === 0) return [];

  const chunks: string[] = [];
  let current: string[] = [];
  for (const line of normalizedLines) {
    if (current.length >= WA_MAX_LINES) {
      chunks.push(current.join("\n"));
      current = [];
    }
    current.push(line);
  }
  if (current.length > 0) chunks.push(current.join("\n"));
  return chunks;
}

/**
 * WHY:   The webhook should hand one logical response sequence to the service without worrying about transport limits.
 * WHAT:  Normalizes outbound messages into the final sendable sequence.
 * HOW:   Expands text chunks and then caps the full turn to the configured outbound message budget.
 */
export function normalizeOutboundMessages(messages: WhatsAppOutboundMessage[]) {
  const expanded: WhatsAppOutboundMessage[] = [];
  for (const message of messages) {
    if (message.type !== "text") {
      expanded.push(message);
      continue;
    }
    expanded.push(
      ...chunkTextForWhatsApp(message.text).map(
        (text) => ({ type: "text" as const, text }),
      ),
    );
  }
  return expanded.slice(0, MAX_NORMAL_MESSAGES_PER_TURN);
}

export class WhatsAppService {
  constructor(
    private readonly phoneNumberId: string,
    private readonly token: string = process.env.WHATSAPP_ACCESS_TOKEN ?? "",
  ) {}

  private get baseUrl(): string {
    return `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${this.phoneNumberId}/messages`;
  }

  private withContext(body: Record<string, unknown>, contextMessageId?: string) {
    if (contextMessageId) {
      body.context = { message_id: contextMessageId };
    }
    return body;
  }

  private buildTextBody(userId: string, text: string, contextMessageId?: string) {
    return this.withContext(
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: userId.replace(/\D/g, ""),
        type: "text",
        text: { body: text },
      },
      contextMessageId,
    );
  }

  private buildReplyButtonsBody(
    userId: string,
    message: Extract<WhatsAppOutboundMessage, { type: "reply_buttons" }>,
    contextMessageId?: string,
  ) {
    return this.withContext(
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: userId.replace(/\D/g, ""),
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: message.body },
          footer: message.footer ? { text: message.footer } : undefined,
          action: {
            buttons: message.buttons.slice(0, 3).map((button) => ({
              type: "reply",
              reply: {
                id: button.id,
                title: button.title,
              },
            })),
          },
        },
      },
      contextMessageId,
    );
  }

  private buildListBody(
    userId: string,
    message: Extract<WhatsAppOutboundMessage, { type: "list" }>,
    contextMessageId?: string,
  ) {
    return this.withContext(
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: userId.replace(/\D/g, ""),
        type: "interactive",
        interactive: {
          type: "list",
          header: message.header ? { type: "text", text: message.header } : undefined,
          body: { text: message.body },
          footer: message.footer ? { text: message.footer } : undefined,
          action: {
            button: message.buttonText,
            sections: [
              {
                title: message.sectionTitle,
                rows: message.rows.slice(0, 10).map((row) => ({
                  id: row.id,
                  title: row.title,
                  description: row.description,
                })),
              },
            ],
          },
        },
      },
      contextMessageId,
    );
  }

  private async postMessage(body: Record<string, unknown>) {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(body),
    });
    const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    return { response, data };
  }

  private toFailureResult(response: Response, data: Record<string, unknown>): SendResult {
    const err = (data as { error?: { message?: string } })?.error;
    return {
      success: false,
      error: err?.message ?? `HTTP ${response.status} ${response.statusText}`,
    };
  }

  /**
   * WHY:   Plain text remains the simplest fallback transport for all WhatsApp buyer replies.
   * WHAT:  Sends one text message to a WhatsApp user.
   * HOW:   Posts a standard text payload to the Cloud API with optional reply context.
   */
  async sendText(
    userId: string,
    text: string,
    contextMessageId?: string,
  ): Promise<SendResult> {
    if (!this.token) {
      return { success: false, error: "WHATSAPP_ACCESS_TOKEN not set" };
    }

    const { response, data } = await this.postMessage(
      this.buildTextBody(userId, text, contextMessageId),
    );
    if (!response.ok) {
      return this.toFailureResult(response, data);
    }

    const messages = (data as { messages?: Array<{ id: string }> })?.messages;
    return { success: true, messageId: messages?.[0]?.id };
  }

  /**
   * WHY:   Property follow-up works better on WhatsApp when the user can tap a small action set.
   * WHAT:  Sends a reply-button interactive message.
   * HOW:   Posts an `interactive.button` payload with up to 3 reply buttons.
   */
  async sendReplyButtons(
    userId: string,
    message: Extract<WhatsAppOutboundMessage, { type: "reply_buttons" }>,
    contextMessageId?: string,
  ): Promise<SendResult> {
    if (!this.token) {
      return { success: false, error: "WHATSAPP_ACCESS_TOKEN not set" };
    }

    const { response, data } = await this.postMessage(
      this.buildReplyButtonsBody(userId, message, contextMessageId),
    );
    if (!response.ok) {
      return this.toFailureResult(response, data);
    }

    const messages = (data as { messages?: Array<{ id: string }> })?.messages;
    return { success: true, messageId: messages?.[0]?.id };
  }

  /**
   * WHY:   Search results need a structured, tappable list rather than an arbitrary text dump.
   * WHAT:  Sends an interactive list message.
   * HOW:   Posts an `interactive.list` payload with a single section and up to 10 rows.
   */
  async sendListMessage(
    userId: string,
    message: Extract<WhatsAppOutboundMessage, { type: "list" }>,
    contextMessageId?: string,
  ): Promise<SendResult> {
    if (!this.token) {
      return { success: false, error: "WHATSAPP_ACCESS_TOKEN not set" };
    }

    const { response, data } = await this.postMessage(
      this.buildListBody(userId, message, contextMessageId),
    );
    if (!response.ok) {
      return this.toFailureResult(response, data);
    }

    const messages = (data as { messages?: Array<{ id: string }> })?.messages;
    return { success: true, messageId: messages?.[0]?.id };
  }

  /**
   * WHY:   The webhook should delegate the final send loop to a single transport method.
   * WHAT:  Sends one normalized outbound WhatsApp message sequence.
   * HOW:   Expands text chunks, dispatches by message type, and waits between sends using the repo rule gap.
   */
  async sendMessageSequence(
    userId: string,
    messages: WhatsAppOutboundMessage[],
    contextMessageId?: string,
  ) {
    const sequence: WhatsAppOutboundMessage[] = normalizeOutboundMessages(messages);
    const results: SendResult[] = [];

    for (let index = 0; index < sequence.length; index += 1) {
      const message = sequence[index];
      let result: SendResult;
      if (message.type === "text") {
        result = await this.sendText(userId, message.text, contextMessageId);
      } else if (message.type === "reply_buttons") {
        result = await this.sendReplyButtons(userId, message, contextMessageId);
      } else {
        result = await this.sendListMessage(userId, message, contextMessageId);
      }
      results.push(result);
      if (index < sequence.length - 1) {
        await sleep(WHATSAPP_SEND_GAP_MS);
      }
    }

    return results;
  }
}
