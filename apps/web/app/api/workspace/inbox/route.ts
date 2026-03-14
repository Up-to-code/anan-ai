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
} from "@/server/domains/inbox/service";
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
    const body = await request.json();
    if (body.intent === "resolve") {
      const parsed = resolveDirectConversationInputSchema.safeParse(body);
      if (!parsed.success) {
        throw new DomainError({
          code: "INVALID_ARGUMENT",
          message: parsed.error.issues[0]?.message ?? "Invalid conversation target",
          status: 400,
        });
      }
      return Response.json({ conversationId: await resolveInboxConversation(parsed.data) }, { status: 201 });
    }

    if (body.intent === "offerBootstrap") {
      const parsed = bootstrapOfferConversationInputSchema.safeParse(body);
      if (!parsed.success) {
        throw new DomainError({
          code: "INVALID_ARGUMENT",
          message: parsed.error.issues[0]?.message ?? "Invalid offer conversation payload",
          status: 400,
        });
      }
      return Response.json(await bootstrapInboxOfferConversation(parsed.data), { status: 201 });
    }

    if (body.intent === "shareFile") {
      const parsed = shareFileInConversationInputSchema.safeParse(body);
      if (!parsed.success) {
        throw new DomainError({
          code: "INVALID_ARGUMENT",
          message: parsed.error.issues[0]?.message ?? "Invalid file share payload",
          status: 400,
        });
      }
      return Response.json(await shareInboxFileInConversation(parsed.data), { status: 201 });
    }

    if (body.intent === "shareProject") {
      const parsed = shareProjectInConversationInputSchema.safeParse(body);
      if (!parsed.success) {
        throw new DomainError({
          code: "INVALID_ARGUMENT",
          message: parsed.error.issues[0]?.message ?? "Invalid project share payload",
          status: 400,
        });
      }
      return Response.json(await shareInboxProjectInConversation(parsed.data), { status: 201 });
    }

    if (body.intent === "shareDeal") {
      const parsed = shareDealInConversationInputSchema.safeParse(body);
      if (!parsed.success) {
        throw new DomainError({
          code: "INVALID_ARGUMENT",
          message: parsed.error.issues[0]?.message ?? "Invalid deal share payload",
          status: 400,
        });
      }
      return Response.json(await shareInboxDealInConversation(parsed.data), { status: 201 });
    }

    if (body.intent === "createPrivateOffer") {
      const parsed = createPrivateOfferInConversationInputSchema.safeParse(body);
      if (!parsed.success) {
        throw new DomainError({
          code: "INVALID_ARGUMENT",
          message: parsed.error.issues[0]?.message ?? "Invalid private offer payload",
          status: 400,
        });
      }
      return Response.json(await createInboxPrivateOfferInConversation(parsed.data), { status: 201 });
    }

    const parsed = sendConversationMessageInputSchema.safeParse(body);
    if (!parsed.success) {
      throw new DomainError({
        code: "INVALID_ARGUMENT",
        message: parsed.error.issues[0]?.message ?? "Invalid message payload",
        status: 400,
      });
    }

    return Response.json(await sendInboxMessage(parsed.data), { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return toInvalidJsonResponse();
    }
    return toErrorResponse(error);
  }
}
