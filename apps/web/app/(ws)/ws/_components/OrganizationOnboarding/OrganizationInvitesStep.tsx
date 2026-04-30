"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { IncomingOrganizationInvite } from "@/server/contracts/organizations";
import { acceptIncomingInvite, declineIncomingInvite } from "./organizationInvitesActions";
import OnboardingLogoutButton from "./OnboardingLogoutButton";
import { OnboardingActionDock, MotionEffects } from "./OnboardingMotion";

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
    <MotionEffects className="mx-auto max-w-2xl space-y-7" slide="up" zoom>
      <div className="space-y-2 text-right">
        <div className="text-xl font-black tracking-tight text-foreground">الدعوات والمسار</div>
        <p className="text-sm font-medium text-muted-foreground">
          إذا كانت لديك دعوة، اقبلها للانضمام مباشرة. أو أنشئ جهة جديدة.
        </p>
      </div>

      {pendingInvites.length > 0 ? (
        <div className="grid gap-4">
          {pendingInvites.map((invite) => {
            const typeLabel = invite.organizationType === "broker" ? "وسيط عقاري" : "مطور عقاري";
            const isPending = pendingInviteId === invite.id;

            return (
              <div key={invite.id} className="rounded-[24px] border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1.5 text-right">
                    <div className="text-[17px] font-black tracking-tight text-foreground">{invite.organizationName}</div>
                    <div className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground">{typeLabel}</div>
                    <div className="text-[14px] font-medium text-muted-foreground">دعوة من {invite.inviterName}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      data-testid="onboarding-invite-accept"
                      onClick={() => void handleAcceptInvite(invite)}
                      disabled={isPending}
                      className="rounded-full bg-foreground px-8 py-3.5 text-xs font-black uppercase tracking-widest text-background transition hover:bg-foreground/90 disabled:opacity-50"
                    >
                      قبول الدعوة
                    </button>
                    <button
                      type="button"
                      data-testid="onboarding-invite-decline"
                      onClick={() => void handleDeclineInvite(invite.id)}
                      disabled={isPending}
                      className="rounded-full bg-muted px-6 py-3.5 text-xs font-black uppercase tracking-widest text-muted-foreground transition hover:bg-muted/80 disabled:opacity-50"
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
        <div className="rounded-[24px] border border-border bg-muted/30 px-6 py-8 text-center text-sm font-medium text-muted-foreground">
          لا توجد دعوات حالياً.
        </div>
      )}

      {errorMessage ? (
        <div className="rounded-2xl bg-red-50 p-4 text-[13px] font-bold text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {canCreateOrganization ? (
        <OnboardingActionDock>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-[15px] font-medium text-muted-foreground">أو أنشئ جهة جديدة لتبدأ العمل.</div>
            <button
              type="button"
              data-testid="onboarding-create-organization"
              onClick={onCreateNew}
              className="rounded-full border border-border bg-background px-10 py-3.5 text-xs font-black uppercase tracking-widest text-foreground transition hover:bg-muted/20"
            >
              إنشاء جهة جديدة
            </button>
          </div>
        </OnboardingActionDock>
      ) : (
        <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-8 shadow-sm">
          <div className="space-y-4 text-right">
            <div className="text-sm font-black text-amber-800 dark:text-amber-300">لا يمكن إنشاء جهة جديدة</div>
            <p className="text-[13px] leading-relaxed font-medium text-amber-700 dark:text-amber-200">
              {organizationCreationDisabledReason
                ?? "هذا الحساب لا يملك صلاحية إنشاء جهة جديدة. تواصل مع مسؤول النظام أو سجّل الخروج لتبديل الحساب."}
            </p>
            <div className="pt-2">
              <OnboardingLogoutButton
                variant="ghost"
                className="border-amber-500/30 bg-transparent text-amber-800 hover:border-amber-500/40 hover:bg-amber-500/10 dark:text-amber-200 active:scale-95"
              />
            </div>
          </div>
        </div>
      )}
    </MotionEffects>
  );
}
