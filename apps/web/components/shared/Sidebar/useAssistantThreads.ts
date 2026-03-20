"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AnanProThreadSummary } from "@/server/contracts/ananPro";

type UseAssistantThreadsArgs = {
  serverThreads: AnanProThreadSummary[];
  limit: number;
};

function scheduleInitialRefresh(serverThreadsLength: number, refresh: () => Promise<void>) {
  if (serverThreadsLength > 0) return;
  const run = () => void refresh();
  const requestIdleCallback = window.requestIdleCallback;
  if (requestIdleCallback) {
    requestIdleCallback(run, { timeout: 1200 });
    return;
  }
  setTimeout(run, 600);
}

function useThreadsChangedListener(args: {
  refresh: () => Promise<void>;
  serverThreadsLength: number;
  abortRef: React.MutableRefObject<AbortController | null>;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleThreadsChanged = () => void args.refresh();
    window.addEventListener("workspace-assistant-threads:changed", handleThreadsChanged);
    scheduleInitialRefresh(args.serverThreadsLength, args.refresh);
    return () => {
      args.abortRef.current?.abort();
      window.removeEventListener("workspace-assistant-threads:changed", handleThreadsChanged);
    };
  }, [args.refresh, args.serverThreadsLength, args.abortRef]);
}

export function useAssistantThreads({ serverThreads, limit }: UseAssistantThreadsArgs) {
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
      const response = await fetch(`/api/workspace/anan-pro?list=threads&limit=${encodeURIComponent(String(limit))}`, { signal: controller.signal });
      if (!response.ok) return;
      const payload = (await response.json()) as AnanProThreadSummary[];
      setThreads(payload);
    } catch {
      // Keep the server-rendered snapshot when refresh fails or is aborted.
    }
  }, [limit]);
  useThreadsChangedListener({
    refresh,
    serverThreadsLength: serverThreads.length,
    abortRef,
  });
  return { threads, refresh };
}
