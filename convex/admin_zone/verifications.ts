import { mutation, query } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { requireRole } from "../_core/security/accessPolicy";
type VerificationStatus = "new" | "in_review" | "approved" | "rejected" | "closed";
type ReviewStatus = "in_review" | "approved" | "rejected" | "closed";
type VerificationRequest = Record<string, any>;
type VerificationLookups = {
  profiles: Array<Record<string, any>>;
  brokers: Array<Record<string, any>>;
  developers: Array<Record<string, any>>;
  properties: Array<Record<string, any>>;
};

async function listVerificationRequestsByStatus(
  ctx: any,
  status?: "new" | "in_review" | "approved" | "rejected" | "closed",
) {
  if (status) {
    return ctx.db
      .query("verificationRequests")
      .withIndex("currentStatus", (query: any) => query.eq("currentStatus", status))
      .collect();
  }
  return ctx.db.query("verificationRequests").order("desc").take(500);
}

async function loadVerificationLookups(ctx: any): Promise<VerificationLookups> {
  const [profiles, brokers, developers, properties] = await Promise.all([
    ctx.db.query("userProfiles").order("desc").take(500),
    ctx.db.query("brokers").order("desc").take(500),
    ctx.db.query("RED").order("desc").take(500),
    ctx.db.query("properties").order("desc").take(500),
  ]);
  return { profiles, brokers, developers, properties };
}

function findVerificationEntities(request: VerificationRequest, lookups: VerificationLookups) {
  const profile = request.subjectProfileId
    ? lookups.profiles.find((item) => item._id === request.subjectProfileId)
    : null;
  const broker = request.subjectBrokerId
    ? lookups.brokers.find((item) => item._id === request.subjectBrokerId)
    : null;
  const developer = request.subjectREDId
    ? lookups.developers.find((item) => item._id === request.subjectREDId)
    : null;
  const property = request.subjectPropertyId
    ? lookups.properties.find((item) => item._id === request.subjectPropertyId)
    : null;
  return { profile, broker, developer, property };
}

function resolvePropertyOwner(
  property: Record<string, any> | null | undefined,
  brokers: Array<Record<string, any>>,
  developers: Array<Record<string, any>>,
) {
  if (!property) return null;
  if (property.brokerId) {
    return brokers.find((item) => item._id === property.brokerId) ?? null;
  }
  if (property.REDId) {
    return developers.find((item) => item._id === property.REDId) ?? null;
  }
  return null;
}

function buildVerificationSubjectDetail(request: VerificationRequest, lookups: VerificationLookups) {
  const entities = findVerificationEntities(request, lookups);
  return {
    profile: entities.profile
      ? {
          id: String(entities.profile._id),
          name: entities.profile.name ?? entities.profile.email ?? "مستخدم عنان",
          email: entities.profile.email ?? null,
          role: entities.profile.role ?? null,
          roleStatus: entities.profile.roleStatus ?? null,
        }
      : null,
    broker: entities.broker
      ? {
          id: String(entities.broker._id),
          name: entities.broker.name,
          status: entities.broker.status ?? null,
          isVerified: entities.broker.isVerified === true,
        }
      : null,
    developer: entities.developer
      ? {
          id: String(entities.developer._id),
          name: entities.developer.name,
          status: entities.developer.status ?? null,
          isVerified: entities.developer.isVerified === true,
        }
      : null,
    property: entities.property
      ? {
          id: String(entities.property._id),
          title: entities.property.title,
          address: entities.property.address,
          adLicenseNumber: entities.property.adLicenseNumber ?? null,
          adLicenseStatus: entities.property.adLicenseStatus ?? null,
        }
      : null,
  };
}

function buildVerificationDecisionHistory(request: VerificationRequest) {
  const submittedItem = {
    id: `${String(request._id)}-submitted`,
    label: "تم الإرسال",
    createdAt: request.submittedAt,
    notes: null,
    status: "new",
  };
  if (!request.reviewedAt) {
    return [submittedItem];
  }
  return [
    submittedItem,
    {
      id: `${String(request._id)}-reviewed`,
      label: request.currentStatus === "closed" ? "تم الإغلاق" : "تمت المراجعة",
      createdAt: request.reviewedAt,
      notes: request.reviewerNotes ?? null,
      status: request.currentStatus,
    },
  ];
}

async function syncUserVerification(ctx: any, request: VerificationRequest, status: ReviewStatus, now: number) {
  if (request.requestType !== "user" || !request.subjectProfileId) return;
  const profile = await ctx.db.get(request.subjectProfileId);
  if (!profile) return;
  const patch: Record<string, unknown> = {
    roleStatus: status === "approved" ? "approved" : status === "rejected" ? "rejected" : "pending",
    updatedAt: now,
  };
  if (status === "approved" && profile.requestedRole) {
    patch.role = profile.requestedRole;
  }
  await ctx.db.patch(profile._id, patch);
}

async function syncBrokerVerification(ctx: any, request: VerificationRequest, status: ReviewStatus) {
  if (request.requestType !== "broker" || !request.subjectBrokerId) return;
  const broker = await ctx.db.get(request.subjectBrokerId);
  if (!broker) return;
  await ctx.db.patch(broker._id, {
    isVerified: status === "approved",
    status: status === "approved" ? "active" : broker.status,
  });
}

