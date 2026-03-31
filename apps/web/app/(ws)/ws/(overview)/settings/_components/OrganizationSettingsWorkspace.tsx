"use client";

import { useState } from "react";
import type { OrganizationSummary } from "@/server/contracts/organizations";

/**
 * WHY:   Organization settings need one focused client controller for renaming the current organization.
 * WHAT:  Renders the real current-organization form and submits changes through a server action.
 * HOW:   Keeps submission state local while the surrounding settings page stays server rendered.
 */
export default function OrganizationSettingsWorkspace({
  organization,
  canManage,
  onSave,
}: {
  organization: OrganizationSummary | null;
  canManage: boolean;
  onSave: (input: {
    name: string;
    description?: string;
    website?: string;
    contactEmail?: string;
  }) => Promise<{ ok: true; message: string } | { ok: false; message: string }>;
}) {
  const [name, setName] = useState(organization?.name ?? "");
  const [description, setDescription] = useState(organization?.description ?? "");
  const [website, setWebsite] = useState(organization?.website ?? "");
  const [contactEmail, setContactEmail] = useState(organization?.contactEmail ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!organization) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">بيانات المنظمة</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">لا توجد منظمة مرتبطة بالحساب الحالي.</p>
      </section>
    );
  }

  return (
    <section className="max-w-3xl space-y-8 pb-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-foreground">بيانات المنظمة</h2>
        <p className="text-[13px] font-medium text-muted-foreground">
          حدّث اسم المنظمة وبيانات التواصل الأساسية الخاصة بها.
        </p>
      </div>

      <dl className="grid gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-2">
        <div>
          <dt className="text-[12px] font-semibold text-muted-foreground">المعرف</dt>
          <dd className="mt-1 text-sm font-bold text-foreground">{organization.slug}</dd>
        </div>
        <div>
          <dt className="text-[12px] font-semibold text-muted-foreground">الحالة</dt>
          <dd className="mt-1 text-sm font-bold text-foreground">
            {organization.status === "active" ? "نشط" : organization.status ?? "غير متوفر"}
          </dd>
        </div>
      </dl>
      
      <form
        className="space-y-6"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!canManage) {
            setStatus("صلاحية المدير مطلوبة لتعديل بيانات المنظمة.");
            return;
          }

          setIsSaving(true);
          setStatus("جاري حفظ بيانات المنظمة...");
          const result = await onSave({
            name,
            description: description.trim().length > 0 ? description : undefined,
            website: website.trim().length > 0 ? website : undefined,
            contactEmail: contactEmail.trim().length > 0 ? contactEmail : undefined,
          });
          setStatus(result.message);
          setIsSaving(false);
        }}
      >
        <div className="space-y-2">
          <label className="text-[13px] font-semibold text-foreground">الاسم</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={!canManage || isSaving}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-[13px] font-medium text-foreground transition focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-semibold text-foreground">نبذة</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={!canManage || isSaving}
            rows={4}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-[13px] font-medium text-foreground transition focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
          <p className="text-[12px] font-medium text-muted-foreground">اختياري، ويستخدم للتعريف السريع داخل مساحة العمل.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-foreground">الموقع الإلكتروني</label>
            <input
              type="text"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              disabled={!canManage || isSaving}
              placeholder="https://example.com"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-[13px] font-medium text-foreground transition focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-foreground">بريد التواصل</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              disabled={!canManage || isSaving}
              placeholder="contact@example.com"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-[13px] font-medium text-foreground transition focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-6">
          <div aria-live="polite" className="text-[13px] font-medium text-muted-foreground">
            {status}
          </div>
          <button
            type="submit"
            disabled={!canManage || isSaving}
            className="inline-flex items-center justify-center rounded-xl bg-foreground px-5 py-2.5 text-[13px] font-bold text-background transition hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
        </div>
      </form>
    </section>

  );
}
