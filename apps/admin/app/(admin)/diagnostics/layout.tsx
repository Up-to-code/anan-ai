import SectionScaffold from "@/components/shared/SectionScaffold";

/**
 * WHY:   Diagnostics is a top-level operational workspace in the rebuilt admin.
 * WHAT:  Wraps diagnostics routes with the shared section header.
 * HOW:   Uses the common scaffold and omits route tabs.
 */
export default function DiagnosticsSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <SectionScaffold
      eyebrow="التشخيص"
      title="التشخيص"
      description="مراقبة الإشارات التقنية، نشاط البحث، ونسب الخطأ داخل السطح التشغيلي."
      tabs={[]}
    >
      {children}
    </SectionScaffold>
  );
}
