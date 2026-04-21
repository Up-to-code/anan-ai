import React, { useCallback, useMemo, useRef } from "react";
import EventSource from "react-native-sse";
import { isReactElement, useChat } from "react-native-gen-ui";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { getMobileAssistantStreamBaseUrl } from "@/lib/mobileEnv";
import type { MobileLocale } from "@/lib/locale";
import type { MobileAssistantCard, MobileProperty } from "@/types/mobile";

type StreamSubmitArgs = {
  message: string;
  threadId?: string | null;
  startFresh?: boolean;
  inputMode?: "text" | "voice";
  locale: MobileLocale;
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

export type StructuredAssistantStreamTurn = {
  message: string;
  properties: MobileProperty[];
  cards: MobileAssistantCard[];
  suggestedPrompts: string[];
  activePropertyId?: string;
  requiresAuthForHandoff: boolean;
  threadId?: string;
  comparisonArtifactId?: string;
  comparisonPropertyIds?: string[];
  selectionSource?: "ui_selected" | "history_resolved" | "text_resolved";
};

type ChatCompletionCallbacks = {
  onChunkReceived?: (messages: Array<any>) => void;
  onError?: (error: Error) => void;
  onDone?: (messages: Array<any>) => void;
};

const structuredTurnToolSchema = z.object({
  message: z.string(),
  properties: z.array(z.any()).default([]),
  cards: z.array(z.any()).default([]),
  suggestedPrompts: z.array(z.string()).default([]),
  activePropertyId: z.string().optional(),
  requiresAuthForHandoff: z.boolean().default(false),
  threadId: z.string().optional(),
  comparisonArtifactId: z.string().optional(),
  comparisonPropertyIds: z.array(z.string()).optional(),
  selectionSource: z.enum(["ui_selected", "history_resolved", "text_resolved"]).optional(),
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractStreamingAssistantText(messages: Array<any>) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const candidate = messages[index];
    if (isReactElement(candidate)) continue;
    if (candidate?.role === "assistant" && typeof candidate.content === "string") {
      return candidate.content;
    }
  }
  return "";
}

class MobileAssistantStreamCompletion {
  private readonly basePath: string;
  private readonly getRequestMeta: () => StreamSubmitArgs | null;
  private readonly getAuthToken: () => Promise<string | null>;
  private readonly params: {
    messages: Array<any>;
    tools?: Record<string, any>;
  };
  private readonly callbacks: ChatCompletionCallbacks;
  private eventSource: EventSource<string> | null = null;
  private newMessage = "";
  private newToolCall = {
    name: "",
    arguments: "",
  };
  private toolCallResult: unknown = null;
  private toolRenderResult: React.ReactElement | null = null;
  finished = false;

  constructor(args: {
    basePath: string;
    getRequestMeta: () => StreamSubmitArgs | null;
    getAuthToken: () => Promise<string | null>;
    params: {
      messages: Array<any>;
      tools?: Record<string, any>;
    };
    callbacks: ChatCompletionCallbacks;
  }) {
    this.basePath = args.basePath;
    this.getRequestMeta = args.getRequestMeta;
    this.getAuthToken = args.getAuthToken;
    this.params = args.params;
    this.callbacks = args.callbacks;
  }

  start() {
    void this.startInternal();
  }

  private async startInternal() {
    const metadata = this.getRequestMeta();
    if (!metadata) {
      this.callbacks.onError?.(new Error("Missing mobile assistant stream metadata."));
      return;
    }

    const authToken = await this.getAuthToken().catch(() => null);
    this.eventSource = new EventSource(`${this.basePath}/chat/completions`, {
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      pollingInterval: 0,
      method: "POST",
      body: JSON.stringify({
        messages: this.params.messages,
        metadata,
      }),
    });

    this.eventSource.addEventListener("message", this.handleNewChunk.bind(this));
    this.eventSource.addEventListener("error", (event: any) => {
      const message = event?.message || "Assistant streaming failed.";
      this.callbacks.onError?.(new Error(message));
    });
    this.eventSource.addEventListener("exception", (event: any) => {
      const message = event?.message || "Assistant streaming failed.";
      this.callbacks.onError?.(new Error(message));
    });
  }

  private handleNewChunk(event: { data?: string | null }) {
    if (event.data === "[DONE]") {
      this.eventSource?.close();
      return;
    }

    if (!event.data) {
      this.callbacks.onError?.(new Error("Empty assistant stream chunk received."));
      return;
    }

    const payload = JSON.parse(event.data);
    const firstChoice = payload?.choices?.[0];
    if (!firstChoice) {
      return;
    }

    if (firstChoice.finish_reason === "tool_calls") {
      void this.handleToolCall();
      return;
    }

    if (firstChoice.finish_reason === "stop") {
      this.callbacks.onDone?.([
        {
          content: this.newMessage,
          role: "assistant",
        },
      ]);
      this.finished = true;
      return;
    }

    if (typeof firstChoice?.delta?.content === "string") {
      this.newMessage += firstChoice.delta.content;
      this.notifyChunksReceived();
      return;
    }

    const toolCall = firstChoice?.delta?.tool_calls?.[0];
    if (toolCall?.function?.name) {
      this.newToolCall.name += toolCall.function.name;
    }
    if (toolCall?.function?.arguments) {
      this.newToolCall.arguments += toolCall.function.arguments;
    }
  }

  private getMessages() {
    const messages: Array<any> = [];
    if (this.newMessage) {
      messages.push({
        role: "assistant",
        content: this.newMessage,
      });
    }
    if (this.toolRenderResult) {
      messages.push(this.toolRenderResult);
    }
    if (this.toolCallResult != null) {
      messages.push({
        role: "function",
        name: this.newToolCall.name,
        content: JSON.stringify(this.toolCallResult),
      });
    }
    return messages;
  }

  private notifyChunksReceived() {
    this.callbacks.onChunkReceived?.(this.getMessages());
  }

  private async handleToolCall() {
    if (!this.newToolCall.name || !this.params.tools?.[this.newToolCall.name]) {
      this.callbacks.onError?.(new Error("Assistant requested an unknown mobile tool."));
      return;
    }

    const chosenTool = this.params.tools[this.newToolCall.name];
    const rawArgs = JSON.parse(this.newToolCall.arguments || "{}");
    const parsedArgs = chosenTool.parameters.parse(rawArgs);
    const rendered = chosenTool.render(parsedArgs);

    if (React.isValidElement(rendered)) {
      this.toolRenderResult = rendered;
    } else {
      this.toolRenderResult = rendered?.component ?? null;
      this.toolCallResult = rendered?.data ?? null;
    }

    this.notifyChunksReceived();
    await this.streamRecursiveAfterToolCall();
    this.finished = true;
  }

  private async streamRecursiveAfterToolCall() {
    const nextCompletion = new MobileAssistantStreamCompletion({
      basePath: this.basePath,
      getRequestMeta: this.getRequestMeta,
      getAuthToken: this.getAuthToken,
      params: {
        ...this.params,
        messages: [...this.params.messages, ...this.getMessages()],
      },
      callbacks: {
        ...this.callbacks,
        onChunkReceived: (messages) => {
          this.callbacks.onChunkReceived?.([...this.getMessages(), ...messages]);
        },
        onDone: (messages) => {
          this.callbacks.onDone?.([...this.getMessages(), ...messages]);
        },
      },
    });

    nextCompletion.start();
    while (!nextCompletion.finished) {
      await sleep(100);
    }
  }
}

class MobileAssistantGenUiClient {
  private readonly basePath: string;
  private readonly getRequestMeta: () => StreamSubmitArgs | null;
  private readonly getAuthToken: () => Promise<string | null>;

  constructor(args: {
    basePath: string;
    getRequestMeta: () => StreamSubmitArgs | null;
    getAuthToken: () => Promise<string | null>;
  }) {
    this.basePath = args.basePath;
    this.getRequestMeta = args.getRequestMeta;
    this.getAuthToken = args.getAuthToken;
  }

  async createChatCompletion(
    params: {
      messages: Array<any>;
      tools?: Record<string, any>;
    },
    callbacks: ChatCompletionCallbacks,
  ) {
    const completion = new MobileAssistantStreamCompletion({
      basePath: this.basePath,
      getRequestMeta: this.getRequestMeta,
      getAuthToken: this.getAuthToken,
      params,
      callbacks,
    });
    completion.start();
    return completion;
  }
}

/**
 * WHY:   The mobile assistant needs one generated-UI transport layer without letting the library own persistence or thread history.
 * WHAT:  Streams assistant turns through `react-native-gen-ui` and resolves the final structured turn payload for the mobile store.
 * HOW:   Uses a custom SSE client pointed at the Convex HTTP stream route, captures the synthetic structured-response tool call, and exposes the live assistant text separately for optimistic rendering.
 */
export function useMobileAssistantGenUiTransport() {
  const { data: session } = authClient.useSession();
  const basePath = getMobileAssistantStreamBaseUrl();
  const requestMetaRef = useRef<StreamSubmitArgs | null>(null);
  const pendingResolveRef = useRef<((value: StructuredAssistantStreamTurn) => void) | null>(null);
  const pendingRejectRef = useRef<((reason?: unknown) => void) | null>(null);
  const structuredTurnRef = useRef<StructuredAssistantStreamTurn | null>(null);

  const transport = useMemo(() => {
    if (!basePath) return null;
    return new MobileAssistantGenUiClient({
      basePath,
      getRequestMeta: () => requestMetaRef.current,
      getAuthToken: async () => {
        if (!session?.session) return null;
        const { data } = await authClient.convex.token({ fetchOptions: { throw: false } });
        return data?.token ?? null;
      },
    });
  }, [basePath, session?.session]);

  const chat = useChat({
    openAi: transport as any,
    onError: (error) => {
      pendingRejectRef.current?.(error);
      pendingResolveRef.current = null;
      pendingRejectRef.current = null;
    },
    onSuccess: () => {
      const structuredTurn = structuredTurnRef.current;
      if (!structuredTurn) {
        pendingRejectRef.current?.(new Error("The mobile assistant finished without a structured turn payload."));
      } else {
        pendingResolveRef.current?.(structuredTurn);
      }
      pendingResolveRef.current = null;
      pendingRejectRef.current = null;
    },
    tools: {
      render_structured_response: {
        description: "Captures and renders the final structured mobile assistant turn.",
        parameters: structuredTurnToolSchema,
        render: (args: StructuredAssistantStreamTurn) => {
          structuredTurnRef.current = {
            message: args.message,
            properties: args.properties ?? [],
            cards: args.cards ?? [],
            suggestedPrompts: args.suggestedPrompts ?? [],
            activePropertyId: args.activePropertyId,
            requiresAuthForHandoff: args.requiresAuthForHandoff,
            threadId: args.threadId,
            comparisonArtifactId: args.comparisonArtifactId,
            comparisonPropertyIds: args.comparisonPropertyIds,
            selectionSource: args.selectionSource,
          };
          return {
            data: structuredTurnRef.current,
            component: React.createElement(React.Fragment),
          };
        },
      },
    },
  });

  const submitTurn = useCallback(
    async (args: StreamSubmitArgs) => {
      if (!transport) {
        throw new Error("Mobile assistant streaming is unavailable because the Convex site URL is missing.");
      }

      requestMetaRef.current = args;
      structuredTurnRef.current = null;

      return new Promise<StructuredAssistantStreamTurn>((resolve, reject) => {
        pendingResolveRef.current = resolve;
        pendingRejectRef.current = reject;
        void chat.handleSubmit(args.message);
      });
    },
    [chat, transport],
  );

  return {
    submitTurn,
    isStreaming: chat.isLoading || chat.isStreaming,
    streamingText: extractStreamingAssistantText(chat.messages),
  };
}
