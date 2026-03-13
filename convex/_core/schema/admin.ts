import { defineTable } from "convex/server";
import { v } from "convex/values";

const verificationDocumentValidator = v.object({
  key: v.string(),
  url: v.string(),
  name: v.string(),
  size: v.optional(v.number()),
  mime: v.optional(v.string()),
});

const adminTables = {
  verificationRequests: defineTable({
    requestType: v.union(v.literal("user"), v.literal("broker"), v.literal("RED")),
    subjectProfileId: v.optional(v.id("userProfiles")),
    subjectBrokerId: v.optional(v.id("brokers")),
    subjectREDId: v.optional(v.id("RED")),
    authUserId: v.optional(v.string()),
    externalUserId: v.optional(v.string()),
    title: v.optional(v.string()),
    currentStatus: v.union(
      v.literal("new"),
      v.literal("in_review"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
    submittedData: v.any(),
    attachedDocuments: v.array(verificationDocumentValidator),
    reviewerId: v.optional(v.string()),
    reviewerNotes: v.optional(v.string()),
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("currentStatus", ["currentStatus"])
    .index("requestType", ["requestType"])
    .index("subjectProfileId", ["subjectProfileId"])
    .index("subjectBrokerId", ["subjectBrokerId"])
    .index("subjectREDId", ["subjectREDId"])
    .index("submittedAt", ["submittedAt"]),
};

export default adminTables;
