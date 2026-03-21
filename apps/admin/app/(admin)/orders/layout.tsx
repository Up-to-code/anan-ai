import SectionScaffold from "@/components/shared/SectionScaffold";

/**
 * WHY:   Orders remain a standalone operational section and need the rebuilt management header.
 * WHAT:  Wraps orders routes with a section title and descriptive copy.
 * HOW:   Uses the shared section scaffold without secondary tabs.
 */
export default function OrdersSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <SectionScaffold
      eyebrow="الطلبات"
      title="إدارة الطلبات"
      description="متابعة تقدم الطلبات، توزيع المسؤوليات، ومراجعة ضغط القنوات التشغيلية."
      tabs={[]}
    >
      {children}
    </SectionScaffold>
  );
}

