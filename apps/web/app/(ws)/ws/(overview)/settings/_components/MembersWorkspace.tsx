"use client";

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Plus, X } from "lucide-react";
import type { OrganizationSummary } from "@/server/contracts/organizations";
import InviteMemberForm from "./InviteMemberForm";
import OrganizationMemberCard from "../../../_components/Visuals/OrganizationMemberCard";
import type { OrganizationInviteDisplay, OrganizationMemberDisplay } from "../../../_lib/entities";
import { getOrganizationMemberRoleLabel } from "../../../_lib/organizationMembers";
import { cn } from "@/lib/utils";

const roles = ["manager", "member", "viewer"] as const;

function queueStatusClear(setStatus: (value: string | null) => void) {
  setTimeout(() => setStatus(null), 3000);
}

function StatusNotice({ status }: { status: string | null }) {
  if (!status) return null;
  return (
    <div className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-[13px] font-bold text-foreground">
      {status}
    </div>
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
            "rounded-xl border px-3 py-1.5 text-[11px] font-black uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            args.member.role === role
              ? "border-foreground bg-foreground text-background shadow-sm"
              : "border-border bg-background text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {getOrganizationMemberRoleLabel(role)}
        </button>
      ))}
    </div>
  );
}

function MemberCard(args: {
  member: OrganizationMemberDisplay;
  canManage: boolean;
  organizationType: OrganizationSummary["type"] | null | undefined;
  onRoleChange: (member: OrganizationMemberDisplay, role: OrganizationMemberDisplay["role"]) => Promise<void>;
}) {
  return (
    <OrganizationMemberCard
      member={args.member}
      organizationType={args.organizationType}
      footer={
        args.canManage ? (
          <div className="space-y-2">
            <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              إدارة الدور
            </div>
            <MemberRoleButtons member={args.member} canManage={args.canManage} onRoleChange={args.onRoleChange} />
          </div>
        ) : null
      }
    />
  );
}

function InviteRow(args: {
  invite: OrganizationInviteDisplay;
  canManage: boolean;
  onCancelInvite: (invite: OrganizationInviteDisplay) => Promise<void>;
}) {
  return (
    <article className="flex flex-col gap-4 border-b border-border px-4 py-4 transition-colors last:border-0 hover:bg-muted/30 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <div className="truncate text-[14px] font-bold text-foreground" dir="ltr">
          {args.invite.email}
        </div>
        <div className="mt-1 text-[12px] font-medium text-muted-foreground">تنتهي {args.invite.expiresLabel}</div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">
          {getOrganizationMemberRoleLabel(args.invite.role)}
        </span>
        {args.canManage ? (
          <button
            type="button"
            onClick={() => args.onCancelInvite(args.invite)}
            className="rounded-xl border border-red-500/30 bg-background px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-red-600 shadow-sm transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:hover:bg-red-500/10"
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
 * WHAT:  Renders current members as reusable cards plus pending invites and supports local-only role reassignment in the UI.
 * HOW:   Starts from server-rendered data, reuses the shared organization member card, and keeps invite operations unchanged.
 */
export default function MembersWorkspace({
  initialMembers,
  invites,
  canManage,
  hasOrganization,
  organizationType,
}: {
  initialMembers: OrganizationMemberDisplay[];
  invites: OrganizationInviteDisplay[];
  canManage: boolean;
  hasOrganization: boolean;
  organizationType: OrganizationSummary["type"] | null | undefined;
}) {
  const [members, setMembers] = useState(initialMembers);
  const [pendingInvites, setPendingInvites] = useState(invites);
  const [status, setStatus] = useState<string | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

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
    setStatus(`تم تغيير دور ${member.name} إلى ${getOrganizationMemberRoleLabel(role)}.`);
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
    <div className="space-y-8 pb-12">
      <StatusNotice status={status} />

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold text-foreground">أعضاء المنظمة ({members.length})</h2>
          <p className="text-[13px] font-medium text-muted-foreground">إدارة الأدوار والصلاحيات للأعضاء الحاليين.</p>
        </div>
        {canManage ? (
          <Dialog.Root open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <Dialog.Trigger className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-[13px] font-bold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <Plus className="h-4 w-4" />
              دعوة عضو
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-all duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
              <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[24px] bg-background shadow-xl transition-all duration-300 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between border-b border-border p-5">
                    <Dialog.Title className="text-lg font-bold text-foreground">دعوة عضو جديد</Dialog.Title>
                    <Dialog.Close className="flex rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <X className="h-4 w-4" />
                    </Dialog.Close>
                  </div>
                  <div className="bg-muted/10 p-1">
                    <InviteMemberForm canManage={canManage} hasOrganization={hasOrganization} showHeader={false} />
                  </div>
                </div>
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
        ) : null}
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              canManage={canManage}
              organizationType={organizationType}
              onRoleChange={handleRoleChange}
            />
          ))}
        </div>
      </div>

      {pendingInvites.length > 0 ? (
        <>
          <div className="flex flex-col gap-1 pt-4">
            <h2 className="text-lg font-bold text-foreground">الدعوات المعلقة ({pendingInvites.length})</h2>
            <p className="text-[13px] font-medium text-muted-foreground">راجع الدعوات المرسلة وألغِ غير المطلوبة.</p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex flex-col">
              {pendingInvites.map((invite) => (
                <InviteRow key={invite.id} invite={invite} canManage={canManage} onCancelInvite={handleCancelInvite} />
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
