"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { OrganizationInviteDisplay, OrganizationMemberDisplay } from "../../../_lib/entities";

const roleLabels: Record<OrganizationMemberDisplay["role"], string> = {
  manager: "مدير",
  member: "عضو",
  viewer: "مشاهد",
};

const roles = ["manager", "member", "viewer"] as const;

function queueStatusClear(setStatus: (value: string | null) => void) {
  setTimeout(() => setStatus(null), 3000);
}

function StatusNotice({ status }: { status: string | null }) {
  if (!status) return null;
  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50/50 px-4 py-3 text-xs font-bold text-blue-700">
      {status}
    </div>
  );
}

function MemberStatusPill({ label }: { label: string }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest",
        label === "نشط" ? "border-green-100 bg-green-50 text-green-700" : "border-slate-200 bg-slate-50 text-slate-500",
      )}
    >
      {label}
    </span>
  );
}

function MemberRoleButtons(args: {
  member: OrganizationMemberDisplay;
  canManage: boolean;
  onRoleChange: (member: OrganizationMemberDisplay, role: OrganizationMemberDisplay["role"]) => Promise<void>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {roles.map((role) => (
        <button
          key={role}
          type="button"
          disabled={!args.canManage}
          onClick={() => args.onRoleChange(args.member, role)}
          className={cn(
            "rounded-lg border px-3 py-1.5 text-xs font-black tracking-widest uppercase transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
            args.member.role === role
              ? "border-blue-600 bg-blue-600 text-white shadow-sm"
              : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {roleLabels[role]}
        </button>
      ))}
    </div>
  );
}

function MemberRow(args: {
  member: OrganizationMemberDisplay;
  canManage: boolean;
  onRoleChange: (member: OrganizationMemberDisplay, role: OrganizationMemberDisplay["role"]) => Promise<void>;
}) {
  return (
    <article className="flex flex-col gap-4 p-6 transition hover:bg-slate-50/30 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <div className="truncate text-base font-black text-slate-950">{args.member.name}</div>
        <div className="mt-1 truncate text-xs font-medium text-slate-500" dir="ltr">{args.member.email}</div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <MemberStatusPill label={args.member.statusLabel} />
        <MemberRoleButtons member={args.member} canManage={args.canManage} onRoleChange={args.onRoleChange} />
      </div>
    </article>
  );
}

function InviteRow(args: {
  invite: OrganizationInviteDisplay;
  canManage: boolean;
  onCancelInvite: (invite: OrganizationInviteDisplay) => Promise<void>;
}) {
  return (
    <article className="flex flex-col gap-4 p-6 transition hover:bg-slate-50/30 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <div className="truncate text-sm font-black text-slate-950" dir="ltr">{args.invite.email}</div>
        <div className="mt-1 text-xs font-medium text-slate-400">تنتهي {args.invite.expiresLabel}</div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <span className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-700">
          {roleLabels[args.invite.role]}
        </span>
        {args.canManage ? (
          <button
            type="button"
            onClick={() => args.onCancelInvite(args.invite)}
            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-black tracking-widest uppercase text-red-600 shadow-sm transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            إلغاء الدعوة
          </button>
        ) : null}
      </div>
    </article>
  );
}

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

  const handleRoleChange = async (member: OrganizationMemberDisplay, role: OrganizationMemberDisplay["role"]) => {
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
    setMembers((current) => current.map((entry) => (entry.id === member.id ? { ...entry, role } : entry)));
    setStatus(`تم تغيير دور ${member.name} إلى ${roleLabels[role]}.`);
    queueStatusClear(setStatus);
  };

  const handleCancelInvite = async (invite: OrganizationInviteDisplay) => {
    setStatus("جاري إلغاء الدعوة...");
    const response = await fetch(`/api/workspace/team-invites/${invite.id}`, { method: "DELETE" });
    if (!response.ok) {
      const payload = (await response.json()) as { message?: string };
      setStatus(payload.message ?? "تعذر إلغاء الدعوة.");
      return;
    }
    setPendingInvites((current) => current.filter((entry) => entry.id !== invite.id));
    setStatus("تم إلغاء الدعوة.");
    queueStatusClear(setStatus);
  };

  return (
    <div className="space-y-6">
      <StatusNotice status={status} />

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-xl font-black tracking-tight text-slate-950">أعضاء المنظمة ({members.length})</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">إدارة الأدوار والصلاحيات للأعضاء الحاليين.</p>
        </div>
        <div className="divide-y divide-slate-100">
          {members.map((member) => (
            <MemberRow key={member.id} member={member} canManage={canManage} onRoleChange={handleRoleChange} />
          ))}
        </div>
      </section>

      {pendingInvites.length > 0 ? (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-xl font-black tracking-tight text-slate-950">الدعوات المعلقة ({pendingInvites.length})</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">راجع الدعوات المرسلة وألغِ غير المطلوبة.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingInvites.map((invite) => (
              <InviteRow key={invite.id} invite={invite} canManage={canManage} onCancelInvite={handleCancelInvite} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
