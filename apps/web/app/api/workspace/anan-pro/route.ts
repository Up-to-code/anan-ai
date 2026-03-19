import { NextRequest } from "next/server";
import {
  cancelAnanProStreamSession,
  getAnanProThread,
  listAnanProStreamEvents,
  listAnanProThreads,
  sendAnanProMessage,
} from "@/server/domains/ananPro/service";
import { sendAnanProMessageInputSchema } from "@/server/contracts/ananPro";
import { DomainError, toErrorResponse } from "@/server/contracts/errors";
import { toInvalidJsonResponse } from "@/app/api/_shared/errors";

/**
 * WHY:   The workspace assistant view needs one gateway endpoint for listing or loading Anan Workspace threads.
 * WHAT:  Returns either the current thread or the current user's thread list based on query params.
 * HOW:   Reads `threadId` and `list` from the request URL, delegates to the domain service, and normalizes failures.
 */
export async function GET(request: NextRequest) {
  try {
    const threadId = request.nextUrl.searchParams.get("threadId") ?? undefined;
    const list = request.nextUrl.searchParams.get("list");
    if (list === "threads") {
      const limitParam = request.nextUrl.searchParams.get("limit");
      const parsedLimit = limitParam ? Number(limitParam) : NaN;
      const limit = Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(Math.floor(parsedLimit), 50)
        : 12;

      return Response.json(await listAnanProThreads(limit), {
        headers: {
          "Cache-Control": "private, max-age=15",
        },
      });
    }
    return Response.json(await getAnanProThread(threadId));
  } catch (error) {
    return toErrorResponse(error);
  }
}

