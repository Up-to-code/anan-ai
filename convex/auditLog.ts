import { AuditLog } from "convex-audit-log";
import { components } from "./_generated/api";

/**
 * WHY:   Security, compliance, and admin audits need a consistent, structured event trail.
 * WHAT:  Exposes the Convex audit log component with platform-wide PII redaction defaults.
 * HOW:   Instantiates the component client with a shared redaction list for sensitive fields.
 */
export const auditLog = new AuditLog(components.auditLog, {
  piiFields: ["email", "phone", "password", "token", "accessToken", "refreshToken"],
});
