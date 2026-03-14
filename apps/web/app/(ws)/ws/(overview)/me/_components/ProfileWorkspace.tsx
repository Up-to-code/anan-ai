"use client";

import Link from "next/link";
import { useState } from "react";
import type { ProfileSummary } from "@/server/contracts/profiles";
import LogoutButton from "./LogoutButton";

type ProfileWorkspaceProps = {
  initialProfile: ProfileSummary;
  fallbackName: string;
  fallbackEmail: string;
};

/**
 * WHY:   The account center needs local form state and optimistic feedback while the page remains server rendered.
 * WHAT:  Renders the editable profile form, Google-auth security summary, and primary account actions.
 * HOW:   Posts profile changes to the gateway profile endpoint and keeps feedback scoped to the form.
 */
export default function ProfileWorkspace({
  initialProfile,
  fallbackName,
  fallbackEmail,
}: ProfileWorkspaceProps) {
  const [name, setName] = useState(initialProfile.name ?? fallbackName);
  const [username, setUsername] = useState(initialProfile.username ?? "");
  const [showInOffersDirectory, setShowInOffersDirectory] = useState(initialProfile.showInOffersDirectory ?? true);
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <section className="border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-black text-slate-950">بيانات الحساب</h2>
        <p className="mt-2 text-sm font-medium leading-7 text-slate-500">
          عدل اسم الحساب واسم المستخدم الفريد الذي سيستخدم في البحث الداخلي.
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setIsSaving(true);
            setStatus("جاري حفظ التعديلات...");

            const response = await fetch("/api/profile", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name, username, showInOffersDirectory }),
            });

            const payload = (await response.json()) as { message?: string };
            if (!response.ok) {
              setStatus(payload.message ?? "تعذر حفظ التعديلات.");
              setIsSaving(false);
              return;
            }

            setStatus("تم حفظ التعديلات بنجاح.");
            setIsSaving(false);
          }}
        >
          <div>
            <label className="block text-xs font-black tracking-[0.18em] text-slate-500">الاسم</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-950 transition focus:bg-white focus-visible:border-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
              name="name"
            />
          </div>

          <div>
            <label className="block text-xs font-black tracking-[0.18em] text-slate-500">اسم المستخدم</label>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-2 w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-950 transition focus:bg-white focus-visible:border-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
              name="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              dir="ltr"
            />
            <p className="mt-2 text-xs font-medium text-slate-500">
              استخدم الأحرف والأرقام والشرطة أو النقطة. هذا الحقل يستخدم في البحث الداخلي.
            </p>
          </div>

          <div>
            <label className="block text-xs font-black tracking-[0.18em] text-slate-500">البريد الإلكتروني</label>
            <div className="mt-2 border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700" dir="ltr">
              {initialProfile.email ?? fallbackEmail}
            </div>
          </div>

          <label className="flex items-start gap-3 border border-slate-200 bg-slate-50 px-4 py-4">
            <input
              type="checkbox"
              checked={showInOffersDirectory}
              onChange={(event) => setShowInOffersDirectory(event.target.checked)}
              className="mt-1 h-4 w-4 border-slate-300 text-blue-600"
            />
            <span>
              <span className="block text-sm font-black text-slate-950">إظهار الحساب في دليل العروض</span>
              <span className="mt-1 block text-xs font-medium leading-6 text-slate-500">
                مفعلة افتراضياً. عند إيقافها لن يظهر ملفك داخل تبويبات الوسطاء والمطورين في صفحة العروض.
              </span>
            </span>
          </label>

          <div aria-live="polite" className="text-sm font-medium text-slate-600 min-h-6">
            {status}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center border border-slate-950 bg-slate-950 px-5 py-3 text-xs font-black tracking-[0.18em] text-white transition hover:border-blue-600 hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
        </form>
      </section>

      <aside className="space-y-6">
        <section className="border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-black text-slate-950">الأمان</h2>
          <p className="mt-3 text-sm font-medium leading-7 text-slate-600">
            تسجيل الدخول يتم عبر Google فقط في هذه المرحلة. لا توجد كلمة مرور محلية في أنان، ويمكنك إدارة التطبيقات المرتبطة من قسم الأمان.
          </p>
          <div className="mt-5 space-y-3">
            <div className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              مزود الدخول: Google
            </div>
            <Link
              href="/ws/me/security/apps"
              className="inline-flex items-center justify-center border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-blue-200 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
            >
              التطبيقات المرتبطة
            </Link>
          </div>
        </section>

        <section className="border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-black text-slate-950">الجلسة الحالية</h2>
          <p className="mt-3 text-sm font-medium leading-7 text-slate-600">
            استخدم هذا الإجراء لتسجيل الخروج من مساحة العمل الحالية بأمان.
          </p>
          <div className="mt-5">
            <LogoutButton />
          </div>
        </section>
      </aside>
    </div>
  );
}
