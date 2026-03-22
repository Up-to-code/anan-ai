"use client";

import type {
  AnanProStreamStageEvent,
  AnanProThread,
} from "@/server/contracts/ananPro";
import type { AIMotionState } from "../../../_components/AIMotion";

/**
 * WHY:   Workspace assistant route changes need one consistent URL builder whether the caller uses browser history or a router wrapper.
 * WHAT:  Builds the next `/ws` href for either a concrete thread selection or the bare draft route.
 * HOW:   Preserves unrelated query params and hash fragments while normalizing `threadId` and removing legacy draft params.
 */
export function buildWorkspaceAssistantHref(args: {
  pathname: string;
  search?: string;
  hash?: string;
  threadId: string | null;
}) {
  const normalizedSearch = args.search?.startsWith("?")
    ? args.search.slice(1)
    : (args.search ?? "");
  const searchParams = new URLSearchParams(normalizedSearch);
  searchParams.delete("newThread");
  if (args.threadId) {
    searchParams.set("threadId", args.threadId);
  } else {
    searchParams.delete("threadId");
  }

  const nextSearch = searchParams.toString();
  return `${args.pathname}${nextSearch ? `?${nextSearch}` : ""}${args.hash ?? ""}`;
}

export type AssistantStreamEvent =
  | { event: "thread"; data: { threadId: string; title?: string | null } }
  | { event: "delta"; data: { text: string } }
  | {
      event: "meta";
      data: {
        type?: string;
        stage?: AnanProStreamStageEvent;
        meta?: unknown;
        lifecycle?: {
          sessionId?: string;
          status?: "running" | "completed" | "failed" | "cancelled";
          details?: unknown;
          timestamp?: number;
        };
      };
    }
  | { event: "done"; data: { thread: AnanProThread } }
  | { event: "error"; data: { message?: string; code?: string; status?: number } };

/**
 * WHY:   Workspace assistant streaming arrives as raw SSE text that needs one tolerant parser before state updates can happen.
 * WHAT:  Converts one SSE chunk into a typed assistant stream event, or `null` when the payload is incomplete/invalid.
 * HOW:   Reads the `event:` and `data:` lines, JSON-decodes the payload, and narrows it into the supported event union.
 */
export function parseSseChunk(rawChunk: string): AssistantStreamEvent | null {
  const lines = rawChunk
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length === 0) return null;

  const eventLine = lines.find((line) => line.startsWith("event:"));
  const dataLine = lines.find((line) => line.startsWith("data:"));
  if (!eventLine || !dataLine) return null;
  const event = eventLine.slice("event:".length).trim();
  const dataJson = dataLine.slice("data:".length).trim();
  try {
    const data = JSON.parse(dataJson) as unknown;
    if (event === "thread") return { event, data: data as { threadId: string; title?: string | null } };
    if (event === "delta") return { event, data: data as { text: string } };
    if (event === "meta") {
      return {
        event,
        data: data as {
          type?: string;
          stage?: AnanProStreamStageEvent;
          meta?: unknown;
          lifecycle?: {
            sessionId?: string;
            status?: "running" | "completed" | "failed" | "cancelled";
            details?: unknown;
            timestamp?: number;
          };
        },
      };
    }
    if (event === "done") return { event, data: data as { thread: AnanProThread } };
    if (event === "error") return { event, data: data as { message?: string } };
  } catch { return null; }
  return null;
}

/**
 * WHY:   The assistant canvas needs one visual motion state that matches the current streamed execution phase.
 * WHAT:  Maps pending stream stages to the small finite set of UI motion states used by the avatar/typing indicator.
 * HOW:   Collapses multiple backend phases into user-facing buckets like thinking, agent, tool, and syncing.
 */
export function getAssistantMotionState(
  isStreaming: boolean,
  streamStage: AnanProStreamStageEvent | null,
): AIMotionState {
  if (!isStreaming || !streamStage) return "idle";
  switch (streamStage.phase) {
    case "intent_started":
    case "intent_done":
    case "merge_started":
    case "merge_done":
      return "thinking";
    case "team_started":
    case "team_done":
      return "agent";
    case "action_started":
    case "action_done":
      return "tool";
    case "persist_started":
    case "persist_done":
      return "syncing";
    default:
      return "thinking";
  }
}

/**
 * WHY:   Operators need a short human-readable label explaining what the assistant is currently doing.
 * WHAT:  Resolves the current streamed phase into the Arabic status copy shown beside the live typing state.
 * HOW:   Special-cases cancellation first, then maps each known workspace stage to a concise label.
 */
export function getAssistantStageLabel(
  isStreaming: boolean,
  streamStage: AnanProStreamStageEvent | null,
  streamLifecycleStatus: "running" | "completed" | "failed" | "cancelled" | null,
) {
  if (streamLifecycleStatus === "cancelled") {
    return "تم إيقاف التوليد.";
  }
  if (!isStreaming || !streamStage) return "anan workspace يجهز الخطوة التالية...";
  const team = streamStage.teamId?.replace("team_workspace_", "");
  switch (streamStage.phase) {
    case "intent_started":
      return "جاري تحليل الطلب وتحديد الفريق المناسب...";
    case "intent_done":
      return team ? `تم تحديد المسارات: ${team}` : "تم تحديد مسار التنفيذ.";
    case "team_started":
      return team ? `فريق ${team} يعمل الآن...` : "الفريق يعمل الآن...";
    case "team_done":
      return streamStage.status === "failed"
        ? "انتهت مهمة فريق مع تعذر جزئي، نكمل الدمج..."
        : "تم إنهاء معالجة الفريق.";
    case "merge_started":
      return "جاري دمج نتائج الفرق...";
    case "merge_done":
      return "تم تجهيز الرد الأولي.";
    case "action_started":
      return "جاري تنفيذ الإجراء المطلوب...";
    case "action_done":
      return streamStage.status === "failed" ? "تعذر تنفيذ الإجراء." : "تم تنفيذ الإجراء.";
    case "persist_started":
      return "جاري حفظ المحادثة...";
    case "persist_done":
      return "اكتمل حفظ المحادثة.";
    default:
      return "anan workspace يجهز الخطوة التالية...";
  }
}

/**
 * WHY:   Stream stage metadata uses internal team ids that are too technical for the UI.
 * WHAT:  Converts a workspace team identifier into a compact display label.
 * HOW:   Strips the known prefix and replaces underscores with spaces.
 */
export function normalizeAssistantTeamLabel(teamId: string) {
  return teamId.replace("team_workspace_", "").replaceAll("_", " ");
}
