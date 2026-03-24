"use server";

import { getWorkspacePropertyZone } from "@/server/ws/zones";
import { mapWorkspaceProjectToPropertyInput } from "../../projectViewModel";
import type { ProjectFormData } from "@/app/(ws)/ws/public";

type WorkspaceActionArgs = {
  audience: Parameters<typeof getWorkspacePropertyZone>[0];
  ownerContext: Parameters<typeof getWorkspacePropertyZone>[1];
  projectId: string;
};

export async function saveProjectAction(args: WorkspaceActionArgs, data: ProjectFormData) {
  const actionZone = getWorkspacePropertyZone(args.audience, args.ownerContext);

  await actionZone.updateProperty({
    id: args.projectId,
    patch: mapWorkspaceProjectToPropertyInput(data),
  });

  if (data.status === "active") {
    await actionZone.publishProperty({ id: args.projectId });
  }

  return { redirectTo: `/ws/projects/${args.projectId}` };
}

export async function deleteProjectAction(args: WorkspaceActionArgs) {
  await getWorkspacePropertyZone(args.audience, args.ownerContext).deleteProperty({ id: args.projectId });
  return { redirectTo: "/ws/projects" };
}
