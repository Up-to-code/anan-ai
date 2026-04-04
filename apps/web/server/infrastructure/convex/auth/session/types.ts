import type { SessionUser } from "@/server/contracts/session";

/**
 * WHY: Domain services should depend on repository contracts instead of raw Convex calls.
 * WHAT: Resolves the current authenticated user from a Convex token.
 * HOW: Returns the current session projection or null when the token has no active user.
 */
export type SessionsRepository = {
  getCurrent(token: string): Promise<SessionUser | null>;
};
