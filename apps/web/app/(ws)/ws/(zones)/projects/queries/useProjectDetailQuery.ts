"use client";

import { useMemo } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import type { WorkspaceAudience } from "@/server/contracts/workspace";
import { mapPropertyToWorkspaceProjectDetail } from "../shared/lib/projectViewModel";
import type { WorkspaceProject } from "../types/projectTypes";
import { getProjectQueryApi } from "./projectQueryApi";

type RawProjectDetailPayload = {
  property: unknown;
  dossier?: unknown;
  units?: unknown[];
  paymentPlans?: unknown[];
  documents?: unknown[];
  adLicenses?: unknown[];
  brokerAuthorizations?: unknown[];
  events?: unknown[];
  readiness?: unknown;
};

export function useProjectDetailQuery({
  audience,
  projectId,
  initialProject,
}: {
  audience: WorkspaceAudience;
  projectId: string;
  initialProject: WorkspaceProject;
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const projectApi = getProjectQueryApi(audience);
  const liveDetail = useQuery(
    projectApi.getProjectWorkspaceDetail as never,
    (!isLoading && isAuthenticated ? { projectId } : "skip") as never,
  ) as RawProjectDetailPayload | undefined;

  const project = useMemo(() => {
    if (!liveDetail) return initialProject;
    return mapPropertyToWorkspaceProjectDetail(liveDetail.property as never, initialProject.accessMode, {
      assets: initialProject.assets,
      viewers: initialProject.visibility.viewers,
      dossier: liveDetail as never,
    });
  }, [initialProject, liveDetail]);

  return {
    project,
    isLoading: isLoading && !project,
    error: null,
  };
}
