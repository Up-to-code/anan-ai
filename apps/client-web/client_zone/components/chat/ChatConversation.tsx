import { cn } from "@/lib/utils";
import { ClientAssistantColumn } from "./chatLayout";

/**
 * WHY:   The redesign needs one dedicated scrollable thread container with chat-friendly width and spacing.
 * WHAT:  Wraps the conversation messages region.
 * HOW:   Centers content and leaves room for the sticky prompt input below.
 */
export function ChatConversation({
  children,
  className,
  contentClassName,
  contentStyle,
}: {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  contentStyle?: React.CSSProperties;
}) {
  return (
    <section
      data-testid="client-assistant-thread"
      className={cn(
        "min-h-0 flex-1 overflow-y-auto bg-[var(--workspace-canvas)] px-4 sm:px-6 lg:px-8",
        className,
      )}
    >
      <ClientAssistantColumn
        className={cn(
          "flex w-full flex-col gap-10 pt-8 pb-6 sm:gap-12 sm:pt-10",
          contentClassName,
        )}
        style={contentStyle}
      >
        {children}
      </ClientAssistantColumn>
    </section>
  );
}
