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
          "max-w-[min(85%,720px)] rounded-2xl px-4 py-3 text-sm leading-7",
          role === "user"
            ? "bg-slate-900 text-white"
            : "bg-transparent text-slate-800",
        )}
      >
        {children}
      </div>
    </div>
  );
}
