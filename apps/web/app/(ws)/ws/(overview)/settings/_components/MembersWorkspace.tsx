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
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {members.map((member) => (
          <article key={member.id} className="border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-black text-slate-950">{member.name}</div>
                <div className="mt-1 text-sm font-medium text-slate-500">{member.email}</div>
              </div>
              <span className="border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-black tracking-[0.16em] text-blue-700">
                {member.statusLabel}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
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
                  className={`border px-3 py-2 text-[10px] font-black tracking-[0.18em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 ${
                    member.role === role
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-slate-200 bg-white text-slate-600"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {role}
                </button>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-black text-slate-950">الدعوات المعلقة</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pendingInvites.map((invite) => (
            <article key={invite.id} className="border border-slate-200 bg-white p-4">
              <div className="text-sm font-black text-slate-950">{invite.email}</div>
              <div className="mt-2 text-xs font-medium text-slate-500">تنتهي {invite.expiresLabel}</div>
              <div className="mt-4 flex items-center justify-between">
                <span className="border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-black tracking-[0.16em] text-slate-600">
                  {invite.role}
                </span>
                <span className="text-[10px] font-black tracking-[0.16em] text-blue-700">{invite.status}</span>
              </div>
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
                  className="mt-4 border border-slate-200 px-3 py-2 text-[10px] font-black tracking-[0.18em] text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
                >
                  إلغاء الدعوة
                </button>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
