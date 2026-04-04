/**
 * WHY:   The full market zone should stay visibly under development without removing the real analytics UI underneath.
 * WHAT:  Renders a centered overlay card used across all market routes while the underlying content remains blurred.
 * HOW:   Accepts the current route title so the message stays relevant no matter which market page is open.
 */
export default function MarketUnderDevelopmentOverlay({
  pageTitle,
}: {
  pageTitle: string;
}) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl rounded-xl border border-amber-200 bg-white/95 p-5 shadow-xl backdrop-blur-sm dark:border-amber-500/30 dark:bg-slate-950/95 md:p-6">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-right dark:border-amber-500/30 dark:bg-amber-500/10">
            <div className="text-sm font-semibold text-amber-900 dark:text-amber-200">Market marker</div>
            <p className="mt-2 text-sm leading-6 text-amber-800 dark:text-amber-100">
              جميع صفحات ذكاء السوق معروضة الآن كواجهة قيد التطوير. المحتوى الحقيقي ما زال موجوداً خلف هذه الطبقة ويمكن تفعيله لاحقاً
              عبر إزالة هذا الـ overlay فقط.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-right dark:border-slate-800 dark:bg-slate-900">
            <div className="text-sm font-semibold text-slate-950 dark:text-slate-100">الصفحة الحالية</div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">{pageTitle}</div>
            <div className="mt-4 text-sm font-semibold text-slate-950 dark:text-slate-100">جاهز لاحقاً</div>
            <div className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <div>تحليل المدن</div>
              <div>المناطق الساخنة</div>
              <div>نتائج السوق</div>
              <div>مساعد الكلمات</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
