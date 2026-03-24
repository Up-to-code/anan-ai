"use server";

import { cookies } from "next/headers";
import { fetchAction, fetchMutation, fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";
import { getConvexNextOptions } from "@/server/infrastructure/convex/options";
import type {
  MainAssistantThread,
  SendMainAssistantMessageInput,
  SynthesizeAssistantVoiceInput,
  SynthesizeAssistantVoiceResult,
  TranscribeVoiceFromStorageInput,
} from "@/server/contracts/mainAssistant";

const GUEST_ID_COOKIE = "anan_main_assistant_guest_id";
const SESSION_COOKIE = "anan_main_assistant_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

type AssistantPublicApiRefs = {
  bootstrapSession: unknown;
  getThreadSafe: unknown;
  listMessages: unknown;
  sendMessage: unknown;
  createThread: unknown;
  generateVoiceUploadUrl: unknown;
  transcribeVoiceFromStorage: unknown;
  synthesizeAssistantVoice: unknown;
};

const assistantPublicApi = apiUnsafe["ai_zone/assistantPublic"] as AssistantPublicApiRefs;

type RawThread = {
  _id: string;
  title?: string;
} | null;

type RawMessage = {
  _id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: {
    inputMode?: "text" | "voice";
    audioUrl?: string;
  };
  createdAt: number;
};

type MainAssistantSession = {
  guestId: string;
  channelSessionToken: string;
};

type ElevenLabsResponse = {
  detail?: {
    message?: string;
  };
};

function readLocalElevenLabsConfig() {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim();
  const modelId = process.env.ELEVENLABS_MODEL_ID?.trim() || "eleven_flash_v2_5";

  if (!apiKey || !voiceId) {
    return null;
  }

  return { apiKey, voiceId, modelId };
}

async function synthesizeAssistantVoiceDirect(text: string) {
  const trimmedText = text.trim();
  if (!trimmedText) {
    throw new Error("Voice synthesis text is required.");
  }

  const config = readLocalElevenLabsConfig();
  if (!config) {
    return null;
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(config.voiceId)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
        "xi-api-key": config.apiKey,
      },
      body: JSON.stringify({
        text: trimmedText,
        model_id: config.modelId,
        optimize_streaming_latency: 3,
        output_format: "mp3_44100_128",
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ElevenLabsResponse | null;
    throw new Error(payload?.detail?.message || "Voice synthesis failed.");
  }

  const audioBuffer = await response.arrayBuffer();
  if (audioBuffer.byteLength === 0) {
    throw new Error("Voice synthesis returned empty audio.");
  }

  return {
    audioBase64: Buffer.from(audioBuffer).toString("base64"),
    mimeType: "audio/mpeg",
  };
}

function toThread(thread: RawThread, messages: RawMessage[]): MainAssistantThread | null {
  if (!thread?._id) {
    return null;
  }

  return {
    id: thread._id,
    title: thread.title ?? null,
    messages: messages.map((message) => ({
      id: message._id,
      role: message.role,
      content: message.content,
      inputMode: message.metadata?.inputMode,
      audioUrl: message.metadata?.audioUrl,
      audioStatus: message.metadata?.audioUrl ? "ready" : "idle",
      createdAt: message.createdAt,
    })),
  };
}

/**
 * WHY:   The public app needs a durable backend-recognized guest session without requiring auth.
 * WHAT:  Ensures one guest/session cookie pair exists, bootstrapping it from Convex when missing.
 * HOW:   Reads the guest and channel-session cookies first, otherwise calls the public bootstrap mutation and persists both values.
 */
export async function readMainAssistantSession() {
  const cookieStore = await cookies();
  const guestId = cookieStore.get(GUEST_ID_COOKIE)?.value?.trim();
  const channelSessionToken = cookieStore.get(SESSION_COOKIE)?.value?.trim();
  if (!guestId || !channelSessionToken) {
    return null;
  }

  return {
    guestId,
    channelSessionToken,
  } satisfies MainAssistantSession;
}

export async function ensureMainAssistantSession() {
  const convexOptions = getConvexNextOptions();
  const cookieStore = await cookies();
  const existingGuestId = cookieStore.get(GUEST_ID_COOKIE)?.value?.trim();
  const existingToken = cookieStore.get(SESSION_COOKIE)?.value?.trim();
  if (existingGuestId && existingToken) {
    return {
      guestId: existingGuestId,
      channelSessionToken: existingToken,
    } satisfies MainAssistantSession;
  }

  const created = (await fetchMutation(
    assistantPublicApi.bootstrapSession as never,
    { guestId: existingGuestId || undefined } as never,
    convexOptions,
  )) as {
    guestId: string;
    channelSessionToken: string;
  };

  cookieStore.set(GUEST_ID_COOKIE, created.guestId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  cookieStore.set(SESSION_COOKIE, created.channelSessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  return {
    guestId: created.guestId,
    channelSessionToken: created.channelSessionToken,
  } satisfies MainAssistantSession;
}

/**
 * WHY:   The page bootstrap needs one normalized thread payload for the current guest session.
 * WHAT:  Loads the latest public assistant thread if one already exists.
 * HOW:   Resolves the session token, asks Convex for the thread, and maps raw message rows to app contracts.
 */
export async function getMainAssistantThread() {
  const convexOptions = getConvexNextOptions();
  const session = await readMainAssistantSession();
  if (!session) {
    return null;
  }
  const result = (await fetchQuery(
    assistantPublicApi.getThreadSafe as never,
    session as never,
    convexOptions,
  )) as { thread: RawThread };

  if (!result.thread?._id) {
    return null;
  }

  const messages = (await fetchQuery(
    assistantPublicApi.listMessages as never,
    { ...session, threadId: result.thread._id } as never,
    convexOptions,
  )) as RawMessage[];

  return toThread(result.thread, messages);
}

/**
 * WHY:   Message sends should return a refreshed full thread so the client can stay simple.
 * WHAT:  Sends one user message, then reloads the full thread snapshot.
 * HOW:   Delegates send/create work to Convex and reconstructs the thread from query results.
 */
export async function sendMainAssistantMessage(input: SendMainAssistantMessageInput): Promise<{
  thread: MainAssistantThread;
  assistantMessageId: string;
  assistantText: string;
}> {
  const convexOptions = getConvexNextOptions();
  const session = await ensureMainAssistantSession();
  const sent = (await fetchAction(
    assistantPublicApi.sendMessage as never,
    { ...input, ...session } as never,
    convexOptions,
  )) as {
    threadId: string;
    messageId: string;
    output: string;
  };

  const messages = (await fetchQuery(
    assistantPublicApi.listMessages as never,
    { ...session, threadId: sent.threadId } as never,
    convexOptions,
  )) as RawMessage[];

  const thread = toThread(
    {
      _id: sent.threadId,
      title: messages.find((message) => message.role === "user")?.content.slice(0, 80),
    },
    messages,
  );

  if (!thread) {
    throw new Error("Assistant thread could not be loaded after send.");
  }

  return {
    thread,
    assistantMessageId: sent.messageId,
    assistantText: sent.output,
  };
}

/**
 * WHY:   Voice-note uploads require a server-owned session boundary before the browser can upload.
 * WHAT:  Returns a Convex storage upload URL for the active guest assistant session.
 * HOW:   Resolves the public session token first, then calls the dedicated public assistant mutation.
 */
export async function getMainAssistantVoiceUploadUrl() {
  const convexOptions = getConvexNextOptions();
  const session = await ensureMainAssistantSession();
  const uploadUrl = (await fetchMutation(
    assistantPublicApi.generateVoiceUploadUrl as never,
    session as never,
    convexOptions,
  )) as string;

  return { uploadUrl };
}

/**
 * WHY:   Browser voice capture should stay client-side while transcript vendors remain server-side.
 * WHAT:  Transcribes an uploaded storage object for the current guest assistant session.
 * HOW:   Sends the storage id plus session token to the public assistant action.
 */
export async function transcribeMainAssistantVoice(input: TranscribeVoiceFromStorageInput) {
  const convexOptions = getConvexNextOptions();
  const session = await ensureMainAssistantSession();
  return fetchAction(
    assistantPublicApi.transcribeVoiceFromStorage as never,
    { ...input, ...session } as never,
    convexOptions,
  ) as Promise<{ text: string; languageCode?: string }>;
}

/**
 * WHY:   Spoken assistant playback should be generated after text lands, not before.
 * WHAT:  Converts one assistant reply into an audio URL using the public TTS endpoint.
 * HOW:   Resolves the guest session token and forwards the message identity plus text payload.
 */
export async function synthesizeMainAssistantVoice(
  input: SynthesizeAssistantVoiceInput,
): Promise<SynthesizeAssistantVoiceResult> {
  try {
    const directResult = await synthesizeAssistantVoiceDirect(input.text);
    if (directResult?.audioBase64 && directResult.mimeType) {
      return {
        audioUrl: `data:${directResult.mimeType};base64,${directResult.audioBase64}`,
      };
    }
  } catch (directError) {
    console.warn(
      "main-assistant: direct ElevenLabs synthesis failed, falling back to Convex action",
      directError,
    );
  }

  const convexOptions = getConvexNextOptions();
  const session = await ensureMainAssistantSession();
  const response = (await fetchAction(
    assistantPublicApi.synthesizeAssistantVoice as never,
    { text: input.text, ...session } as never,
    convexOptions,
  )) as { audioBase64?: string; mimeType?: string; voiceUnavailableReason?: string };

  if (!response.audioBase64 || !response.mimeType) {
    return {
      voiceUnavailableReason:
        response.voiceUnavailableReason ?? "Voice replies are unavailable right now.",
    };
  }

  return {
    audioUrl: `data:${response.mimeType};base64,${response.audioBase64}`,
  };
}
