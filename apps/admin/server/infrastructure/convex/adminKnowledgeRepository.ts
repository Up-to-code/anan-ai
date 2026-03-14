import { fetchMutation, fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";

type KnowledgeApiRefs = {
  listKnowledgePages: unknown;
  getKnowledgePage: unknown;
  createKnowledgePage: unknown;
  updateKnowledgePage: unknown;
  deleteKnowledgePage: unknown;
};

const knowledgeApi = apiUnsafe["admin_zone/knowledge"] as KnowledgeApiRefs;

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
    return fetchQuery(knowledgeApi.listKnowledgePages as never, {} as never, { token }) as Promise<AdminKnowledgePage[]>;
  },
  async get(token: string, id: string) {
    return fetchQuery(knowledgeApi.getKnowledgePage as never, { id } as never, { token }) as Promise<AdminKnowledgePage | null>;
  },
  async create(token: string, input: Omit<AdminKnowledgePage, "_id" | "_creationTime">) {
    return fetchMutation(knowledgeApi.createKnowledgePage as never, input as never, { token }) as Promise<string>;
  },
  async update(token: string, input: Partial<Omit<AdminKnowledgePage, "_creationTime">> & { id: string }) {
    await fetchMutation(knowledgeApi.updateKnowledgePage as never, input as never, { token });
  },
  async remove(token: string, id: string) {
    await fetchMutation(knowledgeApi.deleteKnowledgePage as never, { id } as never, { token });
  },
};
