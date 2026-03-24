"use server";

import {
  sendMainAssistantMessageInputSchema,
  synthesizeAssistantVoiceInputSchema,
  transcribeVoiceFromStorageInputSchema,
  type MainAssistantThread,
  type SendMainAssistantMessageInput,
  type SynthesizeAssistantVoiceInput,
  type SynthesizeAssistantVoiceResult,
  type TranscribeVoiceFromStorageInput,
} from "@/server/contracts/mainAssistant";
import {
  ensureMainAssistantSession,
  getMainAssistantThread,
  getMainAssistantVoiceUploadUrl,
  sendMainAssistantMessage,
  synthesizeMainAssistantVoice,
  transcribeMainAssistantVoice,
} from "@/server/domains/mainAssistant/service";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { message: string } };

function normalizeActionErrorMessage(rawMessage: string) {
  const message = rawMessage.trim();
  const convexMessageMatch = message.match(/"message":"([^"]+)"/);
  const extractedMessage = convexMessageMatch?.[1]?.replace(/\\"/g, "\"");
  const normalizedMessage = extractedMessage?.trim() || message;
  const normalized = normalizedMessage.toLowerCase();
  if (
    normalized.includes("invalid deployment address") ||
    normalized.includes("next_public_convex_url is not set") ||
    normalized.includes("backend url is missing")
  ) {
    return "Backend URL is missing. Set `NEXT_PUBLIC_CONVEX_URL` or `CONVEX_URL`.";
  }
  if (normalized.includes("missing elevenlabs configuration")) {
    return "Voice replies are not configured in this environment yet.";
  }
  return normalizedMessage;
}

function toActionError(error: unknown): ActionResult<never> {
  const rawMessage = error instanceof Error ? error.message : "حدث خطأ غير متوقع.";
  return {
    ok: false,
    error: {
      message: normalizeActionErrorMessage(rawMessage),
    },
  };
}

/**
 * WHY:   The public app needs one bootstrap call that also establishes its guest session cookie.
 * WHAT:  Returns the latest assistant thread for the current browser session, if any.
 * HOW:   Delegates to the server domain service which ensures the guest session token first.
 */
export async function bootstrapAssistant(): Promise<ActionResult<MainAssistantThread | null>> {
  try {
    await ensureMainAssistantSession();
    const thread = await getMainAssistantThread();
    return { ok: true, data: thread };
  } catch (error) {
    return toActionError(error);
  }
}

/**
 * WHY:   Client send logic should stay thin and only deal with one normalized action result.
 * WHAT:  Sends a message and returns the refreshed thread plus the latest assistant reply metadata.
 * HOW:   Validates with the shared contract, then delegates to the domain service.
 */
export async function sendAssistantMessage(
  input: SendMainAssistantMessageInput,
): Promise<
  ActionResult<{
    thread: MainAssistantThread;
    assistantMessageId: string;
    assistantText: string;
  }>
> {
  try {
    const parsed = sendMainAssistantMessageInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Invalid message payload.");
    }

    const result = await sendMainAssistantMessage(parsed.data);
    return { ok: true, data: result };
  } catch (error) {
    return toActionError(error);
  }
}

/**
 * WHY:   Voice capture should request upload credentials through a single server action.
 * WHAT:  Returns a storage upload URL for the current public assistant session.
 * HOW:   Delegates directly to the assistant voice domain service.
 */
export async function getVoiceUploadUrl(): Promise<ActionResult<{ uploadUrl: string }>> {
  try {
    const result = await getMainAssistantVoiceUploadUrl();
    return { ok: true, data: result };
  } catch (error) {
    return toActionError(error);
  }
}

/**
 * WHY:   The recorder hook needs a stable server action for transcript generation.
 * WHAT:  Transcribes one uploaded voice note and returns plain text.
 * HOW:   Validates the storage id payload before forwarding it to the domain service.
 */
export async function transcribeVoiceFromStorage(
  input: TranscribeVoiceFromStorageInput,
): Promise<ActionResult<{ text: string; languageCode?: string }>> {
  try {
    const parsed = transcribeVoiceFromStorageInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Invalid voice payload.");
    }

    const result = await transcribeMainAssistantVoice(parsed.data);
    return { ok: true, data: result };
  } catch (error) {
    return toActionError(error);
  }
}

/**
 * WHY:   Text rendering and voice synthesis are intentionally decoupled for faster perceived response time.
 * WHAT:  Generates an audio URL for one assistant reply.
 * HOW:   Validates the message id + text payload, then calls the public TTS domain service.
 */
export async function synthesizeAssistantVoice(
  input: SynthesizeAssistantVoiceInput,
): Promise<ActionResult<SynthesizeAssistantVoiceResult>> {
  try {
    const parsed = synthesizeAssistantVoiceInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Invalid synthesis payload.");
    }

    const result = await synthesizeMainAssistantVoice(parsed.data);
    return { ok: true, data: result };
  } catch (error) {
    return toActionError(error);
  }
}
