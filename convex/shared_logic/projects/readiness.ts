import type { GenericId } from "convex/values";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { recordProjectReadinessEvent } from "./events";

export type ProjectReadinessStatus =
  | "draft"
  | "incomplete"
  | "data_complete"
  | "compliance_pending"
  | "approved"
  | "blocked"
  | "published_ready";

export type ProjectReadinessBlocker = {
  code: string;
  label: string;
  severity: "critical" | "high" | "medium" | "low";
  area: "identity" | "location" | "compliance" | "units" | "payment" | "authorization" | "publication";
  nextAction: string;
};

export type ProjectReadinessResult = {
  status: ProjectReadinessStatus;
  canPublish: boolean;
  canDistributeToAi: boolean;
  canCreateOpenOffer: boolean;
  blockers: ProjectReadinessBlocker[];
  warnings: ProjectReadinessBlocker[];
  completedRequirements: string[];
};

type DossierRecord = {
  _id: GenericId<"projectDossiers">;
  propertyId: GenericId<"properties">;
  inventoryKind?: "project" | "standalone_unit";
  requestedVisibility: "private" | "public";
  ownerType: "broker" | "RED";
  salesMode: "developer_direct" | "broker_mediated" | "broker_owned";
  projectType: "ready_property" | "off_plan" | "land" | "mixed_use";
  location?: { countryCode?: string; city?: string; district?: string };
  readinessStatus?: ProjectReadinessStatus;
  adminBlockedReason?: string;
  deletedAt?: number;
};

type PropertyRecord = {
  _id: GenericId<"properties">;
  publicationState?: "draft" | "published" | "archived";
  adLicenseStatus?: "pending" | "approved" | "rejected";
  ownerVerified?: boolean;
  listingVerified?: boolean;
  projectDossierId?: GenericId<"projectDossiers">;
};

function blocker(args: ProjectReadinessBlocker): ProjectReadinessBlocker {
  return args;
}

function activeRows<T extends { deletedAt?: number }>(rows: T[]) {
  return rows.filter((row) => typeof row.deletedAt !== "number");
}

export async function getProjectDossierByPropertyId(
  ctx: QueryCtx | MutationCtx,
  propertyId: GenericId<"properties">,
): Promise<DossierRecord | null> {
  return (await ctx.db
    .query("projectDossiers")
    .withIndex("propertyId", (q: any) => q.eq("propertyId", propertyId))
    .first()) as DossierRecord | null;
}

async function collectReadinessInputs(ctx: QueryCtx | MutationCtx, dossier: DossierRecord) {
  const [units, paymentPlans, documents, adLicenses, brokerAuthorizations] = await Promise.all([
    ctx.db
      .query("projectUnits")
      .withIndex("dossierId", (q: any) => q.eq("dossierId", dossier._id))
      .collect(),
    ctx.db
      .query("projectPaymentPlans")
      .withIndex("dossierId", (q: any) => q.eq("dossierId", dossier._id))
      .collect(),
    ctx.db
      .query("projectComplianceDocuments")
      .withIndex("dossierId", (q: any) => q.eq("dossierId", dossier._id))
      .collect(),
    ctx.db
      .query("projectAdLicenses")
      .withIndex("dossierId", (q: any) => q.eq("dossierId", dossier._id))
      .collect(),
    ctx.db
      .query("projectBrokerAuthorizations")
      .withIndex("dossierId", (q: any) => q.eq("dossierId", dossier._id))
      .collect(),
  ]);
  return {
    units: activeRows(units as any[]),
    paymentPlans: activeRows(paymentPlans as any[]),
    documents: activeRows(documents as any[]),
    adLicenses: activeRows(adLicenses as any[]),
    brokerAuthorizations: activeRows(brokerAuthorizations as any[]),
  };
}

function hasApprovedDocument(documents: any[], documentType: string) {
  return documents.some((document) => document.documentType === documentType && document.status === "approved");
}

function isVerifiedPermit(license: any, now: number) {
  const verified = license.status === "approved" || license.verificationStatus === "verified";
  const notExpired = typeof license.expiresAt !== "number" || license.expiresAt > now;
  return verified && notExpired;
}

function resolvePermitBlockerLabel(countryCode?: string) {
  if (countryCode === "AE") return "Approved UAE advertising permit or QR evidence is required";
  if (countryCode === "BH") return "Bahrain RERA advertising compliance evidence is required";
  if (countryCode === "QA") return "Qatar licensed broker or advertising evidence is required";
  return "Approved real-estate advertisement license is required";
}

