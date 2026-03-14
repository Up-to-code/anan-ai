import SectionScaffold from "@/components/shared/SectionScaffold";
import { activityTabs } from "@/lib/adminSectionTabs";

export default function ActivitySectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <SectionScaffold
      eyebrow="النشاط"
      title="النشاط"
      description="متابعة موحدة لكل النشاط أو تصفيته حسب الإشعارات أو الرسائل أو سجل الإدارة."
      tabs={activityTabs}
    >
      {children}
    </SectionScaffold>
  );
}
