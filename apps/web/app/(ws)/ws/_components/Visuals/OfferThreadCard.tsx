import type { OfferThreadItem } from "../../_lib/entities";

function resolveStatusTone(status: OfferThreadItem["status"]) {
  if (status === "approved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300";
  }
  if (status === "awaiting-response") {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300";
  }
  if (status === "completed") {
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300";
  }
  return "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
}

function ThreadCounterpartyBadge({ thread }: { thread: OfferThreadItem }) {
  return (
    <span className="whitespace-nowrap border border-slate-200 px-2 py-0.5 text-[10px] font-black tracking-widest text-slate-400 dark:border-slate-700 dark:text-slate-500">
      إلى: {thread.recipient.name}
    </span>
  );
}

function ThreadHeader({ thread }: { thread: OfferThreadItem }) {
  return (
    <div className="flex items-center gap-3 mb-1">
      <h3 className="truncate text-base font-black text-slate-950 dark:text-slate-100">{thread.sender.name}</h3>
      <ThreadCounterpartyBadge thread={thread} />
    </div>
  );
}

function ThreadStatusPanel({
  thread,
  statusTone,
}: {
  thread: OfferThreadItem;
  statusTone: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className={`border px-3 py-1 text-[10px] font-black tracking-widest ${statusTone}`}>
        {thread.status}
      </div>
      <div className="bg-slate-100 px-2 py-1 text-[11px] font-black tracking-widest text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        المشروع: <span className="text-slate-700 dark:text-slate-200">{thread.relation.project?.title ?? "غير محدد"}</span>
      </div>
    </div>
  );
}

/**
 * WHY:   The offers inbox should represent sender-recipient threads instead of generic task cards.
 * WHAT:  Renders one compact offer thread with direction, linked project or unit, status, and next action.
 * HOW:   Uses a dense 300px-friendly card shell so inbox browsing stays operational rather than document-heavy.
 */
export default function OfferThreadCard({
  thread,
}: {
  thread: OfferThreadItem;
}) {
  const statusTone = resolveStatusTone(thread.status);

  return (
    <article className="group flex cursor-pointer flex-col gap-4 border-b border-slate-100 bg-white p-6 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-5 sm:items-start w-full max-w-2xl">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-slate-100 text-lg font-black text-slate-600 shadow-none dark:bg-slate-800 dark:text-slate-200">
          {(thread.sender.name || "U").slice(0, 1).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <ThreadHeader thread={thread} />
          <h4 className="mb-2 truncate text-sm font-bold text-slate-800 dark:text-slate-200">{thread.subject}</h4>
          <p className="line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            &quot;{thread.summary}&quot;
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-start gap-4 sm:items-end w-full sm:w-auto pt-1 sm:pt-0">
        <ThreadStatusPanel thread={thread} statusTone={statusTone} />

        <div className="w-full flex sm:justify-end mt-2">
          <button className="border-2 border-slate-200 bg-white px-5 py-2 text-xs font-black tracking-widest text-slate-700 transition group-hover:bg-blue-50 hover:border-blue-600 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:group-hover:bg-blue-500/10 dark:hover:border-blue-500 dark:hover:text-blue-300">
            فتح المحادثة
          </button>
        </div>
      </div>
    </article>
  );
}
