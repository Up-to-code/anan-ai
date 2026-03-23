import EmptyState from "@/components/shared/EmptyState";
import KeyValueGrid from "@/components/shared/KeyValueGrid";
import PageActions from "@/components/shared/PageActions";
import SectionScaffold from "@/components/shared/SectionScaffold";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { getUserById, offers } from "@/admin_zone/mocks/data";
import { userDetailTabs } from "@/lib/adminSectionTabs";
import { formatDateTime } from "@/lib/format";
import { labelForRole } from "@/lib/adminLabels";

type UserDetailPageProps = {
  userId?: string;
  userKey?: string;
  tab?: string;
};

/**
 * WHY:   Admin operators need one user detail view that combines profile, organization, offer, and access context.
 * WHAT:  Renders the mocked user detail page for a single user id.
 * HOW:   Resolves the user from the repository and derives related offers and permission hints locally.
 */
export default function UserDetailPage({ userId, userKey }: UserDetailPageProps) {
  const user = getUserById(userId ?? userKey ?? "");

  if (!user) {
    return <EmptyState title="المستخدم غير موجود" description="لا توجد بيانات mock لهذا المستخدم." />;
  }

  const relatedOffers = offers.filter((offer) => offer.submittedBy === user.name);

  return (
    <SectionScaffold
      eyebrow="المستخدمون"
      title={user.name}
      description="عرض تفاصيل المستخدم، انتماؤه، نشاطه، والعروض المرتبطة به."
      tabs={userDetailTabs(user.id)}
      actions={
        <PageActions
          actions={[
            { label: "تعديل", href: `/users/${user.id}/edit` },
            { label: "حذف", href: `/users/${user.id}/delete`, variant: "outline" },
          ]}
        />
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_320px]">
        <div className="space-y-6">
          <WorkspacePanel className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge value={user.status} />
              <StatusBadge value={user.verificationStatus} />
            </div>
            <KeyValueGrid
              items={[
                { label: "الدور", value: labelForRole(user.role) },
                { label: "المنظمة", value: user.organizationName },
                { label: "البريد الإلكتروني", value: user.email },
                { label: "آخر نشاط", value: formatDateTime(user.lastActiveAt) },
              ]}
            />
          </WorkspacePanel>

          <WorkspacePanel className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">العروض المرتبطة</h2>
            {relatedOffers.length > 0 ? (
              <div className="space-y-3">
                {relatedOffers.map((offer) => (
                  <div key={offer.id} className="rounded-[8px] border border-border bg-slate-50 px-4 py-3">
                    <div className="font-medium text-slate-900">{offer.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{offer.projectName}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500">لا توجد عروض مرتبطة بهذا المستخدم في بيانات mock.</div>
            )}
          </WorkspacePanel>
        </div>

        <div className="space-y-6">
          <WorkspacePanel className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900">الصلاحيات</h2>
            <div className="space-y-3">
              {[
                { label: "وصول لوحة الإدارة", status: user.role === "admin" ? "approved" : "pending" },
                { label: "إدارة العروض", status: user.role === "broker" || user.role === "admin" ? "approved" : "pending" },
                { label: "التحقق اليدوي", status: user.role === "admin" ? "approved" : "rejected" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-[8px] border border-border bg-white px-4 py-3">
                  <span className="text-sm text-slate-700">{item.label}</span>
                  <StatusBadge value={item.status} />
                </div>
              ))}
            </div>
          </WorkspacePanel>
        </div>
      </div>
    </SectionScaffold>
  );
}
