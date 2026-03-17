"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { OrganizationInviteDisplay, OrganizationMemberDisplay } from "@/app/(ws)/ws/_lib/entities";

const roleLabels: Record<OrganizationMemberDisplay["role"], string> = {
  manager: "مدير",
  member: "عضو",
  viewer: "مشاهد",
};

/**
 * WHY:   Organization members need a practical management surface before backend role-mutation support is added.
 * WHAT:  Renders current members plus pending invites and supports local-only role reassignment in the UI.
 * HOW:   Starts from server-rendered data and keeps demo role changes entirely in local state.
 */
export default function MembersWorkspace({
  initialMembers,
  invites,
  canManage,
}: {
  initialMembers: OrganizationMemberDisplay[];
  invites: OrganizationInviteDisplay[];
  canManage: boolean;
}) {
  const [members, setMembers] = useState(initialMembers);
  const [pendingInvites, setPendingInvites] = useState(invites);
  const [status, setStatus] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {status ? (
        <div className="rounded-lg border border-blue-100 bg-blue-50/50 px-4 py-3 text-xs font-bold text-blue-700">
          {status}
        </div>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-xl font-black tracking-tight text-slate-950">أعضاء المنظمة ({members.length})</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">إدارة الأدوار والصلاحيات للأعضاء الحاليين.</p>
        </div>
        
        <div className="divide-y divide-slate-100">
          {members.map((member) => (
            <article key={member.id} className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between transition hover:bg-slate-50/30">
              <div className="min-w-0">
                <div className="truncate text-base font-black text-slate-950">{member.name}</div>
                <div className="mt-1 truncate text-xs font-medium text-slate-500" dir="ltr">{member.email}</div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <span className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest",
                  member.statusLabel === "نشط" ? "border-green-100 bg-green-50 text-green-700" : "border-slate-200 bg-slate-50 text-slate-500"
                )}>
                  {member.statusLabel}
                </span>
                
                <div className="flex flex-wrap gap-2">
                  {(["manager", "member", "viewer"] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      disabled={!canManage}
                      onClick={async () => {
                        if (!canManage || member.role === role) return;
                        setStatus("جاري تحديث الدور...");
                        const response = await fetch(`/api/workspace/team-members/${member.membershipId}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ role }),
                        });
                        if (!response.ok) {
                          const payload = (await response.json()) as { message?: string };
                          setStatus(payload.message ?? "تعذر تحديث الدور.");
                          return;
                        }
                        setMembers((current) =>
                          current.map((entry) => (entry.id === member.id ? { ...entry, role } : entry)),
                        );
                        setStatus(`تم تغيير دور ${member.name} إلى ${roleLabels[role]}.`);
                        setTimeout(() => setStatus(null), 3000);
                      }}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-black tracking-widest uppercase transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                        member.role === role
                          ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      )}
                    >
                      {roleLabels[role]}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {pendingInvites.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-xl font-black tracking-tight text-slate-950">الدعوات المعلقة ({pendingInvites.length})</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">راجع الدعوات المرسلة وألغِ غير المطلوبة.</p>
          </div>
          
          <div className="divide-y divide-slate-100">
            {pendingInvites.map((invite) => (
              <article key={invite.id} className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between transition hover:bg-slate-50/30">
                <div className="min-w-0">
                  <div className="truncate text-sm font-black text-slate-950" dir="ltr">{invite.email}</div>
                  <div className="mt-1 text-xs font-medium text-slate-400">تنتهي {invite.expiresLabel}</div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  <span className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-700">
                    {roleLabels[invite.role]}
                  </span>
                  
                  {canManage ? (
                    <button
                      type="button"
                      onClick={async () => {
                        setStatus("جاري إلغاء الدعوة...");
                        const response = await fetch(`/api/workspace/team-invites/${invite.id}`, {
                          method: "DELETE",
                        });
                        if (!response.ok) {
                          const payload = (await response.json()) as { message?: string };
                          setStatus(payload.message ?? "تعذر إلغاء الدعوة.");
                          return;
                        }
                        setPendingInvites((current) => current.filter((entry) => entry.id !== invite.id));
                        setStatus("تم إلغاء الدعوة.");
                        setTimeout(() => setStatus(null), 3000);
                      }}
                      className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-black tracking-widest uppercase text-red-600 shadow-sm transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                    >
                      إلغاء الدعوة
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
