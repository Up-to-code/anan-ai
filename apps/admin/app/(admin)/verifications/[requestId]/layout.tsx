import SectionScaffold from "@/components/shared/SectionScaffold";
import { verificationDetailTabs } from "@/lib/adminSectionTabs";

type VerificationDetailLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ requestId: string }>;
};

export default async function VerificationDetailLayout({ children, params }: VerificationDetailLayoutProps) {
  const { requestId } = await params;

  return (
    <SectionScaffold
      eyebrow="تفاصيل التحقق"
      title="طلب التحقق"
      description="صفحات منفصلة للبيانات والمستندات وقرار المراجعة حتى تظل كل مهمة واضحة."
      tabs={verificationDetailTabs(requestId)}
    >
      {children}
    </SectionScaffold>
  );
}
