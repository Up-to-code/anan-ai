import { NextRequest } from "next/server";
import { createdResponse, handleRoute, jsonResponse, parseJsonBody, safeJsonBody } from "@anan/web-foundation/api";
import {
  cancelAnanProStreamSession,
  getAnanProThread,
  listAnanProThreads,
  sendAnanProMessage,
} from "@/server/domains/workspace/ananPro/service";
import { sendAnanProMessageInputSchema } from "@/server/contracts/ananPro";
import { DomainError, toErrorResponse } from "@/server/contracts/errors";
import { parseThreadListLimit, shouldListThreads } from "./route.helpers";
import { createAnanProMessageStream } from "./route.stream";

/**
 * WHY:   The workspace assistant view needs one gateway endpoint for listing or loading Anan Workspace threads.
 * WHAT:  Returns either the current thread or the current user's thread list based on query params.
 * HOW:   Reads `threadId` and `list` from the request URL, delegates to the domain service, and normalizes failures.
 */
export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const threadId = request.nextUrl.searchParams.get("threadId") ?? undefined;
    if (shouldListThreads(request)) {
      const limit = parseThreadListLimit(request);
      return Response.json(await listAnanProThreads(limit), {
        headers: {
          "Cache-Control": "private, max-age=15",
        },
      });
    }
    return jsonResponse(await getAnanProThread(threadId));
  });
}

/**
 * WHY:   Thread replies should be sent through one gateway-owned action instead of calling Convex directly from the client.
 * WHAT:  Validates and sends one Anan Workspace message, returning the created message/thread payload.
 * HOW:   Parses the JSON body with the shared schema, then delegates to the domain service with normalized error handling.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await parseJsonBody(request, sendAnanProMessageInputSchema, "Invalid message payload");

    const streamMode = request.nextUrl.searchParams.get("stream") === "1";
    if (streamMode) {
      return new Response(createAnanProMessageStream(payload), {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        },
      });
    }

    return createdResponse(await sendAnanProMessage(payload));
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const querySessionId = request.nextUrl.searchParams.get("sessionId")?.trim();
    const body = querySessionId ? null : await safeJsonBody(request);
    const bodySessionId =
      body && typeof body === "object" && "sessionId" in body
        ? String((body as { sessionId?: unknown }).sessionId ?? "").trim()
        : "";
    const sessionId = querySessionId || bodySessionId;

    if (!sessionId) {
      throw new DomainError({
        code: "INVALID_ARGUMENT",
        message: "sessionId is required.",
        status: 400,
      });
    }

    return jsonResponse(await cancelAnanProStreamSession(sessionId));
  } catch (error) {
    return toErrorResponse(error);
  }
}
