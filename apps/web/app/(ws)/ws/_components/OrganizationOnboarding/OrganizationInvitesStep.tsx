"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { IncomingOrganizationInvite } from "@/server/contracts/organizations";
import { acceptIncomingInvite, declineIncomingInvite } from "./organizationInvitesActions";
import OnboardingLogoutButton from "./OnboardingLogoutButton";

type OrganizationInvitesStepProps = {
  invites: IncomingOrganizationInvite[];
  canCreateOrganization: boolean;
  organizationCreationDisabledReason?: string;
  onCreateNew: () => void;
};

/**
 * WHY:   Users should resolve invites before creating a new organization.
 * WHAT:  Renders incoming invites with accept/decline actions and a create-new CTA.
 * HOW:   Calls invite endpoints, then refreshes or advances the journey as needed.
 */
export default function OrganizationInvitesStep({
  invites,
  canCreateOrganization,
  organizationCreationDisabledReason,
  onCreateNew,
}: OrganizationInvitesStepProps) {
  const router = useRouter();
  const [pendingInvites, setPendingInvites] = useState(invites);
  const [pendingInviteId, setPendingInviteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleAcceptInvite = async (invite: IncomingOrganizationInvite) => {
    setErrorMessage(null);
    setPendingInviteId(invite.id);
    const ok = await acceptIncomingInvite(invite.token);

    if (!ok) {
      setErrorMessage("تعذر قبول الدعوة حالياً.");
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
      setErrorMessage("تعذر رفض الدعوة حالياً.");
      setPendingInviteId(null);
      return;
    }

    setPendingInvites((current) => current.filter((entry) => entry.id !== inviteId));
    setPendingInviteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="text-sm font-black text-slate-900">الدعوات والمسار</div>
        <p className="text-sm text-slate-500">
          إذا كانت لديك دعوة، اقبلها للانضمام مباشرة. أو أنشئ جهة جديدة.
        </p>
      </div>

      {pendingInvites.length > 0 ? (
        <div className="grid gap-4">
          {pendingInvites.map((invite) => {
            const typeLabel = invite.organizationType === "broker" ? "وسيط عقاري" : "مطور عقاري";
            const isPending = pendingInviteId === invite.id;

            return (
              <div key={invite.id} className="border-2 border-slate-100 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-black text-slate-900">{invite.organizationName}</div>
                    <div className="text-xs text-slate-500">{typeLabel}</div>
                    <div className="text-xs text-slate-500">دعوة من {invite.inviterName}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => void handleAcceptInvite(invite)}
                      disabled={isPending}
                      className="border-2 border-blue-600 bg-blue-600 px-8 py-2.5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-blue-700 disabled:opacity-60"
                    >
                      قبول الدعوة
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeclineInvite(invite.id)}
                      disabled={isPending}
                      className="border-2 border-blue-600 bg-white px-8 py-2.5 text-xs font-black uppercase tracking-widest text-blue-600 transition hover:bg-blue-50 disabled:opacity-60"
                    >
                      رفض
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border-2 border-slate-100 bg-white px-4 py-3 text-sm text-slate-500">
          لا توجد دعوات حالياً.
        </div>
      )}

      {errorMessage ? (
        <div className="border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {canCreateOrganization ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-500">أو أنشئ جهة جديدة لتبدأ العمل.</div>
          <button
            type="button"
            onClick={onCreateNew}
            className="border-2 border-blue-600 bg-white px-8 py-2.5 text-xs font-black uppercase tracking-widest text-blue-600 transition hover:bg-blue-50"
          >
            إنشاء جهة جديدة
          </button>
        </div>
      ) : (
        <div className="border-2 border-amber-200 bg-amber-50 px-4 py-4">
          <div className="space-y-3">
            <div className="text-sm font-black text-amber-900">لا يمكن إنشاء جهة جديدة</div>
            <p className="text-xs text-amber-800">
              {organizationCreationDisabledReason
                ?? "هذا الحساب لا يملك صلاحية إنشاء جهة جديدة. تواصل مع مسؤول النظام أو سجّل الخروج لتبديل الحساب."}
            </p>
            <div>
              <OnboardingLogoutButton
                variant="ghost"
                className="border-amber-200 text-amber-900 hover:border-amber-300 hover:bg-amber-100 hover:text-amber-900"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
