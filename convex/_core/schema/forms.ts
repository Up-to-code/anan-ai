import { defineTable } from "convex/server";
import { v } from "convex/values";
import { transitionalGlobalSecurityFields } from "./securityFields";

/**
 * WHY:   The system needs a generic way to ingest and store form submissions from public marketing and frontend pages without creating a new table per form.
 * WHAT:  Defines `formSubmissions` table to store arbitrary JSON `data` tagged by `formName`.
 * HOW:   Uses `v.any()` or `v.string()` for payload flexibility, with explicit metadata columns.
 */
const formsTables = {
  formSubmissions: defineTable({
    ...transitionalGlobalSecurityFields,
    formName: v.string(), // identifier like 'early-access', 'contact', 'feedback'
    data: v.string(), // JSON string representing the form fields
    status: v.optional(v.union(v.literal("new"), v.literal("reviewed"), v.literal("archived"))),
    sourceIp: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("formName", ["formName"])
    .index("createdAt", ["createdAt"])
    .index("formName_createdAt", ["formName", "createdAt"])
    .index("by_form_status_createdAt", ["formName", "status", "createdAt"]),
};

export default formsTables;
