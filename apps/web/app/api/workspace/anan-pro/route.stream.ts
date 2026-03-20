import { DomainError } from "@/server/contracts/errors";
import {
  listAnanProStreamEvents,
  sendAnanProMessage,
} from "@/server/domains/ananPro/service";
import { delay, serializeSseEvent } from "./route.helpers";

type StreamEvent = Awaited<ReturnType<typeof listAnanProStreamEvents>>[number];
type SendMessageInput = Parameters<typeof sendAnanProMessage>[0];
type SendMessageResult = Awaited<ReturnType<typeof sendAnanProMessage>>;

type StreamState = {
  afterSeq: number;
  emittedThread: boolean;
  emittedAssistantMeta: boolean;
};

function enqueue(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  event: string,
  payload: unknown,
) {
  controller.enqueue(encoder.encode(serializeSseEvent(event, payload)));
}

function emitStageEvent(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  event: StreamEvent,
) {
  if (!event.phase) return;
  enqueue(controller, encoder, "meta", {
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
  });
}

function emitLifecycleEvent(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  streamSessionId: string,
  event: StreamEvent,
) {
  enqueue(controller, encoder, "meta", {
    type: "lifecycle",
    lifecycle: {
      sessionId: streamSessionId,
      status: event.status,
      details: event.details,
      timestamp: event.timestamp,
    },
  });
}

function emitErrorEvent(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  event: StreamEvent,
) {
  enqueue(controller, encoder, "error", {
    code: event.code ?? "INTERNAL_SERVER_ERROR",
    message: event.message ?? "تعذر إرسال الرسالة.",
    status: 500,
  });
}

function emitStreamEvent(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  streamSessionId: string,
  state: StreamState,
  event: StreamEvent,
): StreamState {
  const nextState: StreamState = {
    afterSeq: Math.max(state.afterSeq, event.seq),
    emittedThread: state.emittedThread,
    emittedAssistantMeta: state.emittedAssistantMeta,
  };
  if (event.eventType === "stage") emitStageEvent(controller, encoder, event);
  if (event.eventType === "delta") enqueue(controller, encoder, "delta", { text: event.delta ?? "" });
  if (event.eventType === "thread" && event.threadId) {
    nextState.emittedThread = true;
    enqueue(controller, encoder, "thread", { threadId: event.threadId, title: event.title ?? null });
  }
  if (event.eventType === "assistant_meta") {
    nextState.emittedAssistantMeta = true;
    enqueue(controller, encoder, "meta", { type: "assistant_meta", meta: event.meta });
  }
  if (event.eventType === "lifecycle") emitLifecycleEvent(controller, encoder, streamSessionId, event);
  if (event.eventType === "error") emitErrorEvent(controller, encoder, event);
  return nextState;
}

async function pollAndEmitEvents(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  streamSessionId: string,
  state: StreamState,
  limit: number,
) {
  const events = await listAnanProStreamEvents({
    sessionId: streamSessionId,
    afterSeq: state.afterSeq,
    limit,
  });
  return events.reduce(
    (current, event) => emitStreamEvent(controller, encoder, streamSessionId, current, event),
    state,
  );
}

async function waitForCompletion(sendPromise: Promise<SendMessageResult>) {
  return Promise.race([
    sendPromise.then((thread) => ({ done: true as const, thread })),
    delay(170).then(() => ({ done: false as const })),
  ]);
}

function findLatestAssistantMessage(thread: SendMessageResult) {
  return [...thread.messages].reverse().find((message) => message.role === "assistant");
}

function emitThreadFallback(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  state: StreamState,
  thread: SendMessageResult,
) {
  if (state.emittedThread) return;
  enqueue(controller, encoder, "thread", { threadId: thread.id, title: thread.title ?? null });
}

function emitAssistantMetaFallback(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  state: StreamState,
  thread: SendMessageResult,
) {
  if (state.emittedAssistantMeta) return;
  const assistantMessage = findLatestAssistantMessage(thread);
  if (!assistantMessage?.meta) return;
  enqueue(controller, encoder, "meta", { type: "assistant_meta", meta: assistantMessage.meta });
}

async function runStreamSession(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  streamSessionId: string,
  sendPromise: Promise<SendMessageResult>,
) {
  let state: StreamState = { afterSeq: 0, emittedThread: false, emittedAssistantMeta: false };
  while (true) {
    state = await pollAndEmitEvents(controller, encoder, streamSessionId, state, 64);
    const settled = await waitForCompletion(sendPromise);
    if (!settled.done) continue;
    state = await pollAndEmitEvents(controller, encoder, streamSessionId, state, 128);
    emitThreadFallback(controller, encoder, state, settled.thread);
    emitAssistantMetaFallback(controller, encoder, state, settled.thread);
    enqueue(controller, encoder, "done", { thread: settled.thread });
    return;
  }
}

function normalizeStreamError(error: unknown) {
  if (error instanceof DomainError) {
    return { code: error.code, message: error.message, status: error.status };
  }
  return { code: "INTERNAL_SERVER_ERROR", message: "تعذر إرسال الرسالة.", status: 500 };
}

async function startAnanProStream(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  data: SendMessageInput,
) {
  try {
    const streamSessionId = data.streamSessionId ?? crypto.randomUUID();
    const sendPromise = sendAnanProMessage({ ...data, streamSessionId });
    await runStreamSession(controller, encoder, streamSessionId, sendPromise);
  } catch (error) {
    enqueue(controller, encoder, "error", normalizeStreamError(error));
  } finally {
    controller.close();
  }
}

export function createAnanProMessageStream(data: SendMessageInput) {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      void startAnanProStream(controller, encoder, data);
    },
  });
}
