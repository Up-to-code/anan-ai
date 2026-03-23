"use server";

import {
  getAnanProVoiceUploadUrl,
  sendAnanProMessage,
  transcribeAnanProVoiceFromStorage,
} from "@/server/domains/workspace/ananPro/service";
import {
  sendAnanProMessageInputSchema,
  transcribeVoiceFromStorageInputSchema,
  type AnanProThread,
  type SendAnanProMessageInput,
  type TranscribeVoiceFromStorageInput,
  type TranscribeVoiceFromStorageResult,
} from "@/server/contracts/ananPro";
import { DomainError, normalizeDomainError, type DomainErrorShape } from "@/server/contracts/errors";

export type WorkspaceActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: DomainErrorShape };

function toActionError(error: unknown): WorkspaceActionResult<never> {
  const normalized = normalizeDomainError(error);
  return {
    ok: false,
    error: {
      code: normalized.code,
      message: normalized.message,
      status: normalized.status,
    },
  };
}

/**
 * WHY:   Message sends should use a server action boundary to keep transport/auth and validation server-side.
 * WHAT:  Sends one assistant message and returns the refreshed thread payload.
 * HOW:   Validates with the shared schema then delegates to the AnanPro domain service.
 */
export async function sendAssistantMessage(
  input: SendAnanProMessageInput,
): Promise<WorkspaceActionResult<AnanProThread>> {
  try {
    const parsed = sendAnanProMessageInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new DomainError({
        code: "INVALID_ARGUMENT",
        message: parsed.error.issues[0]?.message ?? "Invalid message payload",
        status: 400,
      });
    }

    const data = await sendAnanProMessage(parsed.data);
    return { ok: true, data };
  } catch (error) {
    return toActionError(error);
  }
}

/**
 * WHY:   Browser audio blobs need a short-lived upload URL without exposing direct Convex client calls.
 * WHAT:  Returns an authenticated Convex storage upload URL for one voice note upload.
 * HOW:   Delegates to the AnanPro voice domain service and normalizes errors for client handling.
 */
export async function getVoiceUploadUrl(): Promise<WorkspaceActionResult<{ uploadUrl: string }>> {
  try {
    const uploadUrl = await getAnanProVoiceUploadUrl();
    return {
      ok: true,
      data: { uploadUrl },
    };
  } catch (error) {
    return toActionError(error);
  }
}

/**
 * WHY:   Voice notes must be transcribed on the server because the vendor API key is private.
 * WHAT:  Transcribes one uploaded storage object and returns normalized transcript text.
 * HOW:   Validates the storage id, delegates to the voice transcription service, and returns stable action errors.
 */
export async function transcribeVoiceFromStorage(
  input: TranscribeVoiceFromStorageInput,
): Promise<WorkspaceActionResult<TranscribeVoiceFromStorageResult>> {
  try {
    const parsed = transcribeVoiceFromStorageInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new DomainError({
        code: "INVALID_ARGUMENT",
        message: parsed.error.issues[0]?.message ?? "Invalid voice transcription payload",
        status: 400,
      });
    }

    const data = await transcribeAnanProVoiceFromStorage(parsed.data);
    return { ok: true, data };
  } catch (error) {
    return toActionError(error);
  }
}
