import SectionScaffold from "@/components/shared/SectionScaffold";
import { analyticsTabs } from "@/lib/adminSectionTabs";

/**
 * WHY:   Grouped analytics now need a stable shared frame for the six management-oriented analytics views.
 * WHAT:  Wraps analytics routes with the section header and grouped tabs.
 * HOW:   Uses the rebuilt secondary tabs list rather than the legacy low-level source tabs.
 */
export default function AnalyticsSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <SectionScaffold
      eyebrow="التحليلات"
      title="التحليلات"
      description="قراءة تنفيذية وتجارية وتشغيلية للحركة داخل المنصة، من التفاعل وحتى التعاون بين الشركاء."
      tabs={analyticsTabs}
    >
      {children}
    </SectionScaffold>
  );
}
