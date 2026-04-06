import Button from "@/components/shared/Button";

type AdminFormActionBarProps = {
  submitLabel: string;
  backHref: string;
  showDraftAction?: boolean;
  onSubmit: () => void;
  onSaveDraft?: () => void;
};

/**
 * WHY:   Create and edit pages need a consistent submit area that feels like a real admin workflow.
 * WHAT:  Renders save, optional save-as-draft, and cancel actions.
 * HOW:   Delegates behavior to the caller while keeping the visual treatment consistent across entity forms.
 */
export default function AdminFormActionBar({
  submitLabel,
  backHref,
  showDraftAction = false,
  onSubmit,
  onSaveDraft,
}: AdminFormActionBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-[24px] border border-[color:color-mix(in_srgb,var(--workspace-border)_76%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_96%,transparent)] p-4 shadow-sm">
      <Button onClick={onSubmit}>{submitLabel}</Button>
      {showDraftAction ? (
        <Button variant="outline" onClick={onSaveDraft}>
          حفظ كمسودة
        </Button>
      ) : null}
      <Button href={backHref} variant="outline">
        إلغاء
      </Button>
    </div>
  );
}
