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
 * WHY:   The invites step needs to feel integrated and professional.
 * WHAT:  Modernizes invite cards with rounded-3xl geometry and high-contrast actions.
 * HOW:   Uses rounded-2xl for invite cards and rounded-full for action buttons.
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
    const ok = await acceptIncomingInvite(invite);

    if (!ok) {
      setErrorMessage("تعذر قبول الدعوة حالياً.");
      setPendingInviteId(null);
      return;
    }

    if (invite.acceptUrl) {
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
    <div className="space-y-10">
      <div className="space-y-2 text-right">
        <div className="text-xl font-black tracking-tight text-slate-900">الدعوات والمسار</div>
        <p className="text-sm font-medium text-slate-500">
          إذا كانت لديك دعوة، اقبلها للانضمام مباشرة. أو أنشئ جهة جديدة.
        </p>
      </div>

      {pendingInvites.length > 0 ? (
        <div className="grid gap-6">
          {pendingInvites.map((invite) => {
            const typeLabel = invite.organizationType === "broker" ? "وسيط عقاري" : "مطور عقاري";
            const isPending = pendingInviteId === invite.id;

            return (
              <div key={invite.id} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="space-y-1.5 text-right">
                    <div className="text-[17px] font-black tracking-tight text-slate-900">{invite.organizationName}</div>
                    <div className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">{typeLabel}</div>
                    <div className="text-[14px] font-medium text-slate-500">دعوة من {invite.inviterName}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => void handleAcceptInvite(invite)}
                      disabled={isPending}
                      className="rounded-full bg-slate-900 px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-slate-800 disabled:opacity-50"
                    >
                      قبول الدعوة
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeclineInvite(invite.id)}
                      disabled={isPending}
                      className="rounded-full bg-slate-100 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
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
        <div className="rounded-3xl border border-slate-100 bg-slate-50 px-8 py-10 text-center text-sm font-medium text-slate-400">
          لا توجد دعوات حالياً.
        </div>
      )}

      {errorMessage ? (
        <div className="rounded-2xl bg-red-50 p-4 text-[13px] font-bold text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {canCreateOrganization ? (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-50 pt-8">
          <div className="text-[15px] font-medium text-slate-500">أو أنشئ جهة جديدة لتبدأ العمل.</div>
          <button
            type="button"
            onClick={onCreateNew}
            className="rounded-full border border-slate-200 bg-white px-10 py-3.5 text-xs font-black uppercase tracking-widest text-slate-900 transition hover:bg-slate-50"
          >
            إنشاء جهة جديدة
          </button>
        </div>
      ) : (
        <div className="rounded-3xl bg-amber-50 p-8 shadow-sm">
          <div className="space-y-4 text-right">
            <div className="text-sm font-black text-amber-900">لا يمكن إنشاء جهة جديدة</div>
            <p className="text-[13px] leading-relaxed font-medium text-amber-800">
              {organizationCreationDisabledReason
                ?? "هذا الحساب لا يملك صلاحية إنشاء جهة جديدة. تواصل مع مسؤول النظام أو سجّل الخروج لتبديل الحساب."}
            </p>
            <div className="pt-2">
              <OnboardingLogoutButton
                variant="ghost"
                className="rounded-full border-amber-200 text-amber-900 hover:border-amber-300 hover:bg-amber-100 active:scale-95"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
