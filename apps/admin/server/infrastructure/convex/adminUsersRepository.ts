import { createRepositoryRefs, queryRef, voidMutationRef } from "@anan/convex-adapters/repository";
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

const usersApi = createRepositoryRefs<UsersApiRefs>(apiUnsafe, "admin_zone/users");

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
    return queryRef<PaginationResult<AdminUserRecord>>(token, usersApi.listAdminUsers, input);
  },
  async listAdminProfiles(token: string, input: { paginationOpts: PaginationOptions }) {
    return queryRef<PaginationResult<AdminUserRecord>>(token, usersApi.listAdminProfiles, input);
  },
  async listAdminMemberships(token: string, input: { paginationOpts: PaginationOptions }) {
    return queryRef<PaginationResult<AdminUserRecord>>(token, usersApi.listAdminMemberships, input);
  },
  async listAdminUserVerification(token: string, input: { paginationOpts: PaginationOptions }) {
    return queryRef<PaginationResult<AdminUserRecord>>(token, usersApi.listAdminUserVerification, input);
  },
  async list(token: string, input: { paginationOpts: PaginationOptions; channel?: "workspace" | "web" | "admin" }) {
    return queryRef<PaginationResult<AdminUserRecord>>(token, usersApi.listUsers, input);
  },
  async getDetail(token: string, userKey: string) {
    return queryRef<AdminUserDetail>(token, usersApi.getAdminUserDetail, { userKey });
  },
  async listKnowledgeResearch(token: string, userId: string, limit = 20) {
    return queryRef<Array<Record<string, unknown>>>(token, usersApi.getUserKnowledgeResearch, { userId, limit });
  },
  async listSearchLogs(token: string, userId: string, limit = 50) {
    return queryRef<Array<Record<string, unknown>>>(token, usersApi.getUserSearchLogs, { userId, limit });
  },
  async listAgentMemory(token: string, userId: string) {
    return queryRef<Array<Record<string, unknown>>>(token, usersApi.getUserAgentMemory, { userId });
  },
  async update(
    token: string,
    input: { userId: string; displayName?: string; channel?: "workspace" | "web" | "admin" },
  ) {
    await voidMutationRef(token, usersApi.updateUser, input);
  },
};
