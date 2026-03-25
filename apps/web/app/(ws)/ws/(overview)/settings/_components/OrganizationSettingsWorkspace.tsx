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
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-950">بيانات المنظمة</h2>
        <p className="mt-2 text-sm text-slate-500">لا توجد منظمة مرتبطة بالحساب الحالي.</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-950">بيانات المنظمة</h2>
        <p className="text-sm text-slate-500">
          حدّث اسم المنظمة وبيانات التواصل الأساسية الخاصة بها.
        </p>
      </div>

      <dl className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
        <div>
          <dt className="text-sm text-slate-500">المعرف</dt>
          <dd className="mt-1 text-sm font-medium text-slate-900">{organization.slug}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">الحالة</dt>
          <dd className="mt-1 text-sm font-medium text-slate-900">
            {organization.status === "active" ? "نشط" : organization.status ?? "غير متوفر"}
          </dd>
        </div>
      </dl>
      
      <form
        className="mt-6 space-y-6"
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
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">الاسم</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={!canManage || isSaving}
            className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 transition focus-visible:border-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">نبذة</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={!canManage || isSaving}
            rows={4}
            className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 transition focus-visible:border-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
          />
          <p className="text-xs text-slate-500">اختياري، ويستخدم للتعريف السريع داخل مساحة العمل.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">الموقع الإلكتروني</label>
            <input
              type="text"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              disabled={!canManage || isSaving}
              placeholder="https://example.com"
              className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 transition focus-visible:border-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">بريد التواصل</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              disabled={!canManage || isSaving}
              placeholder="contact@example.com"
              className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 transition focus-visible:border-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-6">
          <div aria-live="polite" className="text-sm text-slate-500">
            {status}
          </div>
          <button
            type="submit"
            disabled={!canManage || isSaving}
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
        </div>
      </form>
    </section>

  );
}
