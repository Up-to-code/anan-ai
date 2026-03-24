import type { ActionCtx } from "../../../_generated/server";
import type { AssistantOwner, WorkspaceProjectActionState, WorkspaceProjectFields } from "./types";
import type { WorkspaceProjectFieldKey, WorkspaceStructuredOutput } from "../../agents/anan_workspace/types";
import { api } from "../../../_generated/api";
import {
  computeMissingFields,
  extractProjectFieldsFromText,
  hasCreateProjectIntent,
} from "./workspaceParsing";

export function resolveWorkspaceProjectActionState(params: {
  message: string;
  previous: WorkspaceProjectActionState | null;
  structured: WorkspaceStructuredOutput;
}): WorkspaceProjectActionState | null {
  const { message, previous, structured } = params;

  const hasIntent = hasCreateProjectIntent(message, structured);
  const isContinuing = previous !== null && previous.state !== "completed";
  if (!hasIntent && !isContinuing) {
    return null;
  }

  const mergedFields: WorkspaceProjectFields = {
    ...(previous?.fields ?? {}),
  };

  if (structured.actionCandidate?.type === "create_project") {
    const candidateFields = structured.actionCandidate.fields as WorkspaceProjectFields;
    Object.assign(mergedFields, candidateFields);
  }

  const expectedField = (previous?.missingFields?.[0] as WorkspaceProjectFieldKey | undefined);
  const parsedFields = extractProjectFieldsFromText(message, expectedField);
  Object.assign(mergedFields, parsedFields);

  const missingFields = computeMissingFields(mergedFields);
  const state: WorkspaceProjectActionState["state"] =
    missingFields.length === 0 ? "ready" : "collecting";

  return { type: "create_project", fields: mergedFields, missingFields, state };
}

function projectFieldsToCreatePayload(fields: WorkspaceProjectFields) {
  const missing = computeMissingFields(fields);
  if (missing.length > 0) return null;

  const address = [fields.district, fields.city].filter(Boolean).join(" - ");
  return {
    title: fields.name as string,
    address: address || (fields.city as string),
    price: fields.price as number,
    beds: fields.rooms as number,
    baths: fields.bathrooms as number,
    description: fields.description as string,
    location: fields.city,
    area: fields.district,
    status: "available" as const,
  };
}

export async function autoCreateWorkspaceProjectDraft(
  ctx: ActionCtx,
  owner: AssistantOwner,
  fields: WorkspaceProjectFields
): Promise<{ projectId: string }> {
  const payload = projectFieldsToCreatePayload(fields);
  if (!payload) {
    throw new Error("PROJECT_FIELDS_INCOMPLETE");
  }

  if (owner.ownerType === "broker" && owner.ownerBrokerId) {
    const projectId = await ctx.runMutation(api.broker_zone.properties.create, {
      brokerId: owner.ownerBrokerId,
      ...payload,
    });
    return { projectId: String(projectId) };
  }

  if (owner.ownerType === "RED" && owner.ownerREDId) {
    const projectId = await ctx.runMutation(api.red_zone.properties.create, {
      REDId: owner.ownerREDId,
      ...payload,
    });
    return { projectId: String(projectId) };
  }

  throw new Error("PROJECT_CREATE_UNAVAILABLE");
}

type WorkspaceActionStagePhase = "action_started" | "action_done";
type WorkspaceActionStageStatus = "running" | "completed" | "failed";
type EmitWorkspaceActionStage = (
  phase: WorkspaceActionStagePhase,
  payload: { status: WorkspaceActionStageStatus; details?: Record<string, unknown> }
) => Promise<void>;

type DraftAnnotateResult = {
  assistantText: string;
  actionState: WorkspaceProjectActionState | null;
};

export async function maybeAutoCreateDraftAndAnnotate(params: {
  ctx: ActionCtx;
  owner: AssistantOwner;
  actionState: WorkspaceProjectActionState | null;
  assistantText: string;
  wasCancelled: boolean;
  emitStage: EmitWorkspaceActionStage;
}): Promise<DraftAnnotateResult> {
  const { ctx, owner, actionState, assistantText, wasCancelled, emitStage } = params;
  if (!actionState || actionState.state !== "ready" || wasCancelled) {
    return { actionState, assistantText };
  }

  try {
    await emitStage("action_started", { status: "running", details: { action: "create_project_draft" } });
    const created = await autoCreateWorkspaceProjectDraft(ctx, owner, actionState.fields);
    const next: WorkspaceProjectActionState = { ...actionState, state: "completed", missingFields: [], projectId: created.projectId };
    await emitStage("action_done", { status: "completed", details: { action: "create_project_draft", projectId: created.projectId } });
    return { actionState: next, assistantText: `${assistantText}\n\nتم إنشاء المشروع كمسودة بنجاح. رقم المشروع: ${created.projectId}.` };
  } catch (error) {
    const next: WorkspaceProjectActionState = { ...actionState, state: "failed", error: error instanceof Error ? error.message : "تعذر إنشاء المشروع حالياً." };
    await emitStage("action_done", { status: "failed", details: { action: "create_project_draft", error: error instanceof Error ? error.message : "PROJECT_CREATE_FAILED" } });
    return { actionState: next, assistantText: `${assistantText}\n\nتعذر إنشاء المشروع حالياً. راجع البيانات وأرسل التحديث المطلوب.` };
  }
}
