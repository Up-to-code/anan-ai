/**
 * Auth – channel-oriented guard helpers.
 * WhatsApp webhook = implicit auth (trusted event.from).
 */

export type ChannelType = "whatsapp" | "app" | "web";

export type AuthResult =
  | { authorized: true; userId: string; channel: ChannelType; displayName?: string }
  | { authorized: false; reason: string };

function normalizeUserId(value: string | undefined): string | null {
  const userId = value?.trim();
  if (!userId) return null;
  return userId;
}

export function authWhatsAppWebhook(params: {
  from: string;
  displayName?: string;
}): AuthResult {
  const userId = normalizeUserId(params.from);
  if (!userId || userId.length < 10) {
    return { authorized: false, reason: "Invalid WhatsApp sender" };
  }

  return {
    authorized: true,
    userId,
    channel: "whatsapp",
    displayName: params.displayName,
  };
}

export function authApp(params: { sessionId?: string; token?: string; userId?: string }): AuthResult {
  const hasCredential = Boolean(params.sessionId?.trim() || params.token?.trim());
  const userId = normalizeUserId(params.userId ?? params.sessionId ?? params.token);

  if (!hasCredential || !userId) {
    return { authorized: false, reason: "Missing app auth credentials" };
  }

  return {
    authorized: true,
    userId,
    channel: "app",
  };
}

export function authWeb(params: { apiKey?: string; userId?: string }): AuthResult {
  const apiKey = params.apiKey?.trim();
  const userId = normalizeUserId(params.userId);

  if (!apiKey || apiKey.length < 12) {
    return { authorized: false, reason: "Invalid API key" };
  }

  if (!userId) {
    return { authorized: false, reason: "Missing web user identifier" };
  }

  return {
    authorized: true,
    userId,
    channel: "web",
  };
}
