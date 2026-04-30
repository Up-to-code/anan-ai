import { useWebLocale } from "@/app/_components/WebLocaleProvider";
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
  const { locale, isRtl } = useWebLocale();
  const title =
    locale === "fr"
      ? "Derniere verification avant l'enregistrement"
      : locale === "en"
        ? "Final review before saving"
        : "مراجعة أخيرة قبل الحفظ";
  const description =
    locale === "fr"
      ? "Verifiez les images, la description et les informations principales. Le projet sera enregistre avec l'etat choisi."
      : locale === "en"
        ? "Check the images, description, and key details. The project will be saved with the selected status."
        : "تأكد من الصور والوصف والبيانات الأساسية. سيتم حفظ المشروع بالحالة التي اخترتها الآن.";
  const confirmLabel =
    savePending
      ? locale === "fr"
        ? "Enregistrement..."
        : locale === "en"
          ? "Saving..."
          : "جارٍ الحفظ..."
      : locale === "fr"
        ? "Confirmer l'enregistrement"
        : locale === "en"
          ? "Confirm save"
          : "تأكيد الحفظ";
  const backLabel =
    locale === "fr"
      ? "Retour a la modification"
      : locale === "en"
        ? "Back to editing"
        : "العودة للتعديل";
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[28px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
        onClick={(event) => event.stopPropagation()}
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--workspace-highlight)_14%,transparent)] text-[var(--workspace-highlight)]">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h2 className="mb-3 text-2xl font-black text-[var(--workspace-bubble-other-foreground)]">{title}</h2>
        <p className="mb-8 text-sm font-medium leading-7 text-[var(--workspace-muted)]">
          {description}
        </p>
        <div className="grid gap-3">
          <button
            type="button"
            data-testid="property-form-confirm-save"
            onClick={onConfirm}
            disabled={savePending}
            className="rounded-2xl border border-[color:color-mix(in_srgb,var(--workspace-highlight)_50%,transparent)] bg-[var(--workspace-highlight)] py-4 text-sm font-bold text-[var(--primary-foreground)] transition hover:brightness-110"
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            data-testid="property-form-cancel-save"
            onClick={onClose}
            className="rounded-2xl border border-[color:var(--workspace-border)] py-4 text-sm font-bold text-[var(--workspace-muted)] transition hover:border-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,transparent)] hover:text-[var(--workspace-bubble-other-foreground)]"
          >
            {backLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
