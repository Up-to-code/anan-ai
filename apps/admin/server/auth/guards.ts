import { type ResolvedSession, requireSessionContext } from "@/server/auth/session";
import { DomainError } from "@/server/contracts/errors";

/**
 * WHY:   Admin server functions need one shared place for role enforcement.
 * WHAT:  Exposes the admin session guard used by routes, server actions, and repositories.
 * HOW:   Reuses the shared session resolver, then validates role and required owner ids.
 */

function requireRoleSession(
  session: ResolvedSession,
  options: {
    requireAdmin?: boolean;
    requiredOwnerKey?: "brokerId" | "redId";
    message: string;
  },
): ResolvedSession {
  const hasRole = options.requireAdmin ? Boolean(session.context.isAdmin) : true;
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
 * WHY:   Admin-only entrypoints can also receive injected sessions during tests.
 * WHAT:  Validates an already-resolved admin session object.
 * HOW:   Reuses the shared role assertion helper without requiring an owner id.
 */
export function assertAdminSession(session: ResolvedSession): ResolvedSession {
  return requireRoleSession(session, {
    requireAdmin: true,
    message: "Admin role required",
  });
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
