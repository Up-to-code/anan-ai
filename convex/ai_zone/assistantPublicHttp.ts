import { api } from "../_generated/api";
import type { ActionCtx } from "../_generated/server";
import { getAgentLLMConfigSafe } from "./agents/config";

type SupportedLocale = "ar" | "en" | "fr";

type StreamMetadata = {
  message?: string;
  threadId?: string;
  startFresh?: boolean;
  inputMode?: "text" | "voice";
  locale?: SupportedLocale;
  guestId?: string;
  channelSessionToken?: string;
  selectedPropertyId?: string;
  selectedPropertyIds?: string[];
  qualification?: {
    monthlySalary?: number;
    downPayment?: number;
    preferredYears?: number;
    employmentStatus?: string;
    notes?: string;
  };
};

type StreamRequestBody = {
  messages?: Array<{
    role?: string;
    name?: string;
    content?: unknown;
  }>;
  metadata?: StreamMetadata;
};

const STRUCTURED_RESPONSE_TOOL = "render_structured_response";
const encoder = new TextEncoder();

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function chunkText(text: string) {
  return text.match(/\S+\s*/gu) ?? [text];
}

function toChunkPayload(args: {
  delta?: Record<string, unknown>;
  finishReason?: "stop" | "tool_calls" | null;
  model: string;
}) {
  return {
    id: `chatcmpl-${Date.now()}`,
    object: "chat.completion.chunk",
    created: Math.floor(Date.now() / 1000),
    model: args.model,
    choices: [
      {
        index: 0,
        delta: args.delta ?? {},
        finish_reason: args.finishReason ?? null,
      },
    ],
  };
}

function toSseChunk(payload: Record<string, unknown>) {
  return encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);
}

function toDoneChunk() {
  return encoder.encode("data: [DONE]\n\n");
}

function isStructuredToolFollowup(messages: StreamRequestBody["messages"]) {
  const lastMessage = messages?.at(-1);
  return lastMessage?.role === "function" && lastMessage?.name === STRUCTURED_RESPONSE_TOOL;
}

function readStructuredToolArgs(result: any) {
  return {
    message: typeof result.message === "string" ? result.message : "",
    properties: Array.isArray(result.properties) ? result.properties : [],
    cards: Array.isArray(result.cards) ? result.cards : [],
    suggestedPrompts: Array.isArray(result.suggestedPrompts) ? result.suggestedPrompts : [],
    activePropertyId: typeof result.activePropertyId === "string" ? result.activePropertyId : undefined,
    requiresAuthForHandoff: Boolean(result.requiresAuthForHandoff),
    threadId: typeof result.threadId === "string" ? result.threadId : undefined,
    comparisonArtifactId:
      typeof result.comparisonArtifactId === "string" ? result.comparisonArtifactId : undefined,
    comparisonPropertyIds: Array.isArray(result.comparisonPropertyIds) ? result.comparisonPropertyIds : undefined,
    selectionSource:
      result.selectionSource === "ui_selected" ||
      result.selectionSource === "history_resolved" ||
      result.selectionSource === "text_resolved"
        ? result.selectionSource
        : undefined,
  };
}

function buildStructuredResponseStream(args: { result: any; model: string }) {
  const toolArgs = readStructuredToolArgs(args.result);

  return new ReadableStream<Uint8Array>({
    start(controller) {
      const message = typeof args.result.message === "string" ? args.result.message : "";

      for (const part of chunkText(message)) {
        controller.enqueue(
          toSseChunk(
            toChunkPayload({
              delta: {
                content: part,
              },
              model: args.model,
            }),
          ),
        );
      }

      controller.enqueue(
        toSseChunk(
          toChunkPayload({
            delta: {
              tool_calls: [
                {
                  index: 0,
                  id: "call_structured_response",
                  type: "function",
                  function: {
                    name: STRUCTURED_RESPONSE_TOOL,
                  },
                },
              ],
            },
            model: args.model,
          }),
        ),
      );

      controller.enqueue(
        toSseChunk(
          toChunkPayload({
            delta: {
              tool_calls: [
                {
                  index: 0,
                  function: {
                    arguments: JSON.stringify(toolArgs),
                  },
                },
              ],
            },
            model: args.model,
          }),
        ),
      );

      controller.enqueue(
        toSseChunk(
          toChunkPayload({
            finishReason: "tool_calls",
            model: args.model,
          }),
        ),
      );
      controller.enqueue(toDoneChunk());
      controller.close();
    },
  });
}

function buildStopStream(model: string) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(
        toSseChunk(
          toChunkPayload({
            finishReason: "stop",
            model,
          }),
        ),
      );
      controller.enqueue(toDoneChunk());
      controller.close();
    },
  });
}

/**
 * WHY:   The mobile chat host needs one OpenAI-compatible SSE endpoint without exposing provider secrets in the app.
 * WHAT:  Bridges the existing public assistant actions into a streamed `/chat/completions` response for mobile.
 * HOW:   Reuses the current authenticated/guest public assistant actions, then serializes the structured result as OpenAI-style SSE chunks plus one synthetic tool call.
 */
export async function handleMobileAssistantStream(ctx: ActionCtx, request: Request) {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  let body: StreamRequestBody;
  try {
    body = (await request.json()) as StreamRequestBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  const model = getAgentLLMConfigSafe("anan")?.model ?? "anan-mobile-assistant";

  if (isStructuredToolFollowup(body.messages)) {
    return new Response(buildStopStream(model), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  const metadata = body.metadata;
  const message = metadata?.message?.trim();
  if (!message) {
    return jsonResponse({ error: "metadata.message is required." }, 400);
  }

  const hasAuthorization = Boolean(request.headers.get("authorization")?.trim());

  try {
    const result = hasAuthorization
      ? await ctx.runAction(api.ai_zone.assistantPublic.sendAuthenticatedMessage as any, {
          message,
          threadId: metadata?.threadId,
          startFresh: metadata?.startFresh,
          inputMode: metadata?.inputMode,
          locale: metadata?.locale,
          qualification: metadata?.qualification,
          selectedPropertyId: metadata?.selectedPropertyId,
          selectedPropertyIds: metadata?.selectedPropertyIds,
        })
      : await ctx.runAction(api.ai_zone.assistantPublic.sendMessage as any, {
          guestId: metadata?.guestId,
          channelSessionToken: metadata?.channelSessionToken,
          message,
          threadId: metadata?.threadId,
          startFresh: metadata?.startFresh,
          inputMode: metadata?.inputMode,
          locale: metadata?.locale,
          qualification: metadata?.qualification,
          selectedPropertyId: metadata?.selectedPropertyId,
          selectedPropertyIds: metadata?.selectedPropertyIds,
        });

    return new Response(buildStructuredResponseStream({ result, model }), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const message = error instanceof Error && error.message.trim() ? error.message : "Assistant stream failed.";
    return jsonResponse({ error: message }, 500);
  }
}
