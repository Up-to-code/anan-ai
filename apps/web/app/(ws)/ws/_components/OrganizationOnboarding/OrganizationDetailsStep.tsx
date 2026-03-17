"use client";

import { useState } from "react";
import type { WorkspaceAudience } from "@/server/contracts/workspace";

type OrganizationDetailsStepProps = {
  suggestedOrganizationType: "broker" | "red";
  audience: WorkspaceAudience;
  pending: boolean;
  onBack: () => void;
  onCreated: (snapshot: { id: string; type: "broker" | "red" }) => void;
};

/**
 * WHY:   Users need a guided step to create their first organization before verification.
 * WHAT:  Collects organization name/type and creates it via the gateway API.
 * HOW:   Posts to `/api/organizations`, then advances the journey on success.
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
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type }),
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
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <div className="text-sm font-black text-slate-900">بيانات الجهة</div>
        <p className="text-sm text-slate-500">{helperText}</p>
      </div>

      <div className="grid gap-4">
        <label className="grid gap-2 text-sm text-slate-700">
          اسم الجهة
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            placeholder="مثال: مؤسسة عنان العقارية"
            className="border-2 border-slate-100 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>

        <div className="space-y-2">
          <div className="text-sm text-slate-700">نوع الجهة</div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex items-start gap-3 border-2 border-slate-100 bg-white px-3 py-3 text-sm text-slate-800">
              <input
                type="radio"
                name="type"
                value="broker"
                checked={type === "broker"}
                onChange={() => setType("broker")}
                className="mt-1"
              />
              <span>
                <span className="block font-semibold text-slate-900">وسيط عقاري</span>
                <span className="block text-xs text-slate-500">إدارة العملاء والعروض.</span>
              </span>
            </label>
            <label className="flex items-start gap-3 border-2 border-slate-100 bg-white px-3 py-3 text-sm text-slate-800">
              <input
                type="radio"
                name="type"
                value="red"
                checked={type === "red"}
                onChange={() => setType("red")}
                className="mt-1"
              />
              <span>
                <span className="block font-semibold text-slate-900">مطور عقاري</span>
                <span className="block text-xs text-slate-500">إدارة المشاريع والعروض.</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {error ? (
        <div className="border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="border-2 border-blue-600 bg-white px-8 py-2.5 text-xs font-black uppercase tracking-widest text-blue-600 transition hover:bg-blue-50"
        >
          رجوع
        </button>
        <button
          type="submit"
          disabled={pending || isSubmitting}
          className="border-2 border-blue-600 bg-blue-600 px-8 py-2.5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {isSubmitting ? "جارٍ الحفظ..." : "متابعة"}
        </button>
      </div>
    </form>
  );
}
