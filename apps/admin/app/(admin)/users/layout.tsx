import SectionScaffold from "@/components/shared/SectionScaffold";
import { usersTabs } from "@/lib/adminSectionTabs";

export default function UsersSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <SectionScaffold
      eyebrow="المستخدمون"
      title="إدارة المستخدمين"
      description="عرض المستخدمين والملفات الشخصية والعضويات وحالة التحقق عبر صفحات صغيرة وواضحة."
      tabs={usersTabs}
    >
      {children}
    </SectionScaffold>
  );
}
