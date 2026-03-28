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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[28px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--workspace-highlight)_14%,transparent)] text-[var(--workspace-highlight)]">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h2 className="mb-3 text-2xl font-black text-[var(--workspace-bubble-other-foreground)]">مراجعة أخيرة قبل الحفظ</h2>
        <p className="mb-8 text-sm font-medium leading-7 text-[var(--workspace-muted)]">
          تأكد من الصور والوصف والبيانات الأساسية. سيتم حفظ المشروع بالحالة التي اخترتها الآن.
        </p>
        <div className="grid gap-3">
          <button
            onClick={onConfirm}
            disabled={savePending}
            className="rounded-2xl border border-[color:color-mix(in_srgb,var(--workspace-highlight)_50%,transparent)] bg-[var(--workspace-highlight)] py-4 text-sm font-bold text-[var(--primary-foreground)] transition hover:brightness-110"
          >
            {savePending ? "جارٍ الحفظ..." : "تأكيد الحفظ"}
          </button>
          <button
            onClick={onClose}
            className="rounded-2xl border border-[color:var(--workspace-border)] py-4 text-sm font-bold text-[var(--workspace-muted)] transition hover:border-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,transparent)] hover:text-[var(--workspace-bubble-other-foreground)]"
          >
            العودة للتعديل
          </button>
        </div>
      </div>
    </div>
  );
}
