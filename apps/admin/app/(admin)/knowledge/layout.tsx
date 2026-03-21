import SectionScaffold from "@/components/shared/SectionScaffold";

/**
 * WHY:   Knowledge remains a standalone workspace inside the rebuilt admin.
 * WHAT:  Wraps knowledge routes with a management-focused header.
 * HOW:   Reuses the shared scaffold with no extra tabs.
 */
export default function KnowledgeSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <SectionScaffold
      eyebrow="المعرفة"
      title="المعرفة"
      description="إدارة المحتوى الذي يغذي المساعد والمنصة الداخلية من نقطة تشغيلية واحدة."
      tabs={[]}
    >
      {children}
    </SectionScaffold>
  );
}

