import { defineTable } from "convex/server";
import { v } from "convex/values";
import { transitionalGlobalSecurityFields } from "./securityFields";

const contactTables = {
  contactInquiries: defineTable({
    ...transitionalGlobalSecurityFields,
    name: v.string(),
    email: v.string(),
    message: v.string(),
    sourceIp: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("createdAt", ["createdAt"])
    .index("email", ["email"])
    .index("by_email_createdAt", ["email", "createdAt"]),
};

export default contactTables;
