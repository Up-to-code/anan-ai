"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { IncomingOrganizationInvite } from "@/server/contracts/organizations";
import { acceptIncomingInvite, declineIncomingInvite } from "./organizationInvitesActions";

type OrganizationInvitesClientProps = {
  invites: IncomingOrganizationInvite[];
  strings: {
    eyebrow: string;
    title: string;
    description: string;
    acceptLabel: string;
    declineLabel: string;
    brokerTypeLabel: string;
    developerTypeLabel: string;
    inviterPrefix: string;
    acceptError: string;
    declineError: string;
  };
};

/**
 * WHY:   First-time users need a clear path to accept org invites before creating new orgs.
 * WHAT:  Renders incoming organization invites with accept/decline actions and optimistic updates.
 * HOW:   Calls gateway invite endpoints and refreshes the workspace on successful acceptance.
 */
export default function OrganizationInvitesClient({
  invites,
  strings,
}: OrganizationInvitesClientProps) {
  const router = useRouter();
  const [pendingInvites, setPendingInvites] = useState(invites);
  const [pendingInviteId, setPendingInviteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (pendingInvites.length === 0) {
    return null;
  }

  const handleAcceptInvite = async (invite: IncomingOrganizationInvite) => {
    setErrorMessage(null);
    setPendingInviteId(invite.id);
    const ok = await acceptIncomingInvite(invite.token);

    if (!ok) {
      setErrorMessage(strings.acceptError);
      setPendingInviteId(null);
      return;
    }

    setPendingInvites((current) => current.filter((entry) => entry.id !== invite.id));
    startTransition(() => {
      router.refresh();
      router.replace("/ws");
    });
  };

  const handleDeclineInvite = async (inviteId: string) => {
    setErrorMessage(null);
    setPendingInviteId(inviteId);
    const ok = await declineIncomingInvite(inviteId);

    if (!ok) {
      setErrorMessage(strings.declineError);
      setPendingInviteId(null);
      return;
    }

    setPendingInvites((current) => current.filter((entry) => entry.id !== inviteId));
    setPendingInviteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="text-xs font-black uppercase tracking-widest text-slate-400">{strings.eyebrow}</div>
          <h2 className="text-2xl font-black text-slate-950">{strings.title}</h2>
          <p className="text-sm font-bold text-slate-500">
            {strings.description}
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {pendingInvites.map((invite) => {
          const typeLabel =
            invite.organizationType === "broker"
              ? strings.brokerTypeLabel
              : strings.developerTypeLabel;
          const isPending = pendingInviteId === invite.id;

          return (
            <div
              key={invite.id}
              className="flex flex-col gap-4 border-2 border-slate-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {typeLabel}
                  </div>
                  <div className="text-lg font-black text-slate-900">{invite.organizationName}</div>
                  <div className="text-xs font-bold text-slate-500">
                    {strings.inviterPrefix} {invite.inviterName}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void handleAcceptInvite(invite)}
                    disabled={isPending}
                    className="border-2 border-blue-700 bg-blue-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition hover:border-blue-800 hover:bg-blue-700 disabled:opacity-60"
                  >
                    {strings.acceptLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeclineInvite(invite.id)}
                    disabled={isPending}
                    className="border-2 border-slate-300 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 transition hover:border-slate-400 hover:text-slate-800 disabled:opacity-60"
                  >
                    {strings.declineLabel}
                  </button>
                </div>
              </div>

              {errorMessage ? (
                <div className="border-2 border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700">
                  {errorMessage}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
