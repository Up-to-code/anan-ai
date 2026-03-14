import SectionScaffold from "@/components/shared/SectionScaffold";
import { propertiesTabs } from "@/lib/adminSectionTabs";

export default function PropertiesSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <SectionScaffold
      eyebrow="العقارات"
      title="إدارة العقارات"
      description="تبويبات مبسطة لرؤية كل العقارات، عقارات الوسطاء، عقارات المطورين، أو التوزيع حسب الحالة."
      tabs={propertiesTabs}
    >
      {children}
    </SectionScaffold>
  );
}
