"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { OrganizationSummary } from "@/server/contracts/organizations";

/**
 * WHY:   Organization settings need one focused client controller for renaming the current organization.
 * WHAT:  Renders the real current-organization form and posts changes to the gateway mutation endpoint.
 * HOW:   Keeps submission state local while the surrounding settings page stays server rendered.
 */
export default function OrganizationSettingsWorkspace({
  organization,
  canManage,
}: {
  organization: OrganizationSummary | null;
  canManage: boolean;
}) {
  const [name, setName] = useState(organization?.name ?? "");
  const [description, setDescription] = useState(organization?.description ?? "");
  const [website, setWebsite] = useState(organization?.website ?? "");
  const [contactEmail, setContactEmail] = useState(organization?.contactEmail ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!organization) {
    return (
      <section className="border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-black text-slate-950">بيانات المنظمة</h2>
        <p className="mt-2 text-sm font-medium text-slate-500">لا توجد منظمة مرتبطة بالحساب الحالي.</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-black tracking-tight text-slate-950">بيانات المنظمة</h2>
        <p className="text-sm font-medium text-slate-500">
          حدّث اسم المنظمة وبيانات التواصل الأساسية الخاصة بها.
        </p>
      </div>
      
      <form
        className="mt-8 space-y-6"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!canManage) {
            setStatus("صلاحية المدير مطلوبة لتعديل بيانات المنظمة.");
            return;
          }

          setIsSaving(true);
          setStatus("جاري حفظ بيانات المنظمة...");
          const response = await fetch("/api/organizations/current", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              description: description.trim().length > 0 ? description : undefined,
              website: website.trim().length > 0 ? website : undefined,
              contactEmail: contactEmail.trim().length > 0 ? contactEmail : undefined,
            }),
          });
          const payload = (await response.json()) as { message?: string };

          if (!response.ok) {
            setStatus(payload.message ?? "تعذر حفظ بيانات المنظمة.");
            setIsSaving(false);
            return;
          }

          setStatus("تم تحديث بيانات المنظمة.");
          setIsSaving(false);
        }}
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">المعرف</div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-600">
              {organization.slug}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">الحالة</div>
            <div className={cn(
               "rounded-lg border px-4 py-3 text-sm font-medium",
               organization.status === "active" ? "border-green-100 bg-green-50 text-green-700" : "border-slate-100 bg-slate-50 text-slate-600"
            )}>
              {organization.status === "active" ? "نشط" : organization.status ?? "غير متوفر"}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">الاسم</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={!canManage || isSaving}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-900 transition focus:bg-white focus-visible:border-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">نبذة</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={!canManage || isSaving}
            rows={4}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-900 transition focus:bg-white focus-visible:border-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
          />
          <p className="text-[10px] font-bold text-slate-400">اختياري — حتى 500 حرف.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">الموقع الإلكتروني</label>
            <input
              type="text"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              disabled={!canManage || isSaving}
              placeholder="https://example.com"
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-900 transition focus:bg-white focus-visible:border-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">بريد التواصل</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              disabled={!canManage || isSaving}
              placeholder="contact@example.com"
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-900 transition focus:bg-white focus-visible:border-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-6">
          <div aria-live="polite" className="text-xs font-bold text-slate-500">
            {status}
          </div>
          <button
            type="submit"
            disabled={!canManage || isSaving}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-xs font-black tracking-[0.18em] text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
        </div>
      </form>
    </section>

  );
}
