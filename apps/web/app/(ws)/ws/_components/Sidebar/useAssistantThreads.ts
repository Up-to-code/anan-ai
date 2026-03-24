"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import type { AnanProThreadSummary } from "@/server/contracts/ananPro";

type UseAssistantThreadsArgs = {
  serverThreads: AnanProThreadSummary[];
  limit: number;
};

const assistantApi = api.ai_zone.assistantWorkspace;

export function useAssistantThreads({ serverThreads, limit }: UseAssistantThreadsArgs) {
  const liveThreads = useQuery(assistantApi.listThreads, { limit });
  const threads = useMemo<AnanProThreadSummary[]>(
    () =>
      (liveThreads ?? serverThreads).map((thread) => ({
        id: String("_id" in thread ? thread._id : thread.id),
        title: ("title" in thread ? thread.title : null) ?? null,
        updatedAt: thread.updatedAt,
      })),
    [liveThreads, serverThreads],
  );

  return { threads };
}
