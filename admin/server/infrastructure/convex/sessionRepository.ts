import { fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";
import type { SessionUser } from "@/server/contracts/session";

type SessionApiRefs = {
  getSessionUser: unknown;
};

const sessionApi = (apiUnsafe["shared_logic/users/session"]) as SessionApiRefs;

/**
 * WHY:   Domain services should depend on repository contracts instead of raw Convex calls.
 * WHAT:  Session repository contract for resolving the current authenticated user from a Convex token.
 * HOW:   Implementations return the current session projection or null when the token has no active user.
 */
export type SessionsRepository = {
  getCurrent(token: string): Promise<SessionUser | null>;
};

/**
 * WHY:   Phase 1 still uses Convex as the data/auth source of truth.
 * WHAT:  Repository adapter that reads the current session user through the existing Convex query.
 * HOW:   Calls `shared_logic/users/session.getSessionUser` with the current Convex auth token.
 */
export const convexSessionsRepository: SessionsRepository = {
  async getCurrent(token) {
    const user = (await fetchQuery(sessionApi.getSessionUser as never, {} as never, {
      token,
    })) as SessionUser | null;
    return user;
  },
};
