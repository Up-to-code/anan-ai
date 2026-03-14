import { NextRequest } from "next/server";
import { getAnanProThread, listAnanProThreads, sendAnanProMessage } from "@/server/domains/ananPro/service";
import { sendAnanProMessageInputSchema } from "@/server/contracts/ananPro";
import { DomainError, toErrorResponse } from "@/server/contracts/errors";
import { toInvalidJsonResponse } from "@/app/api/_shared/errors";

/**
 * WHY:   The workspace assistant view needs one gateway endpoint for listing or loading Anan Pro threads.
 * WHAT:  Returns either the current thread or the current user's thread list based on query params.
 * HOW:   Reads `threadId` and `list` from the request URL, delegates to the domain service, and normalizes failures.
 */
export async function GET(request: NextRequest) {
  try {
    const threadId = request.nextUrl.searchParams.get("threadId") ?? undefined;
    const list = request.nextUrl.searchParams.get("list");
    if (list === "threads") {
      return Response.json(await listAnanProThreads());
    }
    return Response.json(await getAnanProThread(threadId));
  } catch (error) {
    return toErrorResponse(error);
  }
}

/**
 * WHY:   Thread replies should be sent through one gateway-owned action instead of calling Convex directly from the client.
 * WHAT:  Validates and sends one Anan Pro message, returning the created message/thread payload.
 * HOW:   Parses the JSON body with the shared schema, then delegates to the domain service with normalized error handling.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = sendAnanProMessageInputSchema.safeParse(body);
    if (!parsed.success) {
      throw new DomainError({
        code: "INVALID_ARGUMENT",
        message: parsed.error.issues[0]?.message ?? "Invalid message payload",
        status: 400,
      });
    }

    return Response.json(await sendAnanProMessage(parsed.data), { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return toInvalidJsonResponse();
    }
    return toErrorResponse(error);
  }
}
