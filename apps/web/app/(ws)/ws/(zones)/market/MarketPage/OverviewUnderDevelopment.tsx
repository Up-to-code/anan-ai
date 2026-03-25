import type { WorkspaceMarketPageModel } from "../marketTypes";
import MarketPanel from "./MarketPanel";
import OverviewTab from "./OverviewTab";

/**
 * WHY:   The market overview needs a temporary placeholder while the team decides when to expose the full dashboard.
 * WHAT:  Renders an under-development marker for `/ws/market` while preserving all underlying overview code for later restoration.
 * HOW:   Uses the current market model only for context labels and points users toward the ready sub-pages.
 */
export default function OverviewUnderDevelopment({ model }: { model: WorkspaceMarketPageModel }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <div className="pointer-events-none select-none opacity-35 blur-[5px]">
        <div className="p-4 md:p-6">
          <OverviewTab model={model} />
        </div>
      </div>

      <div className="absolute inset-0 bg-white/35 backdrop-blur-[2px]" />

      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-5xl">
          <MarketPanel
            title="نظرة عامة قيد التطوير"
            description="صفحة الملخص الرئيسية محفوظة في الكود، لكننا نخفيها مؤقتاً حتى نكون جاهزين لإطلاقها بشكل كامل."
          >
            <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-right">
                <div className="text-sm font-semibold text-amber-900">Overview marker</div>
                <p className="mt-2 text-sm leading-6 text-amber-800">
                  هذه الشاشة مؤقتة فقط. عند إزالة هذا المكوّن من مسار <span className="font-medium">/ws/market</span> ستعود لوحة
                  الملخص الحقيقية مباشرة بدون الحاجة لإعادة بناء البيانات أو المكوّنات.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-right">
                <div className="text-sm font-semibold text-slate-950">النطاق الحالي</div>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <div>المدينة/النطاق: {model.scopeLabel}</div>
                  <div>الفترة: {model.dateRange.label}</div>
                  <div>الأكثر بحثاً: {model.keywordInsights.mostResearchedLabel ?? "لا توجد إشارة واضحة"}</div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <div className="rounded-md border border-slate-200 bg-white px-4 py-3 text-right">
                <div className="text-xs text-slate-400">المدن</div>
                <div className="mt-1 text-sm font-medium text-slate-950">مقارنة المدن الجاهزة</div>
              </div>
              <div className="rounded-md border border-slate-200 bg-white px-4 py-3 text-right">
                <div className="text-xs text-slate-400">المناطق</div>
                <div className="mt-1 text-sm font-medium text-slate-950">المناطق الساخنة جاهزة</div>
              </div>
              <div className="rounded-md border border-slate-200 bg-white px-4 py-3 text-right">
                <div className="text-xs text-slate-400">النتائج</div>
                <div className="mt-1 text-sm font-medium text-slate-950">نتائج السوق جاهزة</div>
              </div>
              <div className="rounded-md border border-slate-200 bg-white px-4 py-3 text-right">
                <div className="text-xs text-slate-400">الكلمات</div>
                <div className="mt-1 text-sm font-medium text-slate-950">مساعد الكلمات جاهز</div>
              </div>
            </div>
          </MarketPanel>
        </div>
      </div>
    </div>
  );
}
