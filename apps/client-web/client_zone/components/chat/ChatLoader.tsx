import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { AnanBrandMark } from "./AnanBrandMark";

/**
 * WHY:   The assistant needs a small in-thread loading state while a reply is being prepared.
 * WHAT:  Renders a compact loader placeholder.
 * HOW:   Reuses the Anan brand mark so loading feels like part of the assistant identity.
 */
export function ChatLoader() {
  const { dictionary } = useLocaleDictionary();

  return (
    <div className="mx-auto flex w-full max-w-[820px] items-center gap-3 py-2">
      <AnanBrandMark state="thinking" />
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:120ms]" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:240ms]" />
        </div>
        <span className="text-sm text-slate-500">{dictionary.app.loading}</span>
      </div>
    </div>
  );
}
