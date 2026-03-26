"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Building2, ChevronDown, FileUp, Tag, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConversationDetail } from "@/server/contracts/inbox";
import type { InboxShareAction } from "./InboxComposerActions";

function getParticipantTypeLabel(conversation: ConversationDetail) {
  if (conversation.otherUser.organizationType === "broker") {
    return "وسيط";
  }

  if (conversation.otherUser.organizationType === "developer") {
    return "مطور";
  }

  const role = conversation.otherUser.role?.trim();
  return role || "مستخدم";
}

export function getInboxThreadMenuActionLabels(args: {
  canCreateOffer: boolean;
  canShareProjects: boolean;
  canUseBusinessActions: boolean;
}) {
  if (!args.canUseBusinessActions) {
    return [];
  }

  return [
    args.canCreateOffer ? "إنشاء عرض خاص" : null,
    args.canShareProjects ? "إرسال عقار أو شقة" : null,
    "إرفاق ملف",
  ].filter((value): value is string => Boolean(value));
}

function ThreadAvatar({ image, name }: { image?: string | null; name: string }) {
  if (image) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={image}
        alt={name}
        className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)]"
      />
    );
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--workspace-elevated)] text-sm font-black text-[var(--workspace-muted)]">
      {name.slice(0, 1) || "؟"}
    </div>
  );
}

function HeaderIdentity({
  conversation,
}: {
  conversation: ConversationDetail;
}) {
  const organizationLabel = conversation.otherUser.organizationName ?? "بدون جهة مرتبطة";
  const participantType = getParticipantTypeLabel(conversation);

  return (
    <div className="min-w-0 flex-1">
      <div className="truncate text-base font-black text-[var(--workspace-bubble-other-foreground)]">
        {conversation.otherUser.name}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--workspace-muted)]">
        <span className="inline-flex items-center gap-1 rounded-full border border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-elevated)] px-2.5 py-1">
          <Building2 className="h-3.5 w-3.5" />
          {organizationLabel}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-elevated)] px-2.5 py-1">
          <UserRound className="h-3.5 w-3.5" />
          {participantType}
        </span>
      </div>
    </div>
  );
}

function HeaderActionButton({
  action,
  disabled = false,
  label,
  onClick,
}: {
  action: InboxShareAction;
  disabled?: boolean;
  label: string;
  onClick: (action: InboxShareAction) => void;
}) {
  const Icon = action === "offer" ? Tag : action === "project" ? Building2 : FileUp;

  return (
    <button
      type="button"
      onClick={() => onClick(action)}
      disabled={disabled}
      className="flex w-full items-start gap-3 rounded-2xl border border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-elevated)] px-3 py-3 text-right transition hover:bg-[var(--workspace-panel)] disabled:cursor-not-allowed disabled:opacity-55"
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--workspace-highlight)]" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-black text-[var(--workspace-bubble-other-foreground)]">
          {label}
        </span>
        <span className="mt-1 block text-[11px] font-medium text-[var(--workspace-muted)]">
          {disabled ? "غير متاح لهذه المحادثة حاليًا." : "افتح هذا الإجراء من نفس الشاشة."}
        </span>
      </span>
    </button>
  );
}

/**
 * WHY:   The active thread header should identify the person first, then expose just a few practical actions.
 * WHAT:  Renders the thread header with avatar, name, organization, type, and a compact action dropdown.
 * HOW:   Keeps the identity always visible and uses a lightweight controlled menu for quick inbox actions.
 */
export default function InboxThreadHeader({
  canCreateOffer = false,
  canShareProjects = false,
  canUseBusinessActions = false,
  conversation,
  onBack,
  onOpenShareAction,
  showBackButton = false,
}: {
  canCreateOffer?: boolean;
  canShareProjects?: boolean;
  canUseBusinessActions?: boolean;
  conversation: ConversationDetail;
  onBack?: () => void;
  onOpenShareAction?: (action: InboxShareAction) => void;
  showBackButton?: boolean;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [conversation.id]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isMenuOpen]);

  const handleAction = (action: InboxShareAction) => {
    setIsMenuOpen(false);
    onOpenShareAction?.(action);
  };

  return (
    <header className="sticky top-0 z-10 border-b border-[color:color-mix(in_srgb,var(--workspace-border)_76%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_94%,transparent)] px-4 py-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-start gap-3">
        {showBackButton ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-elevated)] text-[var(--workspace-muted)] transition hover:bg-[var(--workspace-panel)] md:hidden"
            aria-label="العودة إلى قائمة المحادثات"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : null}

        <div className="flex min-w-0 flex-1 items-start gap-3 rounded-[26px] border border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_86%,transparent)] px-4 py-3">
          <ThreadAvatar image={conversation.otherUser.image} name={conversation.otherUser.name} />
          <HeaderIdentity conversation={conversation} />

          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              className={cn(
                "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-bold transition",
                isMenuOpen
                  ? "border-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_10%,transparent)] text-[var(--workspace-highlight)]"
                  : "border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-elevated)] text-[var(--workspace-bubble-other-foreground)] hover:bg-[var(--workspace-panel)]",
              )}
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
              aria-label="فتح إجراءات المحادثة"
            >
              إجراءات
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {isMenuOpen ? (
              <div className="absolute left-0 top-[calc(100%+10px)] z-20 w-[300px] rounded-[26px] border border-[color:color-mix(in_srgb,var(--workspace-border)_70%,transparent)] bg-[var(--workspace-panel)] p-3 shadow-[0_24px_64px_rgba(0,0,0,0.28)]">
                <div className="rounded-2xl border border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-elevated)] px-3 py-3">
                  <div className="text-sm font-black text-[var(--workspace-bubble-other-foreground)]">
                    {conversation.otherUser.name}
                  </div>
                  <div className="mt-1 text-xs font-medium text-[var(--workspace-muted)]">
                    {conversation.otherUser.organizationName ?? "بدون جهة مرتبطة"}
                  </div>
                  <div className="mt-2 text-[11px] font-bold text-[var(--workspace-highlight)]">
                    النوع: {getParticipantTypeLabel(conversation)}
                  </div>
                </div>

                {canUseBusinessActions ? (
                  <div className="mt-3 space-y-2" role="menu">
                    <HeaderActionButton
                      action="offer"
                      disabled={!canCreateOffer}
                      label="إنشاء عرض خاص"
                      onClick={handleAction}
                    />
                    <HeaderActionButton
                      action="project"
                      disabled={!canShareProjects}
                      label="إرسال عقار أو شقة"
                      onClick={handleAction}
                    />
                    <HeaderActionButton
                      action="file"
                      label="إرفاق ملف"
                      onClick={handleAction}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
