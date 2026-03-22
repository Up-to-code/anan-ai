import { ShieldCheck } from "lucide-react";

type AgPropertyFormSafetyOverlayProps = {
  savePending: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function AgPropertyFormSafetyOverlay({
  savePending,
  onConfirm,
  onClose,
}: AgPropertyFormSafetyOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white p-12 text-center animate-in zoom-in-95 duration-200"
        onClick={(event) => event.stopPropagation()}
      >
        <ShieldCheck className="mx-auto mb-6 h-16 w-16 text-blue-600" />
        <h2 className="mb-4 text-3xl font-black text-slate-950">تأكيد التدقيق النهائي</h2>
        <p className="mb-10 text-base font-medium leading-relaxed text-slate-500">
          يرجى مراجعة كافة البيانات المدخلة قبل الاعتماد والنشر، لضمان دقة معلومات الوصول
          والمواصفات.
        </p>
        <div className="grid gap-3">
          <button
            onClick={onConfirm}
            disabled={savePending}
            className="border-2 border-blue-600 bg-blue-600 py-4 text-sm font-black tracking-[0.2em] text-white transition-colors hover:border-slate-950 hover:bg-slate-950"
          >
            {savePending ? "جارٍ الحفظ..." : "اعتماد ونشر"}
          </button>
          <button
            onClick={onClose}
            className="border border-slate-200 py-4 text-[10px] font-black tracking-widest text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-950"
          >
            تراجع للمراجعة
          </button>
        </div>
      </div>
    </div>
  );
}
