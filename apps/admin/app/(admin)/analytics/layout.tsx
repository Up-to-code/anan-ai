import SectionScaffold from "@/components/shared/SectionScaffold";
import { analyticsTabs } from "@/lib/adminSectionTabs";

export default function AnalyticsSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <SectionScaffold
      eyebrow="التحليلات"
      title="التحليلات"
      description="قراءة أعمق للرسائل، النشاط، الجهات، العروض، وروابط التعاون خارج صفحة النظرة العامة."
      tabs={analyticsTabs}
    >
      {children}
    </SectionScaffold>
  );
}
