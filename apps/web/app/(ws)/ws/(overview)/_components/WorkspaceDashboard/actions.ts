"use server";

import { z } from "zod";
import {
  finalizeAnanProUploadedFiles,
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
import { uploadedFileReferenceSchema, type UploadedFileReference } from "@/server/contracts/files";
import { DomainError, normalizeDomainError, type DomainErrorShape } from "@/server/contracts/errors";

export type WorkspaceActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: DomainErrorShape };

const finalizeAssistantUploadsInputSchema = z.object({
  files: z.array(z.object({
    storageId: z.string().min(1),
    name: z.string().min(1),
    size: z.number().int().nonnegative().optional(),
    mime: z.string().min(1).optional(),
  })).min(1),
});

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
 * WHY:   Assistant image/file attachments need the same authenticated storage upload handshake as voice notes.
 * WHAT:  Returns a short-lived upload URL for one assistant attachment upload.
 * HOW:   Reuses the assistant storage mutation and normalizes domain failures for client actions.
 */
export async function getAssistantUploadUrl(): Promise<WorkspaceActionResult<{ uploadUrl: string }>> {
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

/**
 * WHY:   Browser uploads return only storage ids, but the assistant thread and AG UI need stable file references.
 * WHAT:  Resolves uploaded storage objects into the shared uploaded-file contract used across workspace surfaces.
 * HOW:   Validates the storage payload, delegates to the assistant domain service, and returns normalized file references.
 */
export async function finalizeAssistantUploads(
  input: {
    files: Array<{
      storageId: string;
      name: string;
      size?: number;
      mime?: string;
    }>;
  },
): Promise<WorkspaceActionResult<UploadedFileReference[]>> {
  try {
    const parsed = finalizeAssistantUploadsInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new DomainError({
        code: "INVALID_ARGUMENT",
        message: parsed.error.issues[0]?.message ?? "Invalid assistant upload payload",
        status: 400,
      });
    }

    const data = await finalizeAnanProUploadedFiles(parsed.data);
    const validated = z.array(uploadedFileReferenceSchema).parse(data);
    return { ok: true, data: validated };
  } catch (error) {
    return toActionError(error);
  }
}