function resolveReadinessStatus(
  dossier: DossierRecord,
  blockers: ProjectReadinessBlocker[],
): ProjectReadinessStatus {
  if (blockers.length === 0) {
    return dossier.requestedVisibility === "public" ? "published_ready" : "approved";
  }
  if (blockers.some((item) => item.severity === "critical")) {
    return dossier.requestedVisibility === "public" ? "blocked" : "incomplete";
  }
  return "compliance_pending";
}

/**
 * WHY:   Saudi project publishing needs one shared eligibility decision across workspace, search, AI, and offers.
 * WHAT:  Computes whether the linked dossier is complete enough for public distribution.
 * HOW:   Checks owner verification, ad license, structured location, units, payment plan, broker authorization, and WAFI documents.
 */
export async function computeProjectReadiness(
  ctx: QueryCtx | MutationCtx,
  property: PropertyRecord,
  dossier: DossierRecord | null,
): Promise<ProjectReadinessResult> {
  if (!dossier) {
    const blockers = [
      blocker({
        code: "PROJECT_DOSSIER_REQUIRED",
        label: "Saudi project dossier is missing",
        severity: "critical",
        area: "identity",
        nextAction: "Create or migrate the project dossier before publishing.",
      }),
    ];
    return {
      status: "blocked",
      canPublish: false,
      canDistributeToAi: false,
      canCreateOpenOffer: false,
      blockers,
      warnings: [],
      completedRequirements: [],
    };
  }

  const { units, paymentPlans, documents, adLicenses, brokerAuthorizations } =
    await collectReadinessInputs(ctx, dossier);
  const now = Date.now();
  const countryCode = dossier.location?.countryCode ?? "SA";
  const blockers: ProjectReadinessBlocker[] = [];
  const warnings: ProjectReadinessBlocker[] = [];
  const completedRequirements: string[] = [];

  if (dossier.adminBlockedReason) {
    blockers.push(blocker({
      code: "ADMIN_BLOCKED",
      label: "Project is blocked by admin review",
      severity: "critical",
      area: "publication",
      nextAction: dossier.adminBlockedReason,
    }));
  }

  if (property.ownerVerified === true) {
    completedRequirements.push("owner_verified");
  } else {
    blockers.push(blocker({
      code: "OWNER_VERIFICATION_REQUIRED",
      label: "Organization verification is required",
      severity: "critical",
      area: "identity",
      nextAction: "Approve organization verification before public distribution.",
    }));
  }

  if (dossier.location?.city && dossier.location?.district) {
    completedRequirements.push("structured_location");
  } else {
    blockers.push(blocker({
      code: "STRUCTURED_LOCATION_REQUIRED",
      label: "Structured Saudi city and district are required",
      severity: "high",
      area: "location",
      nextAction: "Add city and district to the project dossier.",
    }));
  }

  const approvedAdLicense =
    property.adLicenseStatus === "approved" ||
    adLicenses.some((license) => isVerifiedPermit(license, now));
  if (approvedAdLicense) {
    completedRequirements.push(countryCode === "SA" ? "ad_license_approved" : "gcc_ad_permit_verified");
  } else {
    blockers.push(blocker({
      code: "AD_LICENSE_REQUIRED",
      label: resolvePermitBlockerLabel(countryCode),
      severity: "critical",
      area: "compliance",
      nextAction: "Submit and approve the jurisdiction-specific advertising permit before distribution.",
    }));
  }

  if (units.some((unit) => unit.status === "available")) {
    completedRequirements.push("sellable_unit_available");
  } else {
    blockers.push(blocker({
      code: "SELLABLE_UNIT_REQUIRED",
      label: "At least one available unit is required",
      severity: "critical",
      area: "units",
      nextAction: "Add available unit inventory before distribution.",
    }));
  }

  if (paymentPlans.some((plan) => plan.status === "active" && (plan.startingPrice || plan.cashPrice))) {
    completedRequirements.push("payment_plan_active");
  } else {
    blockers.push(blocker({
      code: "PAYMENT_PLAN_REQUIRED",
      label: "Active payment plan is required",
      severity: "critical",
      area: "payment",
      nextAction: "Add a payment plan with starting price or cash price.",
    }));
  }

  if (dossier.salesMode === "developer_direct") {
    completedRequirements.push("broker_authorization_not_required");
  } else if (brokerAuthorizations.some((authorization) => authorization.status === "active")) {
    completedRequirements.push("broker_authorization_active");
  } else {
    blockers.push(blocker({
      code: "BROKER_AUTHORIZATION_REQUIRED",
      label: "Active broker authorization is required",
      severity: "critical",
      area: "authorization",
      nextAction: "Attach a brokerage contract or authorization scope.",
    }));
  }

  if (dossier.projectType === "off_plan") {
    if (hasApprovedDocument(documents, "wafi_license")) {
      completedRequirements.push("wafi_license_approved");
    } else {
      blockers.push(blocker({
        code: "WAFI_LICENSE_REQUIRED",
        label: "Approved WAFI/off-plan license evidence is required",
        severity: "critical",
        area: "compliance",
        nextAction: "Attach and approve WAFI license evidence.",
      }));
    }
    if (hasApprovedDocument(documents, "escrow_or_cpa")) {
      completedRequirements.push("escrow_evidence_approved");
    } else {
      blockers.push(blocker({
        code: "ESCROW_EVIDENCE_REQUIRED",
        label: "Escrow or CPA evidence is required for off-plan projects",
        severity: "high",
        area: "payment",
        nextAction: "Attach escrow or CPA evidence for review.",
      }));
    }
  }

  if (documents.length === 0) {
    warnings.push(blocker({
      code: "DOCUMENT_EVIDENCE_RECOMMENDED",
      label: "Typed compliance documents are recommended",
      severity: "medium",
      area: "compliance",
      nextAction: "Attach typed evidence documents for admin review.",
    }));
  }

  const status = resolveReadinessStatus(dossier, blockers);
  const canPublish = status === "published_ready";
  return {
    status,
    canPublish,
    canDistributeToAi: canPublish,
    canCreateOpenOffer: canPublish,
    blockers,
    warnings,
    completedRequirements,
  };
}

