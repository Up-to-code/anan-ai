import Link from "next/link";
import { Mail, Users } from "lucide-react";
import ZonePageIntro from "../../../_components/ZoneShell/ZonePageIntro";
import { getWorkspaceOrganizationTeam } from "../../../_lib/organizationTeam";

/**
 * WHY:   CRM collaboration should show real organization members and invites instead of a static broker roster.
 * WHAT:  Renders the current team network for the active workspace organization.
 * HOW:   Loads members and invites through the shared organization gateway and links into real invite flows.
 */
export default async function BrokerListPage() {
  const { organization, members, invites } = await getWorkspaceOrganizationTeam();

  return (
    <div className="flex min-h-full flex-col">
      <ZonePageIntro
        eyebrow="علاقات العمل"
        title="قائمة الوسطاء"
        description="استعرض أعضاء الفريق والدعوات النشطة داخل المنظمة الحالية."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/ws/crm/brokers/invite"
              className="inline-flex items-center gap-2 border border-slate-200 bg-white px-4 py-3 text-xs font-black tracking-[0.18em] text-slate-700 transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <Mail className="h-4 w-4" />
              دعوة وسيط
            </Link>
          </div>
        }
      />

      <div className="px-6 py-6 lg:px-8 lg:py-8">
        <div className="mb-6 border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5">
          <div className="text-xs font-black tracking-[0.22em] text-blue-700">المنظمة الحالية</div>
          <div className="mt-2 text-2xl font-black text-slate-950">{organization?.name ?? "بدون منظمة"}</div>
          <div className="mt-2 text-sm font-medium text-slate-600">
            {members.length} عضو نشط · {invites.length} دعوة معلقة
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {members.map((member) => (
            <div key={member.id} className="group relative border border-slate-200 bg-white p-6 transition hover:border-blue-200">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden bg-slate-100 text-xl font-black text-slate-400">
                  {member.name.slice(0, 1)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-slate-950">{member.name}</h3>
                    <div className="h-2 w-2 rounded-none bg-emerald-500" title="Active" />
                  </div>
                  <div className="mt-0.5 text-xs font-bold text-blue-600">{member.role}</div>
                  <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{member.email}</div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <p className="text-sm font-medium leading-6 text-slate-600">{member.statusLabel}</p>

                <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                  <div className="flex-1">
                    <div className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">الحالة الحالية</div>
                    <div className="inline-flex items-center gap-1.5 border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
                      <Users className="h-3.5 w-3.5" />
                      {member.role}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <Link
                    href={`/ws/crm/brokers/${member.id}`}
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700 transition hover:text-slate-950"
                  >
                    عرض الملف الشخصي
                  </Link>
                  <Link
                    href="/ws/inbox"
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition hover:text-blue-600"
                  >
                    فتح المحادثات
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {members.length === 0 ? (
          <div className="border border-dashed border-slate-200 py-12 text-center text-sm font-bold text-slate-500">
            لا يوجد أعضاء فريق بعد. ابدأ بإرسال أول دعوة.
          </div>
        ) : null}
      </div>
    </div>
  );
}
