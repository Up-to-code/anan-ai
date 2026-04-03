import { redirect } from "next/navigation";
import { getWorkspaceEntryUrl } from "@/lib/site";

export default function WorkspacePage() {
  redirect(getWorkspaceEntryUrl());
}
