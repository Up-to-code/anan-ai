import { requireAdminSession } from "@/server/auth/guards";
import { requireAdminPageSession } from "@/lib/serverSession";
import { convexAdminKnowledgeRepository } from "@/server/infrastructure/convex/adminKnowledgeRepository";

/**
 * WHY:   The knowledge surface needs list and optional selected-page loading through one admin gateway.
 * WHAT:  Returns all knowledge pages plus the page selected for editing, when requested.
 * HOW:   Requires an admin session, then loads the list and selected document in parallel.
 */
export async function getAdminKnowledgePageData(selectedId?: string | null) {
  const session = await requireAdminPageSession("/knowledge");
  const [pages, selectedPage] = await Promise.all([
    convexAdminKnowledgeRepository.list(session.token),
    selectedId ? convexAdminKnowledgeRepository.get(session.token, selectedId) : Promise.resolve(null),
  ]);

  return { session, pages, selectedPage };
}

/**
 * WHY:   Knowledge writes should stay behind a narrow admin-only API.
 * WHAT:  Creates a knowledge page.
 * HOW:   Requires an admin session, then delegates to the repository.
 */
export async function createAdminKnowledgePage(input: {
  slug: string;
  title: string;
  content: string;
  category?: string;
}) {
  const session = await requireAdminSession();
  await convexAdminKnowledgeRepository.create(session.token, input);
}

/**
 * WHY:   The editor needs one stable update path for existing knowledge pages.
 * WHAT:  Updates a knowledge page by id.
 * HOW:   Requires an admin session, then forwards the patch to the repository.
 */
export async function updateAdminKnowledgePage(input: {
  id: string;
  slug?: string;
  title?: string;
  content?: string;
  category?: string;
}) {
  const session = await requireAdminSession();
  await convexAdminKnowledgeRepository.update(session.token, input);
}

/**
 * WHY:   Deleting knowledge content should remain explicit and admin-only.
 * WHAT:  Deletes one knowledge page by id.
 * HOW:   Requires an admin session, then calls the repository delete operation.
 */
export async function deleteAdminKnowledgePage(id: string) {
  const session = await requireAdminSession();
  await convexAdminKnowledgeRepository.remove(session.token, id);
}
