"use server";

import { getWorkspacePropertyZone } from "@/server/ws/zones";
import { requireWorkspaceData } from "../../../_lib/workspaceData";
import type { ProjectAnalyticsEventType } from "@/server/contracts/properties";
import type { ProjectMutationActionResult } from "../pages/ProjectsPage/actionTypes";
import { toProjectActionResult } from "../shared/lib/projectActions";

type TrackProjectEventActionArgs = {
  propertyId: string;
  eventType: ProjectAnalyticsEventType;
  source: string;
};

export async function trackProjectEventAction({
  propertyId,
  eventType,
  source,
}: TrackProjectEventActionArgs): Promise<ProjectMutationActionResult> {
  try {
    const workspace = await requireWorkspaceData(`/ws/projects/${propertyId}`);
    await getWorkspacePropertyZone(workspace.audience, workspace.ownerContext).recordProjectAnalyticsEvent({
      id: propertyId,
      eventType,
      source,
    });
    return { ok: true };
  } catch (error) {
    return toProjectActionResult(error);
  }
}
