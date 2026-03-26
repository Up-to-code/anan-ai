"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type DealFormData = {
  name: string;
  phone: string;
  budget: string;
  preference: string;
  propertyId: string;
  nextFollowUpAt: string;
  stage: "new" | "contacted" | "negotiation" | "won" | "lost";
  notes: string;
};

type DealPropertyOption = {
  id: string;
  title: string;
  location: string;
};

const DEAL_STAGE_OPTIONS: Array<{ value: DealFormData["stage"]; label: string }> = [
  { value: "new", label: "جديد" },
  { value: "contacted", label: "تم التواصل" },
  { value: "negotiation", label: "مفاوضة" },
  { value: "won", label: "مغلقة" },
  { value: "lost", label: "خسارة" },
];

/**
 * WHY:   CRM create/edit pages need one client-side screen that can submit server actions and keep the workspace UX consistent.
 * WHAT:  Renders the deal fields shared between create and edit, plus an optional archive action.
 * HOW:   Stores form state locally, calls the provided server actions, and redirects using the returned workspace paths.
 */
export default function DealFormScreen({
  pageTitle,
  pageDescription,
  submitLabel,
  cancelHref,
  properties,
  initialData,
  onSubmit,
  onArchive,
}: {
  pageTitle: string;
  pageDescription: string;
  submitLabel: string;
  cancelHref: string;
  properties: DealPropertyOption[];
  initialData: DealFormData;
  onSubmit: (data: DealFormData) => Promise<{ redirectTo: string }>;
  onArchive?: () => Promise<{ redirectTo: string }>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [archivePending, startArchiveTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<DealFormData>(initialData);

  return (
    <div className="flex min-h-full flex-col">
      <div className="mx-auto w-full max-w-2xl px-6 py-12 lg:px-10 lg:py-16">
        <div className="rounded-3xl border border-border bg-card p-8 md:p-10 shadow-xl shadow-black/[0.02]">
          <div className="space-y-1 text-right">
            <h1 className="text-2xl font-black tracking-tight text-foreground">{pageTitle}</h1>
            <p className="text-[14px] font-medium text-muted-foreground">{pageDescription}</p>
          </div>

          <form
            className="mt-8 grid gap-8"
            onSubmit={(event) => {
              event.preventDefault();
              setError(null);
              startTransition(async () => {
                try {
                  const result = await onSubmit(form);
                  router.push(result.redirectTo);
                } catch (submitError) {
                  setError(submitError instanceof Error ? submitError.message : "تعذر حفظ الصفقة الآن.");
                }
              });
            }}
          >
            <div className="space-y-6">
              <div>
                <label className="mb-2.5 block text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">اسم العميل</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  required
                  className="w-full rounded-xl border border-border/40 bg-muted/10 px-4 py-3.5 text-[15px] font-bold text-foreground outline-none transition-all focus:border-foreground/20 focus:bg-muted/20"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2.5 block text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">رقم الهاتف</label>
                  <input
                    value={form.phone}
                    onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                    className="w-full rounded-xl border border-border/40 bg-muted/10 px-4 py-3.5 text-[15px] font-bold text-foreground outline-none transition-all focus:border-foreground/20 focus:bg-muted/20"
                  />
                </div>
                <div>
                  <label className="mb-2.5 block text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">الميزانية</label>
                  <input
                    value={form.budget}
                    onChange={(event) => setForm((current) => ({ ...current, budget: event.target.value }))}
                    className="w-full rounded-xl border border-border/40 bg-muted/10 px-4 py-3.5 text-[15px] font-bold text-foreground outline-none transition-all focus:border-foreground/20 focus:bg-muted/20"
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2.5 block text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">المرحلة</label>
                  <select
                    value={form.stage}
                    onChange={(event) => setForm((current) => ({ ...current, stage: event.target.value as DealFormData["stage"] }))}
                    className="w-full rounded-xl border border-border/40 bg-muted/10 px-4 py-3.5 text-[15px] font-bold text-foreground outline-none transition-all focus:border-foreground/20 focus:bg-muted/20"
                  >
                    {DEAL_STAGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2.5 block text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">موعد المتابعة</label>
                  <input
                    type="datetime-local"
                    value={form.nextFollowUpAt}
                    onChange={(event) => setForm((current) => ({ ...current, nextFollowUpAt: event.target.value }))}
                    className="w-full rounded-xl border border-border/40 bg-muted/10 px-4 py-3.5 text-[15px] font-bold text-foreground outline-none transition-all focus:border-foreground/20 focus:bg-muted/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2.5 block text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">العقار المرتبط</label>
                <select
                  value={form.propertyId}
                  onChange={(event) => setForm((current) => ({ ...current, propertyId: event.target.value }))}
                  className="w-full rounded-xl border border-border/40 bg-muted/10 px-4 py-3.5 text-[15px] font-bold text-foreground outline-none transition-all focus:border-foreground/20 focus:bg-muted/20"
                >
                  <option value="">بدون عقار</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.title} - {property.location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2.5 block text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">الوصف / الاهتمام</label>
                <textarea
                  rows={4}
                  value={form.preference}
                  onChange={(event) => setForm((current) => ({ ...current, preference: event.target.value }))}
                  className="w-full rounded-xl border border-border/40 bg-muted/10 px-4 py-3.5 text-[15px] font-medium leading-[1.6] text-foreground outline-none transition-all focus:border-foreground/20 focus:bg-muted/20"
                />
              </div>

              <div>
                <label className="mb-2.5 block text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">الملاحظات</label>
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  className="w-full rounded-xl border border-border/40 bg-muted/10 px-4 py-3.5 text-[15px] font-medium leading-[1.6] text-foreground outline-none transition-all focus:border-foreground/20 focus:bg-muted/20"
                />
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-[13px] font-bold text-rose-600">
                {error}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 pt-4 sm:flex-row-reverse">
              <button
                type="submit"
                disabled={pending}
                className="flex-1 rounded-2xl bg-foreground px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-background transition-all hover:opacity-90 active:scale-[0.98] shadow-md disabled:opacity-50"
              >
                {pending ? "جارٍ الحفظ..." : submitLabel}
              </button>
              <button
                type="button"
                onClick={() => router.push(cancelHref)}
                className="flex-1 rounded-2xl border border-border px-6 py-4 text-center text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-[0.98]"
              >
                إلغاء
              </button>
              {onArchive ? (
                <button
                  type="button"
                  disabled={archivePending}
                  onClick={() => {
                    setError(null);
                    startArchiveTransition(async () => {
                      try {
                        const result = await onArchive();
                        router.push(result.redirectTo);
                      } catch (archiveError) {
                        setError(archiveError instanceof Error ? archiveError.message : "تعذر أرشفة الصفقة الآن.");
                      }
                    });
                  }}
                  className="rounded-2xl border border-rose-500/30 px-6 py-4 text-center text-[11px] font-black uppercase tracking-[0.2em] text-rose-600 transition-all hover:bg-rose-50 active:scale-[0.98] disabled:opacity-50"
                >
                  {archivePending ? "جارٍ الأرشفة..." : "أرشفة الصفقة"}
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
