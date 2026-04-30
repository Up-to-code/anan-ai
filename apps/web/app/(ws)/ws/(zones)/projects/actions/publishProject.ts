"use server";

import { getWorkspaceProjectZone } from "@/server/ws/zones";
import { refresh } from "next/cache";
import { requireWorkspaceData } from "../../../_lib/workspaceData";
import type { ProjectMutationActionResult } from "../pages/ProjectsPage/actionTypes";
import { toProjectActionResult } from "../shared/lib/projectActions";

export async function publishProjectAction(propertyId: string): Promise<ProjectMutationActionResult> {
  try {
    const workspace = await requireWorkspaceData(`/ws/projects/${propertyId}`);
    await getWorkspaceProjectZone(workspace.audience, workspace.ownerContext).requestProjectPublication({ propertyId });
    refresh();
    return { ok: true };
  } catch (error) {
    return toProjectActionResult(error);
  }
}
