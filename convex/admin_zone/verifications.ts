import { mutation, query } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { requireRole } from "../_core/security/accessPolicy";

/**
 * WHY:   The redesigned admin console needs a real verification queue with review status filters.
 * WHAT:  Returns verification requests filtered by review state.
 * HOW:   Reads the dedicated verification table and sorts newest-first by submission time.
 */
export const listVerificationRequests = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("new"),
        v.literal("in_review"),
        v.literal("approved"),
        v.literal("rejected"),
      ),
    ),
  },
  handler: async (ctx, { status }) => {
    await requireRole(ctx, ["admin"]);

    const [requests, profiles, brokers, developers, properties] = await Promise.all([
      status
      ? await ctx.db
          .query("verificationRequests")
          .withIndex("currentStatus", (query) => query.eq("currentStatus", status))
          .collect()
      : await ctx.db.query("verificationRequests").collect(),
      ctx.db.query("userProfiles").collect(),
      ctx.db.query("brokers").collect(),
      ctx.db.query("RED").collect(),
      ctx.db.query("properties").collect(),
    ]);

    return requests
      .map((request) => {
        const profile = request.subjectProfileId ? profiles.find((item) => item._id === request.subjectProfileId) : null;
        const broker = request.subjectBrokerId ? brokers.find((item) => item._id === request.subjectBrokerId) : null;
        const developer = request.subjectREDId ? developers.find((item) => item._id === request.subjectREDId) : null;
        const property = request.subjectPropertyId ? properties.find((item) => item._id === request.subjectPropertyId) : null;
        const propertyOwner =
          property?.brokerId
            ? brokers.find((item) => item._id === property.brokerId)
            : property?.REDId
              ? developers.find((item) => item._id === property.REDId)
              : null;

        return {
          ...request,
          subjectName:
            profile?.name ??
            profile?.email ??
            broker?.name ??
            developer?.name ??
            property?.title ??
            request.title ??
            request.requestType,
          organizationName: broker?.name ?? developer?.name ?? propertyOwner?.name ?? null,
          documentsCount: request.attachedDocuments.length,
        };
      })
      .sort((left, right) => right.submittedAt - left.submittedAt);
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
    const [request, profiles, brokers, developers, properties] = await Promise.all([
      ctx.db.get(id),
      ctx.db.query("userProfiles").collect(),
      ctx.db.query("brokers").collect(),
      ctx.db.query("RED").collect(),
      ctx.db.query("properties").collect(),
    ]);

    if (!request) {
      return null;
    }

    const profile = request.subjectProfileId ? profiles.find((item) => item._id === request.subjectProfileId) : null;
    const broker = request.subjectBrokerId ? brokers.find((item) => item._id === request.subjectBrokerId) : null;
    const developer = request.subjectREDId ? developers.find((item) => item._id === request.subjectREDId) : null;
    const property = request.subjectPropertyId ? properties.find((item) => item._id === request.subjectPropertyId) : null;

    return {
      ...request,
      subject: {
        profile: profile
          ? {
              id: String(profile._id),
              name: profile.name ?? profile.email ?? "مستخدم عنان",
              email: profile.email ?? null,
              role: profile.role ?? null,
              roleStatus: profile.roleStatus ?? null,
            }
          : null,
        broker: broker
          ? {
              id: String(broker._id),
              name: broker.name,
              status: broker.status ?? null,
              isVerified: broker.isVerified === true,
            }
          : null,
        developer: developer
          ? {
              id: String(developer._id),
              name: developer.name,
              status: developer.status ?? null,
              isVerified: developer.isVerified === true,
            }
          : null,
        property: property
          ? {
              id: String(property._id),
              title: property.title,
              address: property.address,
              adLicenseNumber: property.adLicenseNumber ?? null,
              adLicenseStatus: property.adLicenseStatus ?? null,
            }
          : null,
      },
      documentsCount: request.attachedDocuments.length,
      decisionHistory: [
        {
          id: `${String(request._id)}-submitted`,
          label: "تم الإرسال",
          createdAt: request.submittedAt,
          notes: null,
          status: "new",
        },
        ...(request.reviewedAt
          ? [
              {
                id: `${String(request._id)}-reviewed`,
                label: "تمت المراجعة",
                createdAt: request.reviewedAt,
                notes: request.reviewerNotes ?? null,
                status: request.currentStatus,
              },
            ]
          : []),
      ],
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
    const requests = await ctx.db.query("verificationRequests").collect();

    return {
      new: requests.filter((request) => request.currentStatus === "new").length,
      inReview: requests.filter((request) => request.currentStatus === "in_review").length,
      approved: requests.filter((request) => request.currentStatus === "approved").length,
      rejected: requests.filter((request) => request.currentStatus === "rejected").length,
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

    if (request.requestType === "user" && request.subjectProfileId) {
      const profile = await ctx.db.get(request.subjectProfileId);
      if (profile) {
        const patch: Record<string, unknown> = {
          roleStatus: status === "approved" ? "approved" : status === "rejected" ? "rejected" : "pending",
          updatedAt: now,
        };
        if (status === "approved" && profile.requestedRole) {
          patch.role = profile.requestedRole;
        }
        await ctx.db.patch(profile._id, patch);
      }
    }

    if (request.requestType === "broker" && request.subjectBrokerId) {
      const broker = await ctx.db.get(request.subjectBrokerId);
      if (broker) {
        await ctx.db.patch(broker._id, {
          isVerified: status === "approved",
          status: status === "approved" ? "active" : broker.status,
        });
      }
    }

    if (request.requestType === "RED" && request.subjectREDId) {
      const developer = await ctx.db.get(request.subjectREDId);
      if (developer) {
        await ctx.db.patch(developer._id, {
          isVerified: status === "approved",
          status: status === "approved" ? "active" : developer.status,
        });
      }
    }

    if (request.requestType === "property" && request.subjectPropertyId) {
      const property = await ctx.db.get(request.subjectPropertyId);
      if (property) {
        const nextStatus = status === "approved" ? "approved" : status === "rejected" ? "rejected" : "pending";
        const submittedLicense = (request.submittedData as { adLicenseNumber?: string } | null)?.adLicenseNumber;
        await ctx.db.patch(property._id, {
          adLicenseStatus: nextStatus,
          adLicenseNumber: submittedLicense ?? property.adLicenseNumber,
          adLicenseVerificationRequestId: request._id,
        });
      }
    }
  },
});
