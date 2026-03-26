"use client";

import { useState } from "react";
import { UserPlus, MapPin, Briefcase } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ZonePageIntro from "../../../../_components/ZoneShell/ZonePageIntro";

/**
 * WHY:   The user needs a way to add new brokers to their workspace.
 * WHAT:  Renders a form to add a new broker profile.
 * HOW:   Uses a minimalist design consistent with the Anan design system.
 */
export default function AddBrokerPage() {
  const router = useRouter();
  const [formState, setFormState] = useState({
    name: "",
    role: "وسيط عقاري",
    location: "الرياض",
    specialization: "",
    summary: "",
  });

  return (
    <div className="flex min-h-full flex-col">
      <ZonePageIntro
        eyebrow="علاقات العمل"
        title="إضافة وسيط جديد"
        description="أنشئ ملف تعريف لوسيط جديد للبدء في تتبعه أو تكليفه بمهام في مشاريعك."
      />

      <div className="max-w-2xl px-6 py-6 lg:px-8 lg:py-8">
        <form className="space-y-8 border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6 dark:border-slate-800">
            <div className="flex h-16 w-16 items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
              <UserPlus className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-slate-100">ملف الوسيط</h3>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">بيانات التعريف الأساسية</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">اسم الوسيط بالكامل</label>
              <input
                type="text"
                value={formState.name}
                onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
                placeholder="مثال: سلمان بن عبدالعزيز"
                className="w-full border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">المسمى الوظيفي</label>
              <select
                value={formState.role}
                onChange={(e) => setFormState(prev => ({ ...prev, role: e.target.value }))}
                className="w-full appearance-none border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="وسيط عقاري">وسيط عقاري</option>
                <option value="مستشار عقاري">مستشار عقاري</option>
                <option value="وسيط استثماري">وسيط استثماري</option>
                <option value="مسوق عقاري">مسوق عقاري</option>
              </select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">المدينة</label>
              <div className="relative">
                <input
                  type="text"
                  value={formState.location}
                  onChange={(e) => setFormState(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="مثال: الرياض"
                  className="w-full border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300 dark:text-slate-500" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">التخصص</label>
              <div className="relative">
                <input
                  type="text"
                  value={formState.specialization}
                  onChange={(e) => setFormState(prev => ({ ...prev, specialization: e.target.value }))}
                  placeholder="مثال: فلل فاخرة، شقق تمليك"
                  className="w-full border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
                <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300 dark:text-slate-500" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">نبذة تعريفية</label>
            <textarea
              rows={4}
              value={formState.summary}
              onChange={(e) => setFormState(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="أدخل ملخصاً عن خبرات الوسيط السابقة..."
              className="w-full resize-none border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            ></textarea>
          </div>

          <div className="flex items-center gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                router.push("/ws/crm/brokers");
              }}
              className="flex-1 bg-slate-950 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white transition hover:bg-blue-600 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-blue-500 dark:hover:text-white"
            >
              حفظ الوسيط
            </button>
            <Link
              href="/ws/crm/brokers"
              className="flex-1 border border-slate-200 bg-white py-4 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 shadow-none transition hover:border-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-blue-500"
            >
              إلغاء
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
