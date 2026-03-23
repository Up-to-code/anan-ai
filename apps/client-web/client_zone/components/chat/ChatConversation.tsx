import { cn } from "@/lib/utils";

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
    <section className={cn("flex-1 overflow-y-auto", className)}>
      <div
        className={cn("mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-3 py-6 sm:px-4 sm:py-8", contentClassName)}
        style={contentStyle}
      >
        {children}
      </div>
    </section>
  );
}
