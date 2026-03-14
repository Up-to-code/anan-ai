"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AnanProThreadSummary } from "@/server/contracts/ananPro";

/**
 * WHY:   The sidebar should stay responsive without forcing a background fetch on every mount/navigation.
 * WHAT:  Maintains an assistant thread list with server snapshot fallback and event-driven refresh.
 * HOW:   Uses the server-provided threads as initial state, refreshes on the `workspace-assistant-threads:changed` event,
 *        and guards network work with AbortController + visibility checks.
 */
export function useAssistantThreads({
  serverThreads,
  limit,
}: {
  serverThreads: AnanProThreadSummary[];
  limit: number;
}) {
  const [threads, setThreads] = useState<AnanProThreadSummary[]>(serverThreads);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setThreads(serverThreads);
  }, [serverThreads]);

  const refresh = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (document.visibilityState !== "visible") return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(
        `/api/workspace/anan-pro?list=threads&limit=${encodeURIComponent(String(limit))}`,
        { signal: controller.signal },
      );

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as AnanProThreadSummary[];
      setThreads(payload);
    } catch {
      // Keep the server-rendered snapshot when refresh fails or is aborted.
    }
  }, [limit]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleThreadsChanged = () => {
      void refresh();
    };

    window.addEventListener("workspace-assistant-threads:changed", handleThreadsChanged);

    // Only perform an initial refresh if the server snapshot is empty (avoid extra work on every mount).
    if (serverThreads.length === 0) {
      const run = () => void refresh();
      const requestIdleCallback = (globalThis as any).requestIdleCallback as
        | ((cb: () => void, options?: { timeout?: number }) => number)
        | undefined;

      if (requestIdleCallback) {
        requestIdleCallback(run, { timeout: 1200 });
      } else {
        setTimeout(run, 600);
      }
    }

    return () => {
      abortRef.current?.abort();
      window.removeEventListener("workspace-assistant-threads:changed", handleThreadsChanged);
    };
  }, [refresh, serverThreads.length]);

  return { threads, refresh };
}
