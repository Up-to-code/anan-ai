import { ConvexError } from "convex/values";
import type { Id } from "../../_generated/dataModel";
import type { ActionCtx } from "../../_generated/server";
import { apiRefs } from "../../shared_logic/lib/generatedApiRefs";

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
    await ctx.runQuery(apiRefs["ai_zone/assistantWorkspace"].getThread, {});
  }

  const storageUrl = await ctx.runQuery(apiRefs["shared_logic/lib/storage"].getUrl, { storageId });
  if (!storageUrl) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: "Voice upload was not found.",
    });
  }

  const apiKey = getAssemblyAiApiKey();
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

  const createPayload = (await createResponse.json().catch(() => null)) as AssemblyAiCreateTranscriptResponse | null;
  if (!createResponse.ok || !createPayload?.id) {
    throw new ConvexError({
      code: "INTERNAL_ERROR",
      message: createPayload?.error || "Failed to submit voice transcription request.",
    });
  }

  const transcriptId = createPayload.id;
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
    await sleep(POLL_INTERVAL_MS);
    const pollResponse = await fetch(`${ASSEMBLYAI_BASE_URL}/v2/transcript/${encodeURIComponent(transcriptId)}`, {
      headers: {
        Authorization: apiKey,
      },
    });

    const pollPayload = (await pollResponse.json().catch(() => null)) as AssemblyAiTranscriptStatusResponse | null;
    if (!pollResponse.ok || !pollPayload?.status) {
      continue;
    }

    if (pollPayload.status === "completed") {
      const text = pollPayload.text?.trim();
      if (!text) {
        throw new ConvexError({
          code: "INTERNAL_ERROR",
          message: "Voice transcript completed with empty text.",
        });
      }

      return {
        text,
        languageCode: pollPayload.language_code,
      };
    }

    if (pollPayload.status === "error") {
      throw new ConvexError({
        code: "INTERNAL_ERROR",
        message: pollPayload.error || "Voice transcription failed.",
      });
    }
  }

  throw new ConvexError({
    code: "INTERNAL_ERROR",
    message: "Voice transcription timed out.",
  });
}
