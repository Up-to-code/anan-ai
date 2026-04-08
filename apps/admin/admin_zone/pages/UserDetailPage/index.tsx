import EmptyState from "@/components/shared/EmptyState";
import Link from "next/link";
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
      layout="detail"
      contentWidth="contained"
      rail={
        <div className="space-y-5">
          <WorkspacePanel
            density="compact"
            header={
              <div className="space-y-2">
                <h2 className="text-lg font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">الحالة والوصول</h2>
                <p className="text-sm font-medium text-[var(--workspace-muted)]">الحالة الحالية وصلاحيات التشغيل الأساسية.</p>
              </div>
            }
            bodyClassName="grid gap-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge value={user.status} />
              <StatusBadge value={user.verificationStatus} />
            </div>
            {[
              { label: "وصول لوحة الإدارة", status: user.role === "admin" ? "approved" : "pending" },
              { label: "إدارة العروض", status: user.role === "broker" || user.role === "admin" ? "approved" : "pending" },
              { label: "التحقق اليدوي", status: user.role === "admin" ? "approved" : "rejected" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl border border-border/30 bg-card p-4 shadow-sm">
                <span className="text-[13px] font-bold text-muted-foreground/70">{item.label}</span>
                <StatusBadge value={item.status} />
              </div>
            ))}
          </WorkspacePanel>

          <WorkspacePanel
            density="compact"
            header={
              <div className="space-y-2">
                <h2 className="text-lg font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">ملخص الحساب</h2>
              </div>
            }
          >
            <KeyValueGrid
              items={[
                { label: "الدور", value: labelForRole(user.role) },
                { label: "المنظمة", value: user.organizationName },
                { label: "البريد الإلكتروني", value: user.email },
                { label: "آخر نشاط", value: formatDateTime(user.lastActiveAt) },
              ]}
            />
          </WorkspacePanel>
        </div>
      }
    >
      <WorkspacePanel
        density="default"
        header={
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-foreground">العروض المرتبطة</h2>
            <p className="text-sm font-medium text-muted-foreground/70">العروض التي ترتبط بهذا المستخدم داخل بيانات mock الحالية.</p>
          </div>
        }
      >
        {relatedOffers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {relatedOffers.map((offer) => (
              <Link key={offer.id} href={`/offers/${offer.id}`} className="group block rounded-2xl border border-border/30 bg-muted/5 p-6 transition-all hover:bg-muted/10 hover:border-primary/30">
                <div className="space-y-2">
                  <div className="text-lg font-black tracking-tight text-foreground transition-colors group-hover:text-primary">{offer.title}</div>
                  <div className="text-[13px] font-bold text-muted-foreground/60">{offer.projectName}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/40 bg-muted/5 p-12 text-center text-sm font-bold text-muted-foreground/40">لا توجد عروض مرتبطة بهذا المستخدم في بيانات mock.</div>
        )}
      </WorkspacePanel>
    </SectionScaffold>
  );
}
