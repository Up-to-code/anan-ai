import { z } from "zod";

export const inboxConversationRouteSchema = z.object({
  conversationId: z.string().trim().min(1).nullable(),
});

export function parseConversationRoute(searchParams: URLSearchParams) {
  return inboxConversationRouteSchema.parse({
    conversationId: searchParams.get("conversationId"),
  });
}

