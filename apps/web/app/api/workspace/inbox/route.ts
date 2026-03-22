import { NextRequest } from "next/server";
import {
  bootstrapInboxOfferConversation,
  createInboxPrivateOfferInConversation,
  getInboxConversation,
  listInboxConversations,
  resolveInboxConversation,
  shareInboxDealInConversation,
  shareInboxFileInConversation,
  shareInboxProjectInConversation,
  sendInboxMessage,
} from "@/server/domains/workspace/inbox/service";
import {
  bootstrapOfferConversationInputSchema,
  createPrivateOfferInConversationInputSchema,
  resolveDirectConversationInputSchema,
  shareDealInConversationInputSchema,
  shareFileInConversationInputSchema,
  shareProjectInConversationInputSchema,
  sendConversationMessageInputSchema,
} from "@/server/contracts/inbox";
import { DomainError, toErrorResponse } from "@/server/contracts/errors";
import { toInvalidJsonResponse } from "@/app/api/_shared/errors";
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
  return Response.json({ conversationId: await resolveInboxConversation(payload) }, { status: 201 });
}

async function handleOfferBootstrapIntent(body: unknown) {
  const payload = parsePayloadOrThrow(bootstrapOfferConversationInputSchema, body, "Invalid offer conversation payload");
  return Response.json(await bootstrapInboxOfferConversation(payload), { status: 201 });
}

async function handleShareFileIntent(body: unknown) {
  const payload = parsePayloadOrThrow(shareFileInConversationInputSchema, body, "Invalid file share payload");
  return Response.json(await shareInboxFileInConversation(payload), { status: 201 });
}

async function handleShareProjectIntent(body: unknown) {
  const payload = parsePayloadOrThrow(shareProjectInConversationInputSchema, body, "Invalid project share payload");
  return Response.json(await shareInboxProjectInConversation(payload), { status: 201 });
}

async function handleShareDealIntent(body: unknown) {
  const payload = parsePayloadOrThrow(shareDealInConversationInputSchema, body, "Invalid deal share payload");
  return Response.json(await shareInboxDealInConversation(payload), { status: 201 });
}

async function handleCreatePrivateOfferIntent(body: unknown) {
  const payload = parsePayloadOrThrow(createPrivateOfferInConversationInputSchema, body, "Invalid private offer payload");
  return Response.json(await createInboxPrivateOfferInConversation(payload), { status: 201 });
}

async function handleSendMessageIntent(body: unknown) {
  const payload = parsePayloadOrThrow(sendConversationMessageInputSchema, body, "Invalid message payload");
  return Response.json(await sendInboxMessage(payload), { status: 201 });
}

async function handlePostByIntent(body: unknown) {
  const intent = typeof body === "object" && body !== null ? (body as { intent?: string }).intent : undefined;
  if (intent === "resolve") return handleResolveIntent(body);
  if (intent === "offerBootstrap") return handleOfferBootstrapIntent(body);
  if (intent === "shareFile") return handleShareFileIntent(body);
  if (intent === "shareProject") return handleShareProjectIntent(body);
  if (intent === "shareDeal") return handleShareDealIntent(body);
  if (intent === "createPrivateOffer") return handleCreatePrivateOfferIntent(body);
  return handleSendMessageIntent(body);
}

/**
 * WHY:   The workspace inbox needs one gateway entrypoint for list and detail reads.
 * WHAT:  Returns either the current user's conversation list or a single conversation detail payload.
 * HOW:   Checks for `conversationId` in the request URL, delegates to the inbox domain service, and normalizes failures.
 */
export async function GET(request: NextRequest) {
  try {
    const conversationId = request.nextUrl.searchParams.get("conversationId");
    if (conversationId) {
      return Response.json(await getInboxConversation(conversationId));
    }

    return Response.json(await listInboxConversations());
  } catch (error) {
    return toErrorResponse(error);
  }
}

/**
 * WHY:   Inbox compose flows need one HTTP write endpoint for either direct-conversation resolution or message sending.
 * WHAT:  Resolves a direct conversation id or sends a message, depending on the payload intent.
 * HOW:   Parses JSON once, validates against the appropriate schema, then delegates to the inbox domain service.
 */
export async function POST(request: Request) {
  try {
    return await handlePostByIntent(await request.json());
  } catch (error) {
    if (error instanceof SyntaxError) {
      return toInvalidJsonResponse();
    }
    return toErrorResponse(error);
  }
}
