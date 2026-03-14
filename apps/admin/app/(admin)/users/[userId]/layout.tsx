import SectionScaffold from "@/components/shared/SectionScaffold";
import { userDetailTabs } from "@/lib/adminSectionTabs";

type UserDetailLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ userId: string }>;
};

export default async function UserDetailLayout({ children, params }: UserDetailLayoutProps) {
  const { userId } = await params;

  return (
    <SectionScaffold
      eyebrow="ملف المستخدم"
      title="تفاصيل المستخدم"
      description="كل تبويبة هنا لها هدف واحد: الملف، المنظمة، العروض، الرسائل، النشاط، الوصول، أو التحقق."
      tabs={userDetailTabs(userId)}
    >
      {children}
    </SectionScaffold>
  );
}
