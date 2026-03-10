/**
 * WhatsApp Cloud API service – sendText, markRead.
 */
const WHATSAPP_API_VERSION = "v21.0";

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class WhatsAppService {
  constructor(
    private readonly phoneNumberId: string,
    private readonly token: string = process.env.WHATSAPP_ACCESS_TOKEN ?? "",
  ) {}

  private get baseUrl(): string {
    return `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${this.phoneNumberId}/messages`;
  }

  /**
   * Send a text message to a WhatsApp user.
   * @param userId - WhatsApp ID (phone number with country code, no +)
   * @param text - Message text
   * @param contextMessageId - Optional: message ID this is a reply to
   */
  async sendText(
    userId: string,
    text: string,
    contextMessageId?: string,
  ): Promise<SendResult> {
    if (!this.token) {
      return { success: false, error: "WHATSAPP_ACCESS_TOKEN not set" };
    }

    const body: Record<string, unknown> = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: userId.replace(/\D/g, ""),
      type: "text",
      text: { body: text },
    };

    if (contextMessageId) {
      body.context = { message_id: contextMessageId };
    }

    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(body),
    });

    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const err = (data as { error?: { message?: string } })?.error;

    if (!res.ok) {
      return {
        success: false,
        error: err?.message ?? `HTTP ${res.status} ${res.statusText}`,
      };
    }

    const messages = (data as { messages?: Array<{ id: string }> })?.messages;
    return { success: true, messageId: messages?.[0]?.id };
  }
}
