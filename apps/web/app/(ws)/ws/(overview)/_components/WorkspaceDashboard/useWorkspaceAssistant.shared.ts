"use client";

import type {
  AnanProStreamStageEvent,
  AnanProThread,
} from "@/server/contracts/ananPro";
import type { AIMotionState } from "@/app/(ws)/ws/_components/AIMotion";

function applyNewThreadSearchParam(url: URL, newThread: boolean | undefined) {
  if (newThread === true) {
    url.searchParams.set("newThread", "1");
    return;
  }
  if (newThread === false) {
    url.searchParams.delete("newThread");
  }
}

export function updateThreadUrl(threadId: string | null, options?: { newThread?: boolean }) {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  if (threadId) {
    url.searchParams.set("threadId", threadId);
    url.searchParams.delete("newThread");
  } else {
    url.searchParams.delete("threadId");
    applyNewThreadSearchParam(url, options?.newThread);
  }

  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

export function notifyAssistantThreadsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("workspace-assistant-threads:changed"));
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

export function getAssistantMotionState(
  isPending: boolean,
  streamStage: AnanProStreamStageEvent | null,
): AIMotionState {
  if (!isPending || !streamStage) return "idle";
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

export function getAssistantStageLabel(
  isPending: boolean,
  streamStage: AnanProStreamStageEvent | null,
  streamLifecycleStatus: "running" | "completed" | "failed" | "cancelled" | null,
) {
  if (streamLifecycleStatus === "cancelled") {
    return "تم إيقاف التوليد.";
  }
  if (!isPending || !streamStage) return "anan workspace يجهز الخطوة التالية...";
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

export function normalizeAssistantTeamLabel(teamId: string) {
  return teamId.replace("team_workspace_", "").replaceAll("_", " ");
}
