import { cn } from "@/lib/utils";

/**
 * WHY:   User messages should stay compact even after assistant turns become long-form document sections.
 * WHAT:  Renders the user-side message bubble used in the upgraded thread.
 * HOW:   Keeps alignment and width tight so the assistant content remains the visual focus.
 */
export function ChatMessage({
  role,
  children,
}: {
  role: "assistant" | "user";
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex w-full", role === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[min(100%,42rem)] px-5 py-4 text-[15px] leading-7 shadow-sm",
          role === "user"
            ? "rounded-t-[30px] rounded-bl-[14px] rounded-br-[30px] bg-[var(--workspace-bubble-self)] text-[var(--workspace-bubble-self-foreground)]"
            : "rounded-[28px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] text-[var(--workspace-bubble-other-foreground)]",
        )}
      >
        {children}
      </div>
    </div>
  );
}
