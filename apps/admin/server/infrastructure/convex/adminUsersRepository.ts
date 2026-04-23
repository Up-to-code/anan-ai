import { fetchMutation, fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";

type UsersApiRefs = {
  listAdminUsers: unknown;
  listAdminProfiles: unknown;
  listAdminMemberships: unknown;
  listAdminUserVerification: unknown;
  getAdminUserDetail: unknown;
  listUsers: unknown;
  getUserKnowledgeResearch: unknown;
  getUserSearchLogs: unknown;
  getUserAgentMemory: unknown;
  updateUser: unknown;
};

const usersApi = apiUnsafe["admin_zone/users"] as UsersApiRefs;

export type PaginationOptions = {
  numItems: number;
  cursor: string | null;
};

export type PaginationResult<T> = {
  page: T[];
  isDone: boolean;
  continueCursor: string | null;
};

export type AdminUserRecord = Record<string, unknown>;
export type AdminUserDetail = Record<string, unknown> | null;

/**
 * WHY:   Admin user management should depend on a stable repository boundary rather than raw Convex refs.
 * WHAT:  Exposes auth-scoped reads and writes for the admin users surface.
 * HOW:   Calls the existing `admin_zone/users` queries and mutations with the current admin token.
 */
export const convexAdminUsersRepository = {
  async listAdminUsers(token: string, input: { paginationOpts: PaginationOptions; role?: "broker" | "developer" | "user" | "RED" }) {
    return fetchQuery(usersApi.listAdminUsers as never, input as never, { token }) as Promise<PaginationResult<AdminUserRecord>>;
  },
  async listAdminProfiles(token: string, input: { paginationOpts: PaginationOptions }) {
    return fetchQuery(usersApi.listAdminProfiles as never, input as never, { token }) as Promise<PaginationResult<AdminUserRecord>>;
  },
  async listAdminMemberships(token: string, input: { paginationOpts: PaginationOptions }) {
    return fetchQuery(usersApi.listAdminMemberships as never, input as never, { token }) as Promise<PaginationResult<AdminUserRecord>>;
  },
  async listAdminUserVerification(token: string, input: { paginationOpts: PaginationOptions }) {
    return fetchQuery(usersApi.listAdminUserVerification as never, input as never, { token }) as Promise<PaginationResult<AdminUserRecord>>;
  },
  async list(token: string, input: { paginationOpts: PaginationOptions; channel?: "whatsapp" | "app" | "web" }) {
    return fetchQuery(usersApi.listUsers as never, input as never, { token }) as Promise<PaginationResult<AdminUserRecord>>;
  },
  async getDetail(token: string, userKey: string) {
    return fetchQuery(usersApi.getAdminUserDetail as never, { userKey } as never, { token }) as Promise<AdminUserDetail>;
  },
  async listKnowledgeResearch(token: string, userId: string, limit = 20) {
    return fetchQuery(usersApi.getUserKnowledgeResearch as never, { userId, limit } as never, { token }) as Promise<Array<Record<string, unknown>>>;
  },
  async listSearchLogs(token: string, userId: string, limit = 50) {
    return fetchQuery(usersApi.getUserSearchLogs as never, { userId, limit } as never, { token }) as Promise<Array<Record<string, unknown>>>;
  },
  async listAgentMemory(token: string, userId: string) {
    return fetchQuery(usersApi.getUserAgentMemory as never, { userId } as never, { token }) as Promise<Array<Record<string, unknown>>>;
  },
  async update(
    token: string,
    input: { userId: string; displayName?: string; channel?: "whatsapp" | "app" | "web" },
  ) {
    await fetchMutation(usersApi.updateUser as never, input as never, { token });
  },
};
