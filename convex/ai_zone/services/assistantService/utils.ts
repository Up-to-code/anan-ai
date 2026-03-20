import type { AssistantKind, AssistantOwner } from "./types";

export function normalizeOwner(
  ownerOrUser: string | AssistantOwner
): AssistantOwner {
  if (typeof ownerOrUser === "string") {
    return { userId: ownerOrUser, ownerType: "user" };
  }
  return ownerOrUser;
}

export function isWorkspaceKind(kind?: AssistantKind): boolean {
  return kind === "anan_workspace" || kind === "anan_pro";
}

