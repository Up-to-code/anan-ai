import { defineTable } from "convex/server";
import { v } from "convex/values";

const contactTables = {
  contactInquiries: defineTable({
    name: v.string(),
    email: v.string(),
    message: v.string(),
    sourceIp: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("createdAt", ["createdAt"])
    .index("email", ["email"]),
};

export default contactTables;

