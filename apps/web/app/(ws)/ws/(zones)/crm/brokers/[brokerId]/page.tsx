import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Users } from "lucide-react";
import ZonePageIntro from "../../../../_components/ZoneShell/ZonePageIntro";
import { getWorkspaceOrganizationTeam } from "../../../../_lib/organizationTeam";

interface BrokerDetailPageProps {
  params: Promise<{
    brokerId: string;
  }>;
}

/**
 * WHY:   Broker detail should show the real organization member profile instead of a mock CRM persona.
 * WHAT:  Renders one team member with their invite context and links into the real collaboration surfaces.
 * HOW:   Resolves the member from the organization team gateway and falls back to 404 when missing.
 */
export default async function BrokerDetailPage({ params }: BrokerDetailPageProps) {
  const { brokerId } = await params;
  const { organization, members, invites } = await getWorkspaceOrganizationTeam();
  const broker = members.find((member) => member.id === brokerId) ?? null;

  if (!broker) {
    notFound();
  }

  const memberInvites = invites.filter((invite) => invite.email === broker.email);

  return (
    <div className="flex min-h-full flex-col">
      <ZonePageIntro
        eyebrow="ملف الوسيط"
        title={broker.name}
        description={`${broker.role} داخل ${organization?.name ?? "المنظمة الحالية"}`}
        actions={
          <Link
            href="/ws/crm/brokers"
            className="inline-flex items-center gap-2 border border-slate-200 bg-white px-4 py-3 text-xs font-black tracking-[0.18em] text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة للقائمة
          </Link>
        }
      />

      <div className="space-y-8 px-6 py-6 lg:px-8 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="border border-slate-200 bg-white p-6">
              <div className="flex items-start gap-6">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden bg-slate-100 text-3xl font-black text-slate-400">
                  {broker.name.slice(0, 1)}
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="text-2xl font-black text-slate-950">{broker.name}</h3>
                  </div>
                  <p className="mb-3 text-sm font-bold text-blue-600">{broker.role}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <span>{broker.email}</span>
                    <span>{broker.statusLabel}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3 border-t border-slate-100 pt-6">
                <Link
                  href="/ws/inbox"
                  className="flex-1 inline-flex items-center justify-center gap-2 border border-slate-200 bg-white px-4 py-3 text-xs font-black tracking-[0.18em] text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  <Mail className="h-4 w-4" />
                  رسالة
                </Link>
              </div>
            </div>

            <div className="border border-slate-200 bg-white p-6">
              <h4 className="mb-4 text-sm font-black uppercase tracking-wider text-slate-900">الوصول الفعلي</h4>
              <p className="text-sm leading-6 text-slate-600">
                هذا الملف يعتمد على عضوية المنظمة الحقيقية. ربط المشاريع والعملاء يتم من المشاريع والعروض وCRM الفعلي،
                وليس من بيانات تجريبية داخل الصفحة.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border border-slate-200 bg-white p-6">
              <h4 className="mb-4 text-sm font-black uppercase tracking-wider text-slate-900">إحصائيات</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">الدعوات المرتبطة</span>
                  </div>
                  <span className="text-lg font-black text-blue-600">{memberInvites.length}</span>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 bg-white p-6">
              <h4 className="mb-4 text-sm font-black uppercase tracking-wider text-slate-900">الحالة</h4>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-none bg-emerald-500" />
                <span className="text-sm font-bold text-slate-700">{broker.statusLabel}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-900">
              الدعوات ({memberInvites.length})
            </h4>
            <Link href="/ws/crm/brokers/invite" className="text-xs font-black text-blue-600 hover:text-blue-700">
              إرسال دعوة
            </Link>
          </div>
          {memberInvites.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {memberInvites.map((invite) => (
                <div key={invite.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-none bg-blue-100 text-sm font-black text-blue-700">
                    {invite.email.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">{invite.email}</div>
                    <div className="text-xs text-slate-500">تنتهي في {invite.expiresLabel}</div>
                  </div>
                  <div className="border border-slate-200 px-2 py-1 text-xs font-black uppercase tracking-wider">
                    {invite.status}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-slate-500">لا توجد دعوات مرتبطة بهذا العضو حتى الآن.</div>
          )}
        </div>
      </div>
    </div>
  );
}
