import { useQuery, useMutation, usePaginatedQuery } from "convex/react";
import { api } from "convex/_generated/api";

/**
 * WHY:   Provides the central list of all users for the Admin Zone user management table.
 * WHAT:  Fetches a paginated list of users from the Convex backend.
 * HOW:   Uses `usePaginatedQuery` to handle infinite scrolling or "Load More" behavior.
 */
export function useAdminListUsers() {
    const { results, status, loadMore } = usePaginatedQuery(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        api.admin_zone.users.listUsers as any,
        {},
        { initialNumItems: 20 },
    );
    return { users: results, status, loadMore };
}

/**
 * WHY:   Supplies all necessary context for the UserDetail orchestrator page.
 * WHAT:  Fetches core user info, knowledge research logs, search logs, and agent memory in parallel.
 *        Also provides a mutation function to update user details.
 * HOW:   Uses standard `useQuery` for reads and `useMutation` for writes, skipping reads if `userId` is missing.
 */
export function useAdminUserDetail(userId: string | undefined) {
    const isReady = !!userId;
    const detail = useQuery(api.admin_zone.users.getUserDetail, isReady ? { userId } : "skip");
    const research = useQuery(api.admin_zone.users.getUserKnowledgeResearch, isReady ? { userId, limit: 20 } : "skip");
    const logs = useQuery(api.admin_zone.users.getUserSearchLogs, isReady ? { userId, limit: 30 } : "skip");
    const memory = useQuery(api.admin_zone.users.getUserAgentMemory, isReady ? { userId } : "skip");
    const updateUser = useMutation(api.admin_zone.users.updateUser);

    return {
        detail,
        research,
        logs,
        memory,
        updateUser,
        isLoading: detail === undefined,
    };
}

/**
 * WHY:   Allows admins to see a historical list of all chat sessions a user has had with AI agents.
 * WHAT:  Fetches paginated conversation threads for a specific user.
 * HOW:   Uses `usePaginatedQuery` pointing to the `admin_zone.threads` module.
 */
export function useAdminUserThreads(userId: string) {
    const { results, status, loadMore } = usePaginatedQuery(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        api.admin_zone.threads.listThreadsForUser as any,
        { userId },
        { initialNumItems: 10 },
    );
    return { threads: results, status, loadMore };
}

/**
 * WHY:   Allows admins to inspect the specific turn-by-turn messages within a selected thread.
 * WHAT:  Fetches a paginated list of messages for a single `threadId`.
 * HOW:   Uses `usePaginatedQuery` for message history loading.
 */
export function useAdminThreadMessages(threadId: string) {
    const { results, status, loadMore } = usePaginatedQuery(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        api.admin_zone.threads.getThreadMessages as any,
        { threadId },
        { initialNumItems: 30 },
    );
    return { messages: results, status, loadMore };
}
