import { fetchQuery } from "convex/nextjs";
import { sessionApi } from "./api";
import type { SessionsRepository } from "./types";

export type { SessionsRepository } from "./types";

/**
 * WHY:   Phase 1 still uses Convex as the data/auth source of truth.
 * WHAT:  Repository adapter that reads the current session user through the existing Convex query.
 * HOW:   Calls `shared_logic/users/session.getSessionUser` with the current Convex auth token.
 */
export const convexSessionsRepository: SessionsRepository = {
  async getCurrent(token) {
    const user = (await fetchQuery(sessionApi.getSessionUser as never, {} as never, {
      token,
    })) as Awaited<ReturnType<SessionsRepository["getCurrent"]>>;
    return user;
  },
};
