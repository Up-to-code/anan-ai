"use client";

import { useState } from "react";
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
        <h3 className="text-lg font-black text-slate-950">تعديل بيانات المنظمة</h3>
        <p className="mt-3 text-sm font-medium text-slate-500">لا توجد منظمة مرتبطة بالحساب الحالي.</p>
      </section>
    );
  }

  return (
    <section className="border border-slate-200 bg-white p-6">
      <h3 className="text-lg font-black text-slate-950">تعديل بيانات المنظمة</h3>
      <form
        className="mt-4 space-y-4"
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
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="block text-xs font-black tracking-widest text-slate-500">المعرف</div>
            <div className="mt-2 border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-700">
              {organization.slug}
            </div>
          </div>
          <div>
            <div className="block text-xs font-black tracking-widest text-slate-500">الحالة</div>
            <div className="mt-2 border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-700">
              {organization.status ?? "غير متوفر"}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-black tracking-widest text-slate-500">الاسم</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={!canManage || isSaving}
            className="mt-2 w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition focus:bg-white focus-visible:border-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-70"
          />
        </div>

        <div>
          <label className="block text-xs font-black tracking-widest text-slate-500">نبذة</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={!canManage || isSaving}
            rows={4}
            className="mt-2 w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition focus:bg-white focus-visible:border-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-70"
          />
          <div className="mt-2 text-xs font-medium text-slate-500">اختياري — حتى 500 حرف.</div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-black tracking-widest text-slate-500">الموقع الإلكتروني</label>
            <input
              type="text"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              disabled={!canManage || isSaving}
              placeholder="https://example.com"
              className="mt-2 w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition focus:bg-white focus-visible:border-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </div>
          <div>
            <label className="block text-xs font-black tracking-widest text-slate-500">بريد التواصل</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              disabled={!canManage || isSaving}
              placeholder="contact@example.com"
              className="mt-2 w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition focus:bg-white focus-visible:border-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </div>
        </div>

        <div aria-live="polite" className="min-h-6 text-sm font-medium text-slate-600">
          {status}
        </div>
        <button
          type="submit"
          disabled={!canManage || isSaving}
          className="bg-slate-950 px-6 py-3 text-xs font-black tracking-widest text-white transition hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "جاري الحفظ..." : "حفظ التعديلات"}
        </button>
      </form>
    </section>
  );
}
