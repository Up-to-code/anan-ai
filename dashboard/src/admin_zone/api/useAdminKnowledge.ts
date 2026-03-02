import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

// ─── Knowledge ──────────────────────────────────────────

/**
 * WHY:   Populates the data sources and instructions for the RAG system in the admin panel.
 * WHAT:  Fetches a list of all knowledge pages.
 * HOW:   Uses `useQuery` via `admin_zone.knowledge.listKnowledgePages`.
 */
export function useAdminListKnowledge() {
    const pages = useQuery(api.admin_zone.knowledge.listKnowledgePages);
    return { pages, isLoading: pages === undefined };
}

/**
 * WHY:   Fetches details of a specific knowledge document for viewing or editing.
 * WHAT:  Reads a single knowledge page record.
 * HOW:   Skips the query if `id` is undefined.
 */
export function useAdminGetKnowledge(id: string | undefined) {
    const page = useQuery(
        api.admin_zone.knowledge.getKnowledgePage,
        id ? { id: id as Id<"knowledgePages"> } : "skip"
    );
    return { page, isLoading: page === undefined };
}

/**
 * WHY:   Allows admins to inject new static context into the AI's Brain.
 * WHAT:  Provides a mutation to create a new Knowledge page.
 * HOW:   Uses `useMutation` via `admin_zone.knowledge.createKnowledgePage`.
 */
export function useAdminCreateKnowledge() {
    return { createKnowledgePage: useMutation(api.admin_zone.knowledge.createKnowledgePage) };
}

/**
 * WHY:   Allows admins to update the static context injected into the AI's Brain.
 * WHAT:  Provides a mutation to update an existing Knowledge page.
 * HOW:   Uses `useMutation` via `admin_zone.knowledge.updateKnowledgePage`.
 */
export function useAdminUpdateKnowledge() {
    return { updateKnowledgePage: useMutation(api.admin_zone.knowledge.updateKnowledgePage) };
}
