import Link from "next/link";
import { Mail } from "lucide-react";
import ZonePageIntro from "../../../_components/ZoneShell/ZonePageIntro";
import OrganizationMemberCard from "../../../_components/Visuals/OrganizationMemberCard";
import type { OrganizationMemberDisplay } from "../../../_lib/entities";
import { getWorkspaceOrganizationTeam } from "../../../_lib/organizationTeam";

type BrokerMemberCardProps = {
  member: OrganizationMemberDisplay;
  authUserId: string;
  organizationType: "broker" | "red" | null | undefined;
};

function InboxLink({ authUserId, className, label }: { authUserId: string; className: string; label: string }) {
  return (
    <Link href={`/ws/inbox?startUserId=${encodeURIComponent(authUserId)}`} className={className}>
      {label}
    </Link>
  );
}

function BrokerMemberActions({
  member,
  authUserId,
}: {
  member: BrokerMemberCardProps["member"];
  authUserId: string;
}) {
  const canMessage = member.authUserId !== authUserId;

  return (
    <div className="flex items-center justify-between gap-3">
      <Link
        href={`/ws/crm/brokers/${member.id}`}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-700 transition hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-300"
      >
        عرض الملف الشخصي
      </Link>
      {canMessage ? (
        <InboxLink
          authUserId={member.authUserId}
          className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 transition hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-300"
          label="فتح الرسائل"
        />
      ) : (
        <span className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
          هذا أنت
        </span>
      )}
    </div>
  );
}

function BrokerMemberCard({ member, authUserId, organizationType }: BrokerMemberCardProps) {
  const canMessage = member.authUserId !== authUserId;

  return (
    <OrganizationMemberCard
      member={member}
      organizationType={organizationType}
      footer={
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            <span>{member.statusLabel}</span>
            {canMessage ? (
              <InboxLink
                authUserId={member.authUserId}
                className="inline-flex items-center gap-1.5 text-blue-700 transition hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
                label="بدء محادثة"
              />
            ) : null}
          </div>
          <BrokerMemberActions member={member} authUserId={authUserId} />
        </div>
      }
    />
  );
}

function BrokerListIntro() {
  return (
    <ZonePageIntro
      eyebrow="علاقات العمل"
      title="قائمة الوسطاء"
      description="استعرض أعضاء الفريق والدعوات النشطة داخل المنظمة الحالية."
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/ws/crm/brokers/invite"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs font-black tracking-[0.18em] text-slate-700 transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
          >
            <Mail className="h-4 w-4" />
            دعوة وسيط
          </Link>
        </div>
      }
    />
  );
}

function OrganizationSummaryCard({ name, membersCount, invitesCount }: { name: string; membersCount: number; invitesCount: number }) {
  return (
    <div className="mb-6 rounded-lg border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 dark:border-slate-800 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.92)_0%,rgba(2,6,23,0.98)_100%)]">
      <div className="text-xs font-black tracking-[0.22em] text-blue-700 dark:text-blue-300">المنظمة الحالية</div>
      <div className="mt-2 text-2xl font-black text-slate-950 dark:text-slate-100">{name}</div>
      <div className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
        {membersCount} عضو نشط · {invitesCount} دعوة معلقة
      </div>
    </div>
  );
}

/**
 * WHY:   CRM collaboration should show real organization members and invites instead of a static broker roster.
 * WHAT:  Renders the current team network for the active workspace organization.
 * HOW:   Loads members and invites through the shared organization gateway and reuses the shared member card UI.
 */
export default async function BrokerListPage() {
  const { organization, members, invites, authUserId } = await getWorkspaceOrganizationTeam();

  return (
    <div className="flex min-h-full flex-col">
      <BrokerListIntro />

      <div className="px-6 py-6 lg:px-8 lg:py-8">
        <OrganizationSummaryCard
          name={organization?.name ?? "بدون منظمة"}
          membersCount={members.length}
          invitesCount={invites.length}
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {members.map((member) => (
            <BrokerMemberCard
              key={member.id}
              member={member}
              authUserId={authUserId}
              organizationType={organization?.type}
            />
          ))}
        </div>

        {members.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 py-12 text-center text-sm font-bold text-slate-500 dark:border-slate-800 dark:text-slate-400">
            لا يوجد أعضاء فريق بعد. ابدأ بإرسال أول دعوة.
          </div>
        ) : null}
      </div>
    </div>
  );
}
