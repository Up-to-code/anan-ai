"use client";

import { apiUnsafe } from "@/lib/convexApi";
import type { WorkspaceAudience } from "@/server/contracts/workspace";

export function getProjectQueryApi(audience: WorkspaceAudience) {
  return audience === "developer"
    ? (apiUnsafe["red_zone/projects"] as {
        getProjectsWorkspace: unknown;
        getProjectWorkspaceDetail: unknown;
      })
    : (apiUnsafe["broker_zone/projects"] as {
        getProjectsWorkspace: unknown;
        getProjectWorkspaceDetail: unknown;
      });
}
