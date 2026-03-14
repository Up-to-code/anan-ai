import SectionScaffold from "@/components/shared/SectionScaffold";
import { organizationDetailTabs } from "@/lib/adminSectionTabs";

type OrganizationDetailLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ organizationId: string }>;
};

export default async function OrganizationDetailLayout({ children, params }: OrganizationDetailLayoutProps) {
  const { organizationId } = await params;

  return (
    <SectionScaffold
      eyebrow="تفاصيل المنظمة"
      title="ملف المنظمة"
      description="ملخص قصير للمنظمة مع تبويبات منفصلة للأعضاء والعقارات والعروض والرسائل والوصول والتحقق."
      tabs={organizationDetailTabs(organizationId)}
    >
      {children}
    </SectionScaffold>
  );
}
