import SectionScaffold from "@/components/shared/SectionScaffold";

/**
 * WHY:   Compliance is part of the rebuilt governance layer and should share the same section framing.
 * WHAT:  Wraps compliance routes with a title and short governance-oriented description.
 * HOW:   Uses the shared scaffold with no secondary route tabs.
 */
export default function ComplianceSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <SectionScaffold
      eyebrow="الامتثال"
      title="الامتثال"
      description="قواعد التحقق، متطلبات النشر، وسياسات الحوكمة المعتمدة داخل المنصة."
      tabs={[]}
    >
      {children}
    </SectionScaffold>
  );
}

