import SectionScaffold from "@/components/shared/SectionScaffold";
import { dashboardTabs } from "@/lib/adminSectionTabs";

export default function DashboardSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <SectionScaffold
      eyebrow="لوحة التحكم"
      title="لوحة التحكم"
      description="ملخص بسيط لحجم المنصة، الكيانات الرئيسية، وطوابير العمل التي تحتاج تدخل الإدارة."
      tabs={dashboardTabs}
    >
      {children}
    </SectionScaffold>
  );
}