/**
 * WHY:   Mutations that affect project truth need to mirror readiness into both dossier and property projection rows.
 * WHAT:  Recomputes readiness for one property and updates distribution flags.
 * HOW:   Loads the linked dossier, computes readiness, and applies the strict public-search projection.
 */
export async function recomputeProjectReadinessForProperty(
  ctx: MutationCtx,
  propertyId: GenericId<"properties">,
): Promise<ProjectReadinessResult> {
  const property = (await ctx.db.get(propertyId)) as PropertyRecord | null;
  if (!property) {
    throw new Error("PROPERTY_NOT_FOUND");
  }
  const dossier =
    property.projectDossierId
      ? ((await ctx.db.get(property.projectDossierId as any)) as DossierRecord | null)
      : await getProjectDossierByPropertyId(ctx, propertyId);
  const result = await computeProjectReadiness(ctx, property, dossier);
  const now = Date.now();

  if (dossier) {
    const previousStatus = dossier.readinessStatus;
    await ctx.db.patch(dossier._id, {
      readinessStatus: result.status,
      readinessBlockers: result.blockers,
      readinessWarnings: result.warnings,
      completedRequirements: result.completedRequirements,
      lastReadinessComputedAt: now,
      updatedAt: now,
    } as any);
    if (previousStatus !== result.status) {
      await recordProjectReadinessEvent(ctx, {
        dossierId: dossier._id,
        propertyId,
        eventType: "readiness_changed",
        previousStatus,
        nextStatus: result.status,
        message: "Project readiness was recomputed.",
        metadata: {
          blockers: result.blockers.map((item) => item.code),
          canPublish: result.canPublish,
        },
      });
    }
  }

  await ctx.db.patch(propertyId, {
    projectDossierId: dossier?._id,
    projectReadinessStatus: result.status,
    listingVerified:
      property.adLicenseStatus === "approved" ||
      result.completedRequirements.includes("gcc_ad_permit_verified"),
    isPublicSearchable:
      property.publicationState === "published" &&
      result.status === "published_ready" &&
      property.ownerVerified === true &&
      (property.adLicenseStatus === "approved" || result.completedRequirements.includes("gcc_ad_permit_verified")),
    updatedAt: now,
  } as any);
  return result;
}

/**
 * WHY:   Distribution readers need a cheap strict check after loading a property projection.
 * WHAT:  Returns true only for published properties with approved readiness.
 * HOW:   Uses denormalized projection fields and falls back to false for unmigrated rows.
 */
export function isPropertyDistributionReady(property: {
  publicationState?: string;
  isPublicSearchable?: boolean;
  projectReadinessStatus?: string;
  projectDossierId?: unknown;
}) {
  const isLegacyPublishedProjection =
    property.publicationState === "published" &&
    property.projectDossierId === undefined &&
    property.projectReadinessStatus === undefined &&
    property.isPublicSearchable !== false;
  return (
    isLegacyPublishedProjection ||
    (
      property.publicationState === "published" &&
      property.isPublicSearchable === true &&
      property.projectReadinessStatus === "published_ready"
    )
  );
}
