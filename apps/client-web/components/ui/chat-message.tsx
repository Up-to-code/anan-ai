import { cn } from "@/lib/utils";
import { MarkdownContent } from "./markdown-content";
import { type BuyerAssistantMessage } from "@anan/client-assistant";

interface ChatMessageProps {
  message: BuyerAssistantMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={cn(
        "flex w-full mb-4 animate-zone-page-enter",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
          isAssistant
            ? "bg-muted text-foreground rounded-tl-none"
            : "bg-primary text-primary-foreground rounded-tr-none shadow-sm"
        )}
      >
        <MarkdownContent content={message.text} />
      </div>
    </div>
  );
}
