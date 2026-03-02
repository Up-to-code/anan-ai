import { Users, UserPlus, ShieldCheck, Mail, MoreVertical, X, Send } from "lucide-react";
import { useSharedGeneralOrganization } from "../hooks/useSharedGeneral";
import { useState } from "react";
import { toast } from "sonner";

export default function Organization() {
  const { teamMembers, teamInvites, createTeamInvite, cancelTeamInvite, isLoading } = useSharedGeneralOrganization();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"manager" | "member" | "viewer">("member");
  const [submitting, setSubmitting] = useState(false);

  const handleCreateInvite = async () => {
    if (!inviteEmail.trim()) return;
    setSubmitting(true);
    try {
      await createTeamInvite({ email: inviteEmail.trim().toLowerCase(), role: inviteRole });
      toast.success("تم إرسال الدعوة");
      setInviteEmail("");
      setInviteRole("member");
    } catch {
      toast.error("تعذر إرسال الدعوة");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await cancelTeamInvite({ inviteId: inviteId as any });
      toast.success("تم إلغاء الدعوة");
    } catch {
      toast.error("تعذر إلغاء الدعوة");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-1">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">فريق العمل</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            إدارة أعضاء مؤسستك، الصلاحيات، والدعوات النشطة
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900">دعوة عضو جديد</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@example.com"
                className="sm:col-span-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                dir="ltr"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as "manager" | "member" | "viewer")}
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              >
                <option value="manager">مدير</option>
                <option value="member">عضو</option>
                <option value="viewer">مشاهد</option>
              </select>
              <button
                onClick={handleCreateInvite}
                disabled={submitting || !inviteEmail.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:bg-slate-300"
              >
                <Send className="h-4 w-4" />
                إرسال دعوة
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden min-h-[400px] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">الأعضاء الحاليون</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                {isLoading ? "..." : `${teamMembers?.length || 0} أعضاء`}
              </span>
            </div>

            <div className="flex-1">
              {isLoading ? (
                <div className="p-12 text-center flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin" />
                </div>
              ) : teamMembers && teamMembers.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {teamMembers.map((member: any, idx: number) => (
                    <div key={idx} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold border border-slate-200 uppercase text-xs">
                          {member.authUserId.substring(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900">عضو الفريق #{idx + 1}</p>
                            <span className="text-[10px] font-bold text-slate-400">ID: {member.authUserId.substring(0, 6)}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                            <Mail className="h-3 w-3" />
                            الدور: {member.role ?? "member"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-md border border-green-100 uppercase tracking-tight">
                          نشط
                        </span>
                        <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-md transition-all opacity-0 group-hover:opacity-100">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center flex flex-col items-center justify-center h-full text-slate-500">
                  <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                    <ShieldCheck className="h-8 w-8 text-slate-300" />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">أنت العضو الوحيد</h4>
                  <p className="text-sm font-medium max-w-xs leading-relaxed">
                    قم بدعوة فريق عملك للبدء في إدارة المشاريع والعملاء بشكل تعاوني.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
            <ShieldCheck className="h-4 w-4 text-slate-400" />
            <h3 className="font-bold text-sm text-slate-900 tracking-tight">الدعوات النشطة</h3>
          </div>
          <div className="p-4 space-y-3">
            {(teamInvites ?? []).length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs font-medium text-slate-500">
                لا توجد دعوات حالياً
              </div>
            ) : (
              (teamInvites ?? []).map((invite: any) => (
                <div key={invite._id} className="rounded-lg border border-slate-200 bg-slate-50/40 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-slate-800" dir="ltr">{invite.email}</p>
                      <p className="mt-1 text-[10px] font-medium text-slate-500">
                        الدور: {invite.role} · الحالة: {invite.status}
                      </p>
                    </div>
                    {invite.status === "pending" && (
                      <button
                        onClick={() => handleCancelInvite(invite._id)}
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">
              دعوات البريد الإلكتروني مرتبطة بصلاحيات الفريق
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
