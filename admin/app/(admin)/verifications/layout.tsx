import SectionScaffold from "@/components/shared/SectionScaffold";
import { verificationTabs } from "@/lib/adminSectionTabs";

export default function VerificationsSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <SectionScaffold
      eyebrow="التحقق"
      title="مركز التحقق"
      description="صفحات واضحة لاستقبال الطلبات الجديدة ومتابعة المراجعة والاعتماد أو الرفض."
      tabs={verificationTabs}
    >
      {children}
    </SectionScaffold>
  );
}
