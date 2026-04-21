import { type ResolvedSession, requireSessionContext } from "@/server/auth/session";
import { DomainError } from "@/server/contracts/errors";

/**
 * WHY:   Server functions need one shared place for role and owner-link enforcement.
 * WHAT:  Exposes role-specific session guards for broker, developer, and admin flows.
 * HOW:   Reuses the shared session resolver, then validates role and required owner ids.
 */

function requireRoleSession(
  session: ResolvedSession,
  options: {
    allowedRoles: string[];
    requiredOwnerKey?: "brokerId" | "redId";
    message: string;
  },
): ResolvedSession {
  const hasRole = options.allowedRoles.includes(session.context.role ?? "");
  const hasOwnerId =
    !options.requiredOwnerKey || Boolean(session.context[options.requiredOwnerKey]);

  if (!hasRole || !hasOwnerId) {
    throw new DomainError({
      code: "FORBIDDEN",
      message: options.message,
      status: 403,
    });
  }

  return session;
}

/**
 * WHY:   Server functions may inject custom session resolvers during tests or composition.
 * WHAT:  Validates an already-resolved broker session object.
 * HOW:   Reuses the shared role/link assertion helper without reloading auth state.
 */
export function assertBrokerSession(session: ResolvedSession): ResolvedSession {
  return requireRoleSession(session, {
    allowedRoles: ["broker"],
    requiredOwnerKey: "brokerId",
    message: "Broker profile required",
  });
}

/**
 * WHY:   Developer server functions should validate injected sessions as well as default auth lookups.
 * WHAT:  Validates an already-resolved developer session object.
 * HOW:   Reuses the shared role/link assertion helper and enforces a linked developer owner id.
 */
export function assertDeveloperSession(session: ResolvedSession): ResolvedSession {
  return requireRoleSession(session, {
    allowedRoles: ["developer"],
    requiredOwnerKey: "redId",
    message: "Developer profile required",
  });
}

/**
 * WHY:   Admin-only entrypoints can also receive injected sessions during tests.
 * WHAT:  Validates an already-resolved admin session object.
 * HOW:   Reuses the shared role assertion helper without requiring an owner id.
 */
export function assertAdminSession(session: ResolvedSession): ResolvedSession {
  return requireRoleSession(session, {
    allowedRoles: ["admin"],
    message: "Admin role required",
  });
}

/**
 * WHY:   Broker pages and mutations should not repeat role/link checks inline.
 * WHAT:  Resolves and validates the current broker session.
 * HOW:   Requires an authenticated session, then enforces `broker` plus `brokerId`.
 */
export async function requireBrokerSession(): Promise<ResolvedSession> {
  const session = await requireSessionContext();
  return assertBrokerSession(session);
}

/**
 * WHY:   Developer workspace flows need one consistent role guard.
 * WHAT:  Resolves and validates the current developer session.
 * HOW:   Requires an authenticated developer session and enforces a linked `redId`.
 */
export async function requireDeveloperSession(): Promise<ResolvedSession> {
  const session = await requireSessionContext();
  return assertDeveloperSession(session);
}

/**
 * WHY:   Admin-only server entrypoints need the same stable guard style as other roles.
 * WHAT:  Resolves and validates the current admin session.
 * HOW:   Requires an authenticated session, then enforces the `admin` role.
 */
export async function requireAdminSession(): Promise<ResolvedSession> {
  const session = await requireSessionContext();
  return assertAdminSession(session);
}
