import { ConvexError } from "convex/values";
import type { Id } from "../../_generated/dataModel";
import type { ActionCtx } from "../../_generated/server";
import { api, internal } from "../../_generated/api";

const ASSEMBLYAI_BASE_URL = "https://api.assemblyai.com";
const POLL_INTERVAL_MS = 1_500;
const MAX_POLL_ATTEMPTS = 80;

type AssemblyAiCreateTranscriptResponse = {
  id?: string;
  error?: string;
};

type AssemblyAiTranscriptStatusResponse = {
  status?: "queued" | "processing" | "completed" | "error";
  text?: string;
  error?: string;
  language_code?: string;
};

function getAssemblyAiApiKey() {
  const apiKey = process.env.ASSEMBLYAI_API_KEY?.trim();
  if (!apiKey) {
    throw new ConvexError({
      code: "AUTH_CONFIGURATION_ERROR",
      message: "Missing ASSEMBLYAI_API_KEY.",
    });
  }
  return apiKey;
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function resolveVoiceStorageUrl(ctx: ActionCtx, storageId: Id<"_storage">) {
  const storageUrl = await ctx.runQuery(internal.shared_logic.lib.storage.getUrl, { storageId });
  if (!storageUrl) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: "Voice upload was not found.",
    });
  }
  return storageUrl;
}

async function createTranscript(apiKey: string, storageUrl: string) {
  const createResponse = await fetch(`${ASSEMBLYAI_BASE_URL}/v2/transcript`, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      audio_url: storageUrl,
      language_detection: true,
      speech_models: ["universal-3-pro", "universal-2"],
    }),
  });
  const payload = (await createResponse.json().catch(() => null)) as AssemblyAiCreateTranscriptResponse | null;
  if (!createResponse.ok || !payload?.id) {
    throw new ConvexError({
      code: "INTERNAL_ERROR",
      message: payload?.error || "Failed to submit voice transcription request.",
    });
  }
  return payload.id;
}

function resolveCompletedTranscript(payload: AssemblyAiTranscriptStatusResponse | null) {
  if (payload?.status !== "completed") return null;
  const text = payload.text?.trim();
  if (!text) {
    throw new ConvexError({
      code: "INTERNAL_ERROR",
      message: "Voice transcript completed with empty text.",
    });
  }
  return { text, languageCode: payload.language_code };
}

function assertTranscriptNotErrored(payload: AssemblyAiTranscriptStatusResponse | null) {
  if (payload?.status === "error") {
    throw new ConvexError({
      code: "INTERNAL_ERROR",
      message: payload.error || "Voice transcription failed.",
    });
  }
}

async function pollTranscriptResult(apiKey: string, transcriptId: string) {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
    await sleep(POLL_INTERVAL_MS);
    const pollResponse = await fetch(`${ASSEMBLYAI_BASE_URL}/v2/transcript/${encodeURIComponent(transcriptId)}`, {
      headers: { Authorization: apiKey },
    });
    const payload = (await pollResponse.json().catch(() => null)) as AssemblyAiTranscriptStatusResponse | null;
    if (!pollResponse.ok || !payload?.status) continue;
    const completed = resolveCompletedTranscript(payload);
    if (completed) return completed;
    assertTranscriptNotErrored(payload);
  }
  throw new ConvexError({
    code: "INTERNAL_ERROR",
    message: "Voice transcription timed out.",
  });
}

/**
 * WHY:   Voice-note transcription needs one shared service to keep external API logic out of controllers.
 * WHAT:  Uploads a stored audio URL to AssemblyAI and polls until transcript completion.
 * HOW:   Requires an authenticated workspace context, then calls AssemblyAI async transcript endpoints with bounded polling.
 */
export async function transcribeStoredVoiceNote(
  ctx: ActionCtx,
  storageId: Id<"_storage">,
  options?: { skipAuthorization?: boolean },
): Promise<{ text: string; languageCode?: string }> {
  if (!options?.skipAuthorization) {
    await ctx.runQuery(api.ai_zone.assistantWorkspace.getThread, {});
  }
  const storageUrl = await resolveVoiceStorageUrl(ctx, storageId);
  const apiKey = getAssemblyAiApiKey();
  const transcriptId = await createTranscript(apiKey, storageUrl);
  return pollTranscriptResult(apiKey, transcriptId);
}
