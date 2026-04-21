"use server";

import { redirect } from "next/navigation";
import { runProjectMigrationAction } from "@/admin_zone/api/projects";

export async function submitProjectMigrationAction(formData: FormData) {
  const action = String(formData.get("action") ?? "preflight") as "preflight" | "migrate" | "postflight";
  const limit = Number(formData.get("limit") ?? 200);
  await runProjectMigrationAction(action, Number.isFinite(limit) ? limit : 200);
  redirect("/projects?filter=incomplete");
}
