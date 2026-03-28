"use client";

import Link from "next/link";

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-slate-50 px-6 py-12 dark:bg-slate-950">
      <div className="w-full max-w-xl border border-slate-200 bg-white p-6 text-right dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-lg font-black text-slate-950 dark:text-slate-100">حدث خطأ أثناء تحميل مساحة العمل.</h1>
        <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          حاول إعادة المحاولة أو الرجوع إلى الصفحة الرئيسية لمساحة العمل.
        </p>
        {error?.message ? (
          <div className="mt-4 border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
            {error.message}
          </div>
        ) : null}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="border border-blue-600 bg-blue-600 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:border-slate-950 hover:bg-slate-950"
          >
            إعادة المحاولة
          </button>
          <Link
            href="/ws"
            className="border border-slate-200 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-700 transition hover:border-slate-950 hover:text-slate-950 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-100"
          >
            العودة إلى مساحة العمل
          </Link>
        </div>
      </div>
    </div>
  );
}
