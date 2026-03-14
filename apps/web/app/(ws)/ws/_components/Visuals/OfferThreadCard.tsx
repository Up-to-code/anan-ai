import type { OfferThreadItem } from "../../_lib/entities";

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
  const isApproved = thread.status === "approved";
  const isCompleted = thread.status === "completed";
  const isPending = thread.status === "awaiting-response";

  const statusTone = isApproved
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : isPending
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : isCompleted
        ? "border-blue-200 bg-blue-50 text-blue-700"
        : "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <article className="group flex flex-col gap-4 border-b border-slate-100 bg-white p-6 transition hover:bg-slate-50 sm:flex-row sm:items-start sm:justify-between cursor-pointer">
      <div className="flex items-start gap-5 sm:items-start w-full max-w-2xl">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-slate-100 text-lg font-black text-slate-600 shadow-none">
          {(thread.sender.name || "U").slice(0, 1).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-base font-black text-slate-950 truncate">{thread.sender.name}</h3>
            <span className="text-[10px] font-black tracking-widest text-slate-400 border border-slate-200 px-2 py-0.5 whitespace-nowrap">
              إلى: {thread.recipient.name}
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-800 mb-2 truncate">{thread.subject}</h4>
          <p className="text-sm leading-6 text-slate-500 line-clamp-2">
            &quot;{thread.summary}&quot;
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-start gap-4 sm:items-end w-full sm:w-auto pt-1 sm:pt-0">
        <div className="flex items-center gap-2">
          <div className={`border px-3 py-1 text-[10px] font-black tracking-widest ${statusTone}`}>
            {thread.status}
          </div>
          <div className="text-[11px] font-black tracking-widest text-slate-400 bg-slate-100 px-2 py-1">
            المشروع: <span className="text-slate-700">{thread.relation.project?.title ?? "غير محدد"}</span>
          </div>
        </div>

        <div className="w-full flex sm:justify-end mt-2">
          <button className="border-2 border-slate-200 bg-white px-5 py-2 text-xs font-black tracking-widest text-slate-700 hover:border-blue-600 hover:text-blue-600 transition group-hover:bg-blue-50">
            فتح المحادثة
          </button>
        </div>
      </div>
    </article>
  );
}
