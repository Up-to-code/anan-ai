import SectionScaffold from "@/components/shared/SectionScaffold";
import { organizationsTabs } from "@/lib/adminSectionTabs";

export default function OrganizationsSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <SectionScaffold
      eyebrow="المنظمات"
      title="إدارة المنظمات"
      description="تنظيم الوسطاء والمطورين والعضويات والدعوات عبر تبويبات مسارية بسيطة."
      tabs={organizationsTabs}
    >
      {children}
    </SectionScaffold>
  );
}
