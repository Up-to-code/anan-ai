"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import type { WorkspaceAudience } from "@/server/contracts/workspace";

function slugifyOrganizationName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

type OrganizationDetailsStepProps = {
  suggestedOrganizationType: "broker" | "red";
  audience: WorkspaceAudience;
  pending: boolean;
  onBack: () => void;
  onCreated: (snapshot: { id: string; type: "broker" | "red" }) => void;
};

/**
 * WHY:   The organization creation step needs to feel premium and professional.
 * WHAT:  Modernizes the detail form with rounded-3xl geometry and high-contrast inputs.
 * HOW:   Adopts rounded-2xl for inputs and rounded-full for action buttons.
 */
export default function OrganizationDetailsStep({
  suggestedOrganizationType,
  audience,
  pending,
  onBack,
  onCreated,
}: OrganizationDetailsStepProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"broker" | "red">(suggestedOrganizationType);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const helperText =
    audience === "developer"
      ? "اختر مطوراً لإدارة المشاريع والعروض."
      : audience === "broker"
        ? "اختر وسيطاً لإدارة العملاء والتعاون."
        : "اختر نوع الجهة لتفعيل المسارات المناسبة.";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const trimmedName = name.trim();
      const fallbackSlug = slugifyOrganizationName(trimmedName);
      const createdResult = await authClient.organization.create({
        name: trimmedName,
        slug: fallbackSlug,
        metadata: {
          organizationType: type === "red" ? "developer" : "broker",
        },
      } as never);
      if (createdResult.error) {
        throw new Error(createdResult.error.message ?? "تعذر إنشاء الجهة.");
      }
      const createdOrganization = createdResult.data as Record<string, unknown> | null;
      const organizationId =
        typeof createdOrganization?.id === "string" ? createdOrganization.id : null;
      const organizationSlug =
        typeof createdOrganization?.slug === "string" && createdOrganization.slug.trim().length > 0
          ? createdOrganization.slug
          : fallbackSlug;

      if (!organizationId) {
        throw new Error("تم إنشاء الجهة لكن تعذر قراءة بياناتها.");
      }

      const activeResult = await authClient.organization.setActive({
        organizationId,
      } as never);
      if (activeResult.error) {
        throw new Error(activeResult.error.message ?? "تعذر تفعيل الجهة.");
      }

      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          name: trimmedName,
          slug: organizationSlug,
          type,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message ?? "تعذر إنشاء الجهة.");
      }

      const organization = await response.json() as { id: string; type: "broker" | "red" };
      onCreated({ id: organization.id, type: organization.type });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "تعذر إنشاء الجهة.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-10" onSubmit={handleSubmit}>
      <div className="space-y-2 text-right">
        <div className="text-xl font-black tracking-tight text-slate-900">بيانات الجهة</div>
        <p className="text-sm font-medium text-slate-500">{helperText}</p>
      </div>

      <div className="space-y-8">
        <div className="flex flex-col gap-3 text-right">
          <label className="text-xs font-black uppercase tracking-widest text-slate-900">اسم الجهة</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            placeholder="مثال: مؤسسة عنان العقارية"
            className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-slate-300 focus:bg-white"
          />
        </div>

        <div className="space-y-3 text-right">
          <div className="text-xs font-black uppercase tracking-widest text-slate-900">نوع الجهة</div>
          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setType("broker")}
              className={`flex items-start gap-4 rounded-3xl border-2 p-5 text-right transition-all ${
                type === "broker" 
                  ? "border-slate-900 bg-white" 
                  : "border-slate-100 bg-slate-50 hover:bg-white"
              }`}
            >
              <div className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                type === "broker" ? "border-slate-900 bg-slate-900" : "border-slate-200 bg-white"
              }`}>
                {type === "broker" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </div>
              <span className="space-y-1">
                <span className="block text-[15px] font-black text-slate-900">وسيط عقاري</span>
                <span className="block text-[12px] font-medium text-slate-500">إدارة العملاء والعروض.</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setType("red")}
              className={`flex items-start gap-4 rounded-3xl border-2 p-5 text-right transition-all ${
                type === "red" 
                  ? "border-slate-900 bg-white" 
                  : "border-slate-100 bg-slate-50 hover:bg-white"
              }`}
            >
              <div className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                type === "red" ? "border-slate-900 bg-slate-900" : "border-slate-200 bg-white"
              }`}>
                {type === "red" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </div>
              <span className="space-y-1">
                <span className="block text-[15px] font-black text-slate-900">مطور عقاري</span>
                <span className="block text-[12px] font-medium text-slate-500">إدارة المشاريع والعروض.</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl bg-red-50 p-4 text-[13px] font-bold text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-between pt-6">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full bg-slate-100 px-8 py-3.5 text-xs font-black uppercase tracking-widest text-slate-900 transition hover:bg-slate-200"
        >
          رجوع
        </button>
        <button
          type="submit"
          disabled={pending || isSubmitting}
          className="rounded-full bg-slate-900 px-10 py-3.5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {isSubmitting ? "جارٍ الحفظ..." : "متابعة"}
        </button>
      </div>
    </form>
  );
}
