import SectionScaffold from "@/components/shared/SectionScaffold";

/**
 * WHY:   The rebuilt dashboard no longer splits into shallow sub-tabs and should feel like one integrated command center.
 * WHAT:  Wraps dashboard routes with a simple section header and no secondary tabs.
 * HOW:   Reuses the shared section scaffold while omitting route tabs entirely.
 */
export default function DashboardSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <SectionScaffold
      eyebrow="لوحة المتابعة"
      title="لوحة المتابعة"
      description="متابعة موحدة للحركة التجارية، صحة الشركاء، وضغط الطوابير التشغيلية."
      tabs={[]}
    >
      {children}
    </SectionScaffold>
  );
}
