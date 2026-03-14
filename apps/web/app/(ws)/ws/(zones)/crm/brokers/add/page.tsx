"use client";

import { useState } from "react";
import { UserPlus, Award, MapPin, Briefcase } from "lucide-react";
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

      <div className="px-6 py-6 lg:px-8 lg:py-8 max-w-2xl">
        <form className="bg-white p-8 border border-slate-200 space-y-8">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
            <div className="h-16 w-16 bg-blue-50 flex items-center justify-center text-blue-600">
              <UserPlus className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">ملف الوسيط</h3>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">بيانات التعريف الأساسية</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">اسم الوسيط بالكامل</label>
              <input
                type="text"
                value={formState.name}
                onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
                placeholder="مثال: سلمان بن عبدالعزيز"
                className="w-full bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 transition"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">المسمى الوظيفي</label>
              <select
                value={formState.role}
                onChange={(e) => setFormState(prev => ({ ...prev, role: e.target.value }))}
                className="w-full bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 transition appearance-none"
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
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">المدينة</label>
              <div className="relative">
                <input
                  type="text"
                  value={formState.location}
                  onChange={(e) => setFormState(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="مثال: الرياض"
                  className="w-full bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 transition"
                />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">التخصص</label>
              <div className="relative">
                <input
                  type="text"
                  value={formState.specialization}
                  onChange={(e) => setFormState(prev => ({ ...prev, specialization: e.target.value }))}
                  placeholder="مثال: فلل فاخرة، شقق تمليك"
                  className="w-full bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 transition"
                />
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">نبذة تعريفية</label>
            <textarea
              rows={4}
              value={formState.summary}
              onChange={(e) => setFormState(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="أدخل ملخصاً عن خبرات الوسيط السابقة..."
              className="w-full bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 transition resize-none"
            ></textarea>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                console.log("Saving Broker:", formState);
                router.push("/ws/crm/brokers");
              }}
              className="flex-1 bg-slate-950 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white hover:bg-blue-600 transition"
            >
              حفظ الوسيط
            </button>
            <Link
              href="/ws/crm/brokers"
              className="flex-1 bg-white border border-slate-200 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 hover:border-blue-600 transition text-center shadow-none"
            >
              إلغاء
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
