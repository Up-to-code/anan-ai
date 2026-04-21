import type { GenericId } from "convex/values";
import type { MutationCtx } from "../../_generated/server";
import type { ProjectReadinessStatus } from "./readiness";

export type ProjectReadinessEventType =
  | "dossier_created"
  | "dossier_saved"
  | "dossier_migrated"
  | "readiness_changed"
  | "publish_requested"
  | "publish_blocked"
  | "publish_approved"
  | "distribution_eligibility_changed"
  | "document_reviewed"
  | "ad_license_reviewed"
  | "admin_blocked"
  | "admin_unblocked"
  | "migration_preflight"
  | "migration_postflight";

/**
 * WHY:   Saudi market readiness decisions need an auditable history for founders, admins, and legal review.
 * WHAT:  Persists one compact project readiness event.
 * HOW:   Stores actor, status transition, and JSON metadata in the project audit table.
 */
export async function recordProjectReadinessEvent(
  ctx: MutationCtx,
  args: {
    dossierId?: GenericId<"projectDossiers">;
    propertyId?: GenericId<"properties">;
    actorAuthUserId?: string;
    actorRole?: string;
    eventType: ProjectReadinessEventType;
    previousStatus?: ProjectReadinessStatus;
    nextStatus?: ProjectReadinessStatus;
    message?: string;
    metadata?: unknown;
  },
) {
  await ctx.db.insert("projectReadinessEvents", {
    ...args,
    createdAt: Date.now(),
  } as any);
}
