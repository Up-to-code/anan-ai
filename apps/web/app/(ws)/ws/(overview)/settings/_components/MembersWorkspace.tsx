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
import { formatWebCopy } from "@/lib/i18n";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import type { DirectorySearchResult } from "@/server/contracts/organizations";

const roles = ["manager", "member", "viewer"] as const;

function queueStatusClear(setStatus: (value: string | null) => void) {
  setTimeout(() => setStatus(null), 3000);
}

function StatusNotice({ status }: { status: string | null }) {
  const { direction } = useWebLocale();
  if (!status) return null;
  return (
    <div className="rounded-xl border border-border/70 bg-background/60 px-4 py-3 text-[13px] font-bold text-foreground" dir={direction}>
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
    <div className="flex flex-wrap gap-1.5">
      {roles.map((role) => (
        <button
          key={role}
          type="button"
          disabled={!args.canManage}
          onClick={() => args.onRoleChange(args.member, role)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all",
            args.member.role === role
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-40",
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
          <MemberRoleButtons member={args.member} canManage={args.canManage} onRoleChange={args.onRoleChange} />
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
  const { dictionary, direction, isRtl } = useWebLocale();
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 last:border-0" dir={direction}>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-bold text-foreground" dir="ltr">
          {args.invite.email}
        </div>
        <div className={cn("mt-0.5 text-[11px] text-muted-foreground", isRtl ? "text-right" : "text-left")}>
          {formatWebCopy(dictionary.settings.inviteExpires, { date: args.invite.expiresLabel })}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
          {getOrganizationMemberRoleLabel(args.invite.role)}
        </span>
        {args.canManage ? (
          <button
            type="button"
            onClick={() => args.onCancelInvite(args.invite)}
            className="rounded-lg px-3 py-1.5 text-[11px] font-bold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            {dictionary.inbox.cancel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function MembersWorkspace({
  initialMembers,
  invites,
  canManage,
  hasOrganization,
  organizationType,
  onCreateInvite,
  onCancelInvite,
  onSearchDirectory,
  onUpdateRole,
}: {
  initialMembers: OrganizationMemberDisplay[];
  invites: OrganizationInviteDisplay[];
  canManage: boolean;
  hasOrganization: boolean;
  organizationType: OrganizationSummary["type"] | null | undefined;
  onCreateInvite: (input: {
    email: string;
    role: "manager" | "member" | "viewer";
  }) => Promise<{ ok: true; message: string; inviteId?: string } | { ok: false; message: string }>;
  onCancelInvite: (inviteId: string) => Promise<{ ok: true; message: string } | { ok: false; message: string }>;
  onSearchDirectory: (query: string) => Promise<{ ok: true; results: DirectorySearchResult[] } | { ok: false; message: string }>;
  onUpdateRole: (
    membershipId: string,
    input: { role: "manager" | "member" | "viewer" },
  ) => Promise<{ ok: true; message: string } | { ok: false; message: string }>;
}) {
  const { dictionary, direction } = useWebLocale();
  const [members, setMembers] = useState(initialMembers);
  const [pendingInvites, setPendingInvites] = useState(invites);
  const [status, setStatus] = useState<string | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const handleRoleChange = async (member: OrganizationMemberDisplay, role: OrganizationMemberDisplay["role"]) => {
    if (!canManage || member.role === role) return;
    setStatus(dictionary.settings.roleUpdateInProgress);
    const result = await onUpdateRole(member.membershipId, { role });
    if (!result.ok) {
      setStatus(result.message);
      return;
    }
    setMembers((current) => current.map((entry) => (entry.id === member.id ? { ...entry, role } : entry)));
    setStatus(
      formatWebCopy(dictionary.settings.roleUpdated, {
        name: member.name,
        role: getOrganizationMemberRoleLabel(role),
      }),
    );
    queueStatusClear(setStatus);
  };

  const handleCancelInvite = async (invite: OrganizationInviteDisplay) => {
    setStatus(dictionary.settings.inviteCancelInProgress);
    const result = await onCancelInvite(invite.id);
    if (!result.ok) {
      setStatus(result.message);
      return;
    }
    setPendingInvites((current) => current.filter((entry) => entry.id !== invite.id));
    setStatus(result.message);
    queueStatusClear(setStatus);
  };

  return (
    <div className="space-y-6 pb-12" dir={direction}>
      <StatusNotice status={status} />

      {/* Section header + invite button */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">
            {formatWebCopy(dictionary.settings.membersTitle, { count: members.length })}
          </h2>
          {canManage ? (
            <Dialog.Root open={isInviteOpen} onOpenChange={setIsInviteOpen}>
              <Dialog.Trigger className="inline-flex h-9 items-center gap-2 rounded-xl bg-foreground px-4 text-[12px] font-bold text-background transition hover:opacity-90 active:scale-[0.98]">
                <Plus className="h-3.5 w-3.5" />
                {dictionary.settings.inviteMember}
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-all duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
                <Dialog.Popup className="pointer-events-none fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 outline-none transition-all duration-300 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
                  <div className="pointer-events-auto flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-background overscroll-contain">
                    <div className="flex items-center justify-between border-b border-border p-5" dir={direction}>
                      <Dialog.Title className="text-base font-bold text-foreground">{dictionary.settings.inviteMemberTitle}</Dialog.Title>
                      <Dialog.Close className="flex rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground">
                        <X className="h-4 w-4" />
                      </Dialog.Close>
                    </div>
                    <div className="p-1">
                      <InviteMemberForm
                        canManage={canManage}
                        hasOrganization={hasOrganization}
                        showHeader={false}
                        onCreateInvite={onCreateInvite}
                        onSearchDirectory={onSearchDirectory}
                      />
                    </div>
                  </div>
                </Dialog.Popup>
              </Dialog.Portal>
            </Dialog.Root>
          ) : null}
        </div>
        <p className="text-xs font-medium text-muted-foreground">
          {dictionary.settings.managerGuardrail}
        </p>
      </div>

      {/* Members list */}
      <div className="space-y-2">
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

      {/* Pending invites */}
      {pendingInvites.length > 0 ? (
        <div className="space-y-3 pt-2">
          <h2 className="text-base font-bold text-foreground">
            {formatWebCopy(dictionary.settings.pendingInvitesTitle, { count: pendingInvites.length })}
          </h2>
          <div className="overflow-hidden rounded-xl border border-border/70 bg-background/50">
            {pendingInvites.map((invite) => (
              <InviteRow key={invite.id} invite={invite} canManage={canManage} onCancelInvite={handleCancelInvite} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
