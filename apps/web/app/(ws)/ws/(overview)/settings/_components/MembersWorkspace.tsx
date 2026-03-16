"use client";

import { useState } from "react";
import type { OrganizationInviteDisplay, OrganizationMemberDisplay } from "@/app/(ws)/ws/_lib/entities";

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
      {status ? <div aria-live="polite" className="text-sm font-medium text-slate-600">{status}</div> : null}
      <section className="border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-black text-slate-950">أعضاء المنظمة</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">حدّث الدور لكل عضو حسب الحاجة.</p>
        </div>
        <div className="divide-y divide-slate-200">
          {members.map((member) => (
            <article key={member.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-base font-black text-slate-950">{member.name}</div>
                <div className="mt-1 text-sm font-medium text-slate-500">{member.email}</div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600">
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
                        setStatus("تم تحديث الدور.");
                      }}
                      className={`border px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 ${
                        member.role === role
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-600"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-black text-slate-950">الدعوات المعلقة</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">راجع الدعوات المرسلة وألغِ غير المطلوبة.</p>
        </div>
        <div className="divide-y divide-slate-200">
          {pendingInvites.map((invite) => (
            <article key={invite.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-black text-slate-950">{invite.email}</div>
                <div className="mt-1 text-xs font-medium text-slate-500">تنتهي {invite.expiresLabel}</div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600">
                  {invite.role}
                </span>
                <span className="text-xs font-semibold text-slate-600">{invite.status}</span>
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
                    }}
                    className="border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
                  >
                    إلغاء الدعوة
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
