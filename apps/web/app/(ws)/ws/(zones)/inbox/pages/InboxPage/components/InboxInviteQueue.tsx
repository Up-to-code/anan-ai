"use client";

import { Check, MessageCircle, X } from "lucide-react";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import type { IncomingOrganizationInvite } from "@/server/contracts/organizations";

function InboxInviteRow({
  invite,
  onAcceptInvite,
  onCancelInvite,
  onMessageInvite,
}: {
  invite: IncomingOrganizationInvite;
  onAcceptInvite: (invite: IncomingOrganizationInvite) => void;
  onCancelInvite: (inviteId: string) => void;
  onMessageInvite: (invite: IncomingOrganizationInvite) => void;
}) {
  const { dictionary } = useWebLocale();

  return (
    <article className="space-y-3 px-4 py-4">
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-black text-[var(--workspace-bubble-other-foreground)]">{invite.organizationName}</div>
            <div className="text-xs font-medium text-[var(--workspace-muted)]">{invite.organizationType === "broker" ? dictionary.inbox.brokerInvite : dictionary.inbox.developerInvite}</div>
          </div>
          <div className="text-[11px] font-medium text-[color:color-mix(in_srgb,var(--workspace-muted)_85%,transparent)]">{new Date(invite.expiresAt).toLocaleDateString("ar-EG")}</div>
        </div>
        <p className="text-xs font-medium leading-5 text-[var(--workspace-muted)]">{dictionary.inbox.from} {invite.inviterName} · {dictionary.inbox.proposedRole}: {invite.role}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onAcceptInvite(invite)} className="inline-flex items-center gap-2 rounded-2xl border border-[color:color-mix(in_srgb,var(--workspace-highlight)_34%,transparent)] bg-[var(--workspace-highlight)] px-3 py-2 text-xs font-bold text-[var(--primary-foreground)] transition hover:brightness-110">
          <Check className="h-3.5 w-3.5" />
          {dictionary.inbox.accept}
        </button>
        <button type="button" onClick={() => onMessageInvite(invite)} className="inline-flex items-center gap-2 rounded-2xl border border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-panel)] px-3 py-2 text-xs font-bold text-[var(--workspace-bubble-other-foreground)] transition hover:bg-[var(--workspace-elevated)]">
          <MessageCircle className="h-3.5 w-3.5" />
          {dictionary.inbox.message}
        </button>
        <button type="button" onClick={() => onCancelInvite(invite.id)} className="inline-flex items-center gap-2 rounded-2xl border border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-panel)] px-3 py-2 text-xs font-bold text-[var(--workspace-muted)] transition hover:text-rose-300">
          <X className="h-3.5 w-3.5" />
          {dictionary.inbox.cancel}
        </button>
      </div>
    </article>
  );
}

export default function InboxInviteQueue({
  invites,
  onAcceptInvite,
  onCancelInvite,
  onMessageInvite,
}: {
  invites: IncomingOrganizationInvite[];
  onAcceptInvite: (invite: IncomingOrganizationInvite) => void;
  onCancelInvite: (inviteId: string) => void;
  onMessageInvite: (invite: IncomingOrganizationInvite) => void;
}) {
  const { dictionary } = useWebLocale();

  if (invites.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-[24px] border border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-panel)]">
      <div className="border-b border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] px-4 py-3">
        <h2 className="text-sm font-black text-[var(--workspace-bubble-other-foreground)]">{dictionary.inbox.incomingInvites}</h2>
        <p className="mt-1 text-xs font-medium leading-5 text-[var(--workspace-muted)]">
          {dictionary.inbox.incomingInvitesDescription}
        </p>
      </div>

      <div className="divide-y divide-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)]">
        {invites.map((invite) => (
          <InboxInviteRow
            key={invite.id}
            invite={invite}
            onAcceptInvite={onAcceptInvite}
            onCancelInvite={onCancelInvite}
            onMessageInvite={onMessageInvite}
          />
        ))}
      </div>
    </section>
  );
}