function serializeSseEvent(event: string, payload: unknown) {
  const data = JSON.stringify(payload);
  return `event: ${event}\ndata: ${data}\n\n`;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * WHY:   Thread replies should be sent through one gateway-owned action instead of calling Convex directly from the client.
 * WHAT:  Validates and sends one Anan Workspace message, returning the created message/thread payload.
 * HOW:   Parses the JSON body with the shared schema, then delegates to the domain service with normalized error handling.
 */
export async function POST(request: NextRequest) {
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

    const streamMode = request.nextUrl.searchParams.get("stream") === "1";
    if (streamMode) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            const streamSessionId = parsed.data.streamSessionId ?? crypto.randomUUID();
            const sendPromise = sendAnanProMessage({
              ...parsed.data,
              streamSessionId,
            });
            let afterSeq = 0;
            let emittedThread = false;
            let emittedAssistantMeta = false;

            while (true) {
              const events = await listAnanProStreamEvents({
                sessionId: streamSessionId,
                afterSeq,
                limit: 64,
              });

              for (const event of events) {
                afterSeq = Math.max(afterSeq, event.seq);
                if (event.eventType === "stage" && event.phase) {
                  controller.enqueue(encoder.encode(serializeSseEvent("meta", {
                    type: "stage",
                    stage: {
                      seq: event.seq,
                      phase: event.phase,
                      status: event.status,
                      teamId: event.teamId,
                      agentName: event.agentName,
                      details: event.details,
                      timestamp: event.timestamp,
                    },
                  })));
                  continue;
                }

                if (event.eventType === "delta") {
                  controller.enqueue(encoder.encode(serializeSseEvent("delta", {
                    text: event.delta ?? "",
                  })));
                  continue;
                }

                if (event.eventType === "thread" && event.threadId) {
                  emittedThread = true;
                  controller.enqueue(encoder.encode(serializeSseEvent("thread", {
                    threadId: event.threadId,
                    title: event.title ?? null,
                  })));
                  continue;
                }

                if (event.eventType === "assistant_meta") {
                  emittedAssistantMeta = true;
                  controller.enqueue(encoder.encode(serializeSseEvent("meta", {
                    type: "assistant_meta",
                    meta: event.meta,
                  })));
                  continue;
                }

                if (event.eventType === "lifecycle") {
                  controller.enqueue(encoder.encode(serializeSseEvent("meta", {
                    type: "lifecycle",
                    lifecycle: {
                      sessionId: streamSessionId,
                      status: event.status,
                      details: event.details,
                      timestamp: event.timestamp,
                    },
                  })));
                  continue;
                }

                if (event.eventType === "error") {
                  controller.enqueue(encoder.encode(serializeSseEvent("error", {
                    code: event.code ?? "INTERNAL_SERVER_ERROR",
                    message: event.message ?? "تعذر إرسال الرسالة.",
                    status: 500,
                  })));
                }
              }

              const settled = await Promise.race([
                sendPromise.then((thread) => ({ done: true as const, thread })),
                delay(170).then(() => ({ done: false as const })),
              ]);

              if (settled.done) {
                const thread = settled.thread;
                const trailing = await listAnanProStreamEvents({
                  sessionId: streamSessionId,
                  afterSeq,
                  limit: 128,
                });
                for (const event of trailing) {
                  afterSeq = Math.max(afterSeq, event.seq);
                  if (event.eventType === "stage" && event.phase) {
                    controller.enqueue(encoder.encode(serializeSseEvent("meta", {
                      type: "stage",
                      stage: {
                        seq: event.seq,
                        phase: event.phase,
                        status: event.status,
                        teamId: event.teamId,
                        agentName: event.agentName,
                        details: event.details,
                        timestamp: event.timestamp,
                      },
                    })));
                    continue;
                  }
                  if (event.eventType === "delta") {
                    controller.enqueue(encoder.encode(serializeSseEvent("delta", {
                      text: event.delta ?? "",
                    })));
                    continue;
                  }
                  if (event.eventType === "thread" && event.threadId) {
                    emittedThread = true;
                    controller.enqueue(encoder.encode(serializeSseEvent("thread", {
                      threadId: event.threadId,
                      title: event.title ?? null,
                    })));
                    continue;
                  }
                  if (event.eventType === "assistant_meta") {
                    emittedAssistantMeta = true;
                    controller.enqueue(encoder.encode(serializeSseEvent("meta", {
                      type: "assistant_meta",
                      meta: event.meta,
                    })));
                    continue;
                  }
                  if (event.eventType === "lifecycle") {
                    controller.enqueue(encoder.encode(serializeSseEvent("meta", {
                      type: "lifecycle",
                      lifecycle: {
                        sessionId: streamSessionId,
                        status: event.status,
                        details: event.details,
                        timestamp: event.timestamp,
                      },
                    })));
                    continue;
                  }
                  if (event.eventType === "error") {
                    controller.enqueue(encoder.encode(serializeSseEvent("error", {
                      code: event.code ?? "INTERNAL_SERVER_ERROR",
                      message: event.message ?? "تعذر إرسال الرسالة.",
                      status: 500,
                    })));
                  }
                }

                const assistantMessage = [...thread.messages].reverse().find((message) => message.role === "assistant");
                if (!emittedThread) {
                  controller.enqueue(encoder.encode(serializeSseEvent("thread", {
                    threadId: thread.id,
                    title: thread.title ?? null,
                  })));
                }

                if (!emittedAssistantMeta && assistantMessage?.meta) {
                  controller.enqueue(encoder.encode(serializeSseEvent("meta", {
                    type: "assistant_meta",
                    meta: assistantMessage.meta,
                  })));
                }

                controller.enqueue(encoder.encode(serializeSseEvent("done", { thread })));
                break;
              }
            }
          } catch (error) {
            const normalized = error instanceof DomainError
              ? { code: error.code, message: error.message, status: error.status }
              : { code: "INTERNAL_SERVER_ERROR", message: "تعذر إرسال الرسالة.", status: 500 };
            controller.enqueue(encoder.encode(serializeSseEvent("error", normalized)));
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        },
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

export async function DELETE(request: NextRequest) {
  try {
    const querySessionId = request.nextUrl.searchParams.get("sessionId")?.trim();
    const body = querySessionId ? null : await request.json().catch(() => null);
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

    return Response.json(await cancelAnanProStreamSession(sessionId));
  } catch (error) {
    return toErrorResponse(error);
  }
}
