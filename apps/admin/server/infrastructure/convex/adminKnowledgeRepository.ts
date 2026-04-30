import { createRepositoryRefs, mutationRef, queryRef, voidMutationRef } from "@anan/convex-adapters/repository";
import { apiUnsafe } from "@/lib/convexApi";

type KnowledgeApiRefs = {
  listKnowledgePages: unknown;
  getKnowledgePage: unknown;
  createKnowledgePage: unknown;
  updateKnowledgePage: unknown;
  deleteKnowledgePage: unknown;
};

const knowledgeApi = createRepositoryRefs<KnowledgeApiRefs>(apiUnsafe, "admin_zone/knowledge");

export type AdminKnowledgePage = {
  _id: string;
  slug: string;
  title: string;
  content: string;
  category?: string;
  _creationTime?: number;
};

/**
 * WHY:   Knowledge management needs a stable transport layer for editor and list surfaces.
 * WHAT:  Exposes auth-scoped CRUD operations for admin knowledge pages.
 * HOW:   Calls the existing `admin_zone/knowledge` handlers with the current admin token.
 */
export const convexAdminKnowledgeRepository = {
  async list(token: string) {
    return queryRef<AdminKnowledgePage[]>(token, knowledgeApi.listKnowledgePages);
  },
  async get(token: string, id: string) {
    return queryRef<AdminKnowledgePage | null>(token, knowledgeApi.getKnowledgePage, { id });
  },
  async create(token: string, input: Omit<AdminKnowledgePage, "_id" | "_creationTime">) {
    return mutationRef<string>(token, knowledgeApi.createKnowledgePage, input);
  },
  async update(token: string, input: Partial<Omit<AdminKnowledgePage, "_creationTime">> & { id: string }) {
    await voidMutationRef(token, knowledgeApi.updateKnowledgePage, input);
  },
  async remove(token: string, id: string) {
    await voidMutationRef(token, knowledgeApi.deleteKnowledgePage, { id });
  },
};
