import type { Locale, ThreadSummary } from "../types";
import { getMockConversationThreads } from "./mockConversation";

/**
 * WHY:   The history drawer should expose demo entries even before the user has any saved local history.
 * WHAT:  Returns localized demo thread summaries for the simplified drawer list.
 * HOW:   Projects the seeded mock thread metadata into the same summary shape used by the live drawer.
 */
export function getMockThreadSummaries(locale: Locale): ThreadSummary[] {
  return getMockConversationThreads(locale).map((thread) => ({
    id: thread.id,
    title: thread.title,
    createdAt: thread.createdAt,
    updatedAt: thread.createdAt,
    preview: thread.messages.at(-1)?.text,
  }));
}
