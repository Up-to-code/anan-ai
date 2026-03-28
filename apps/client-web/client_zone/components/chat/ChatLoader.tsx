import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { AnanBrandMark } from "./AnanBrandMark";
import { ClientAssistantColumn } from "./chatLayout";

/**
 * WHY:   The assistant needs a small in-thread loading state while a reply is being prepared.
 * WHAT:  Renders a compact loader placeholder.
 * HOW:   Reuses the Anan brand mark so loading feels like part of the assistant identity.
 */
export function ChatLoader() {
  const { dictionary } = useLocaleDictionary();

  return (
    <ClientAssistantColumn>
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[22px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] shadow-sm">
          <AnanBrandMark state="thinking" className="h-10 w-10" />
        </div>
        <div className="rounded-[24px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--workspace-muted)]" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--workspace-muted)] [animation-delay:120ms]" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--workspace-muted)] [animation-delay:240ms]" />
            </div>
            <span className="text-sm font-medium text-[var(--workspace-muted)]">
              {dictionary.app.loading}
            </span>
          </div>
        </div>
      </div>
    </ClientAssistantColumn>
  );
}
