import Link from "next/link";
import { Mail, MessageSquareText, Users } from "lucide-react";
import ZonePageIntro from "../../../_components/ZoneShell/ZonePageIntro";
import { getWorkspaceOrganizationTeam } from "../../../_lib/organizationTeam";

type BrokerMemberCardProps = {
  member: {
    id: string;
    authUserId: string;
    name: string;
    role: string;
    email: string;
    statusLabel: string;
  };
  authUserId: string;
};

function InboxLink({ authUserId, className, label }: { authUserId: string; className: string; label: string }) {
  return (
    <Link href={`/ws/inbox?startUserId=${encodeURIComponent(authUserId)}`} className={className}>
      {label}
    </Link>
  );
}

function BrokerMemberIdentity({ member }: Pick<BrokerMemberCardProps, "member">) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-xl font-black text-slate-400 dark:bg-slate-800 dark:text-slate-200">{member.name.slice(0, 1)}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-950 dark:text-slate-100">{member.name}</h3>
          <div className="h-2 w-2 rounded-full bg-emerald-500" title="Active" />
        </div>
        <div className="mt-0.5 text-xs font-bold text-blue-600">{member.role}</div>
        <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{member.email}</div>
      </div>
    </div>
  );
}

function BrokerMemberFooter({ member, canMessage }: { member: BrokerMemberCardProps["member"]; canMessage: boolean }) {
  return (
    <div className="mt-6 space-y-4">
      <p className="text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">{member.statusLabel}</p>
      <div className="flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <div className="flex-1">
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">الحالة الحالية</div>
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
            <Users className="h-3.5 w-3.5" />
            {member.role}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
        <Link
          href={`/ws/crm/brokers/${member.id}`}
          className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700 transition hover:text-slate-950 dark:text-blue-300 dark:hover:text-slate-100"
        >
          عرض الملف الشخصي
        </Link>
        {canMessage ? (
          <InboxLink
            authUserId={member.authUserId}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-300"
            label="فتح الرسائل"
          />
        ) : null}
      </div>
    </div>
  );
}

function BrokerMemberCard({ member, authUserId }: BrokerMemberCardProps) {
  const canMessage = member.authUserId !== authUserId;
  return (
    <div className="group relative rounded-lg border border-slate-200 bg-white p-6 transition hover:border-blue-200 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-500/40">
      {canMessage ? (
        <Link
          href={`/ws/inbox?startUserId=${encodeURIComponent(member.authUserId)}`}
          className="absolute left-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-blue-600 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-300 dark:focus-visible:ring-blue-500/40"
          aria-label="فتح رسالة"
          title="فتح رسالة"
        >
          <MessageSquareText className="h-4 w-4" />
        </Link>
      ) : null}
      <BrokerMemberIdentity member={member} />
      <BrokerMemberFooter member={member} canMessage={canMessage} />
    </div>
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
 * HOW:   Loads members and invites through the shared organization gateway and links into real invite flows.
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
            <BrokerMemberCard key={member.id} member={member} authUserId={authUserId} />
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
