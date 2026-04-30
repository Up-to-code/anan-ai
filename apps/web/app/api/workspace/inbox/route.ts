import { NextRequest } from "next/server";
import { createdResponse, handleRoute, jsonResponse, readJsonBody } from "@anan/web-foundation/api";
import {
  bootstrapInboxOfferConversation,
  createInboxPrivateOfferInConversation,
  getInboxConversation,
  listInboxConversations,
  publishInboxConversationOffer,
  resolveInboxConversation,
  respondToInboxConversationOffer,
  shareInboxDealInConversation,
  shareInboxFileInConversation,
  shareInboxProjectInConversation,
  sendInboxMessage,
  updateInboxPrivateOfferDraft,
} from "@/server/domains/workspace/inbox/service";
import {
  bootstrapOfferConversationInputSchema,
  createPrivateOfferInConversationInputSchema,
  publishConversationOfferInputSchema,
  resolveDirectConversationInputSchema,
  respondToConversationOfferInputSchema,
  shareDealInConversationInputSchema,
  shareFileInConversationInputSchema,
  shareProjectInConversationInputSchema,
  sendConversationMessageInputSchema,
  updatePrivateOfferDraftInConversationInputSchema,
} from "@/server/contracts/inbox";
import { DomainError, toErrorResponse } from "@/server/contracts/errors";
import type { ZodType } from "zod";

function parsePayloadOrThrow<T>(schema: ZodType<T>, body: unknown, fallbackMessage: string) {
  const parsed = schema.safeParse(body);
  if (parsed.success) return parsed.data;
  throw new DomainError({
    code: "INVALID_ARGUMENT",
    message: parsed.error.issues[0]?.message ?? fallbackMessage,
    status: 400,
  });
}

async function handleResolveIntent(body: unknown) {
  const payload = parsePayloadOrThrow(resolveDirectConversationInputSchema, body, "Invalid conversation target");
  return createdResponse({ conversationId: await resolveInboxConversation(payload) });
}

async function handleOfferBootstrapIntent(body: unknown) {
  const payload = parsePayloadOrThrow(bootstrapOfferConversationInputSchema, body, "Invalid offer conversation payload");
  return createdResponse(await bootstrapInboxOfferConversation(payload));
}

async function handleShareFileIntent(body: unknown) {
  const payload = parsePayloadOrThrow(shareFileInConversationInputSchema, body, "Invalid file share payload");
  return createdResponse(await shareInboxFileInConversation(payload));
}

async function handleShareProjectIntent(body: unknown) {
  const payload = parsePayloadOrThrow(shareProjectInConversationInputSchema, body, "Invalid project share payload");
  return createdResponse(await shareInboxProjectInConversation(payload));
}

async function handleShareDealIntent(body: unknown) {
  const payload = parsePayloadOrThrow(shareDealInConversationInputSchema, body, "Invalid deal share payload");
  return createdResponse(await shareInboxDealInConversation(payload));
}

async function handleCreatePrivateOfferIntent(body: unknown) {
  const payload = parsePayloadOrThrow(createPrivateOfferInConversationInputSchema, body, "Invalid private offer payload");
  return createdResponse(await createInboxPrivateOfferInConversation(payload));
}

async function handleUpdatePrivateOfferDraftIntent(body: unknown) {
  const payload = parsePayloadOrThrow(
    updatePrivateOfferDraftInConversationInputSchema,
    body,
    "Invalid private offer draft payload",
  );
  return jsonResponse(await updateInboxPrivateOfferDraft(payload));
}

async function handlePublishConversationOfferIntent(body: unknown) {
  const payload = parsePayloadOrThrow(
    publishConversationOfferInputSchema,
    body,
    "Invalid conversation offer publish payload",
  );
  return createdResponse(await publishInboxConversationOffer(payload));
}

async function handleRespondToConversationOfferIntent(body: unknown) {
  const payload = parsePayloadOrThrow(
    respondToConversationOfferInputSchema,
    body,
    "Invalid conversation offer response payload",
  );
  return jsonResponse(await respondToInboxConversationOffer(payload));
}

async function handleSendMessageIntent(body: unknown) {
  const payload = parsePayloadOrThrow(sendConversationMessageInputSchema, body, "Invalid message payload");
  return createdResponse(await sendInboxMessage(payload));
}

async function handlePostByIntent(body: unknown) {
  const intent = typeof body === "object" && body !== null ? (body as { intent?: string }).intent : undefined;
  if (intent === "resolve") return handleResolveIntent(body);
  if (intent === "offerBootstrap") return handleOfferBootstrapIntent(body);
  if (intent === "shareFile") return handleShareFileIntent(body);
  if (intent === "shareProject") return handleShareProjectIntent(body);
  if (intent === "shareDeal") return handleShareDealIntent(body);
  if (intent === "updatePrivateOfferDraft") return handleUpdatePrivateOfferDraftIntent(body);
  if (intent === "publishConversationOffer") return handlePublishConversationOfferIntent(body);
  if (intent === "respondToConversationOffer") return handleRespondToConversationOfferIntent(body);
  if (intent === "createPrivateOffer") return handleCreatePrivateOfferIntent(body);
  if (intent === "createPrivateOfferDraft") return handleCreatePrivateOfferIntent(body);
  return handleSendMessageIntent(body);
}

/**
 * WHY:   The workspace inbox needs one gateway entrypoint for list and detail reads.
 * WHAT:  Returns either the current user's conversation list or a single conversation detail payload.
 * HOW:   Checks for `conversationId` in the request URL, delegates to the inbox domain service, and normalizes failures.
 */
export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const conversationId = request.nextUrl.searchParams.get("conversationId");
    if (conversationId) {
      return jsonResponse(await getInboxConversation(conversationId));
    }

    return jsonResponse(await listInboxConversations());
  });
}

/**
 * WHY:   Inbox compose flows need one HTTP write endpoint for either direct-conversation resolution or message sending.
 * WHAT:  Resolves a direct conversation id or sends a message, depending on the payload intent.
 * HOW:   Parses JSON once, validates against the appropriate schema, then delegates to the inbox domain service.
 */
export async function POST(request: Request) {
  try {
    return await handlePostByIntent(await readJsonBody(request));
  } catch (error) {
    return toErrorResponse(error);
  }
}
