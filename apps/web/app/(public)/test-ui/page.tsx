import PropertyCard from "@/app/(ws)/ws/_components/Visuals/PropertyCard";
import { Trash2, Pencil } from "lucide-react";

export default function TestUiPage() {
  const mockProject = {
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
    title: "مشروع النخيل السكني",
    location: "حي النخيل، الرياض",
    priceLabel: "2,500,000 ر.س",
    summary: "مشروع سكني فاخر يتميز بتصاميم عصرية ومساحات واسعة تناسب احتياجات العائلة السعودية المعاصرة مع مرافق متكاملة.",
    specs: [
      { label: "الغرف", value: "5 غرف" },
      { label: "الحمامات", value: "4 حمامات" },
      { label: "المساحة", value: "450 م²" },
      { label: "الحالة", value: "جاهز" },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 p-12">
      <div className="mx-auto max-w-6xl space-y-12">
        <h1 className="text-3xl font-black text-slate-900 text-right">معاينة تطويع البطاقات الجديد</h1>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Default Compact Card */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-400 text-right">البطاقة الافتراضية (Compact)</h2>
            <PropertyCard
              {...mockProject}
              density="compact"
              footer={
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:border-red-300 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:border-slate-400 hover:text-slate-600">
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                  <button className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white">فتح المشروع</button>
                </div>
              }
            />
          </div>

          {/* Published State with Badge */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-400 text-right">بطاقة منشورة (مع شارة)</h2>
            <PropertyCard
              {...mockProject}
              title="فلل الياسمين"
              publicationBadge={
                <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                  منشور
                </span>
              }
              footer={
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg border border-slate-200 p-2 text-slate-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg border border-slate-200 p-2 text-slate-400">
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                  <button className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white">فتح المشروع</button>
                </div>
              }
            />
          </div>

          {/* Flexible/Large Variant */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-400 text-right">البطاقة المرنة (Flexible)</h2>
            <PropertyCard
              {...mockProject}
              title="ذا لاين - نيوم"
              density="flexible"
              publicationBadge={
                <span className="rounded-md bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 border border-amber-100">
                  مسودة
                </span>
              }
              footer={
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg border border-slate-200 p-2 text-slate-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg border border-slate-200 p-2 text-slate-400">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg bg-blue-600 px-3 py-2 text-[10px] font-bold text-white">نشر</button>
                  </div>
                  <button className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white">فتح المشروع</button>
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
