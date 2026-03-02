export type AssistantMode = "qa" | "action";

export type AssistantMessage = {
  _id: string;
  role: "user" | "assistant";
  content: string;
  mode: AssistantMode;
  createdAt: number;
  sources?: { href: string; title: string }[];
  reasoning?: string;
  toolEvents?: {
    name: string;
    status: "pending" | "running" | "succeeded" | "failed";
    result?: string;
    error?: string;
  }[];
  streamState?: "streaming" | "done" | "error";
};