async function syncDeveloperVerification(ctx: any, request: VerificationRequest, status: ReviewStatus) {
  if (request.requestType !== "RED" || !request.subjectREDId) return;
  const developer = await ctx.db.get(request.subjectREDId);
  if (!developer) return;
  await ctx.db.patch(developer._id, {
    isVerified: status === "approved",
    status: status === "approved" ? "active" : developer.status,
  });
}

async function syncPropertyVerification(ctx: any, request: VerificationRequest, status: ReviewStatus) {
  if (request.requestType !== "property" || !request.subjectPropertyId) return;
  const property = await ctx.db.get(request.subjectPropertyId);
  if (!property) return;
  const nextStatus = status === "approved" ? "approved" : status === "rejected" ? "rejected" : "pending";
  const submittedLicense = (request.submittedData as { adLicenseNumber?: string } | null)?.adLicenseNumber;
  await ctx.db.patch(property._id, {
    adLicenseStatus: nextStatus,
    adLicenseNumber: submittedLicense ?? property.adLicenseNumber,
    adLicenseVerificationRequestId: request._id,
  });
}

async function syncVerificationSideEffects(ctx: any, request: VerificationRequest, status: ReviewStatus, now: number) {
  await syncUserVerification(ctx, request, status, now);
  await syncBrokerVerification(ctx, request, status);
  await syncDeveloperVerification(ctx, request, status);
  await syncPropertyVerification(ctx, request, status);
}

export const listVerificationRequests = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("new"),
        v.literal("in_review"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("closed"),
      ),
    ),
  },
  handler: async (ctx, { status }) => {
    await requireRole(ctx, ["admin"]);
    const [requests, lookups] = await Promise.all([
      listVerificationRequestsByStatus(ctx, status as VerificationStatus | undefined),
      loadVerificationLookups(ctx),
    ]);
    return requests
      .map((request: any) => {
        const entities = findVerificationEntities(request, lookups);
        const propertyOwner = resolvePropertyOwner(
          entities.property,
          lookups.brokers,
          lookups.developers,
        );

        return {
          ...request,
          subjectName:
            entities.profile?.name ??
            entities.profile?.email ??
            entities.broker?.name ??
            entities.developer?.name ??
            entities.property?.title ??
            request.title ??
            request.requestType,
          organizationName: entities.broker?.name ?? entities.developer?.name ?? propertyOwner?.name ?? null,
          documentsCount: request.attachedDocuments.length,
        };
      })
      .sort((left: any, right: any) => right.submittedAt - left.submittedAt);
  },
});

/**
 * WHY:   Verification detail tabs need one request record with all submitted metadata and attached documents.
 * WHAT:  Returns a single verification request by id.
 * HOW:   Loads the request document directly from the new verification table.
 */
export const getVerificationRequest = query({
  args: { id: v.id("verificationRequests") },
  handler: async (ctx, { id }) => {
    await requireRole(ctx, ["admin"]);
    const [request, lookups] = await Promise.all([ctx.db.get(id), loadVerificationLookups(ctx)]);
    if (!request) return null;
    return {
      ...request,
      subject: buildVerificationSubjectDetail(request, lookups),
      documentsCount: request.attachedDocuments.length,
      decisionHistory: buildVerificationDecisionHistory(request),
    };
  },
});

/**
 * WHY:   The verification workspace also needs lightweight status counters for summary cards and top-level tabs.
 * WHAT:  Returns counts for each verification status bucket.
 * HOW:   Reads all requests once and groups them by `currentStatus`.
 */
export const verificationStatusSummary = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin"]);
    const requests = await ctx.db.query("verificationRequests").order("desc").take(500);

    return {
      new: requests.filter((request) => request.currentStatus === "new").length,
      inReview: requests.filter((request) => request.currentStatus === "in_review").length,
      approved: requests.filter((request) => request.currentStatus === "approved").length,
      rejected: requests.filter((request) => request.currentStatus === "rejected").length,
      closed: requests.filter((request) => request.currentStatus === "closed").length,
    };
  },
});

/**
 * WHY:   Admin reviewers need a single mutation to move verification requests through review and sync approval state.
 * WHAT:  Updates a verification request status and reviewer notes, then mirrors approval into the linked profile or organization.
 * HOW:   Patches the request document and applies approval/rejection effects to `userProfiles`, `brokers`, or `RED` when linked.
 */
export const reviewVerificationRequest = mutation({
  args: {
    id: v.id("verificationRequests"),
    status: v.union(
      v.literal("in_review"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("closed"),
    ),
    reviewerId: v.string(),
    reviewerNotes: v.optional(v.string()),
  },
  handler: async (ctx, { id, status, reviewerId, reviewerNotes }) => {
    await requireRole(ctx, ["admin"]);
    const request = await ctx.db.get(id);
    if (!request) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Verification request not found" });
    }
    const now = Date.now();
    await ctx.db.patch(id, {
      currentStatus: status,
      reviewerId,
      reviewerNotes,
      reviewedAt: status === "in_review" ? undefined : now,
      updatedAt: now,
    });
    await syncVerificationSideEffects(ctx, request, status, now);
  },
});
