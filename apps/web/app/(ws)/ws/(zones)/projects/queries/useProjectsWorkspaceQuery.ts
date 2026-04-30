"use client";

import { useMemo } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import type { WorkspaceAudience } from "@/server/contracts/workspace";
import { mapPropertyToWorkspaceProjectDetail } from "../shared/lib/projectViewModel";
import type { WorkspaceProject } from "../types/projectTypes";
import { getProjectQueryApi } from "./projectQueryApi";

type RawWorkspacePayload = {
  page: Array<{
    property: unknown;
    dossier?: unknown;
    units?: unknown[];
    paymentPlans?: unknown[];
    documents?: unknown[];
    adLicenses?: unknown[];
    brokerAuthorizations?: unknown[];
    events?: unknown[];
    readiness?: unknown;
  }>;
};

export function useProjectsWorkspaceQuery({
  audience,
  initialProjects,
}: {
  audience: WorkspaceAudience;
  initialProjects: WorkspaceProject[];
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const projectApi = getProjectQueryApi(audience);
  const livePayload = useQuery(
    projectApi.getProjectsWorkspace as never,
    !isLoading && isAuthenticated ? {} : "skip",
  ) as RawWorkspacePayload | undefined;

  const projects = useMemo(() => {
    if (!livePayload) return initialProjects;
    return livePayload.page.map((detail) =>
      mapPropertyToWorkspaceProjectDetail(detail.property as never, "owner", { dossier: detail as never }),
    );
  }, [initialProjects, livePayload]);

  return {
    projects,
    isLoading: isLoading && initialProjects.length === 0,
    error: null,
  };
}
