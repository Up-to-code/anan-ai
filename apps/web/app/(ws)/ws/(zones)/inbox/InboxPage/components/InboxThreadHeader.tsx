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
        className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-border/40"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-[13px] font-black text-muted-foreground">
      {name.slice(0, 1) || "؟"}
    </div>
  );
}

function HeaderIdentity({
  conversation,
}: {
  conversation: ConversationDetail;
}) {
  const organizationLabel = conversation.otherUser.organizationName;
  const participantType = getParticipantTypeLabel(conversation);

  return (
    <div className="min-w-0 flex-1">
      <div className="truncate text-[15px] font-black tracking-tight text-foreground">
        {conversation.otherUser.name}
      </div>
      <div className="mt-0.5 flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
        <span>{participantType}</span>
        {organizationLabel ? (
          <>
            <span className="opacity-30">•</span>
            <span className="truncate">{organizationLabel}</span>
          </>
        ) : null}
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
    <header className="sticky top-0 z-10 border-b border-border/40 bg-background/80 px-6 py-4 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        {showBackButton ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:bg-muted md:hidden"
            aria-label="العودة"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : null}

        <div className="flex min-w-0 flex-1 items-center gap-4">
          <ThreadAvatar image={conversation.otherUser.image} name={conversation.otherUser.name} />
          <HeaderIdentity conversation={conversation} />

          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-[13px] font-bold transition-all",
                isMenuOpen
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-foreground hover:bg-muted"
              )}
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
            >
              إجراءات
              <ChevronDown className={cn("h-4 w-4 transition-transform", isMenuOpen && "rotate-180")} />
            </button>

            {isMenuOpen ? (
              <div className="absolute left-0 top-[calc(100%+12px)] z-20 w-[240px] rounded-2xl border border-border bg-card p-2 shadow-xl shadow-black/10">
                {canUseBusinessActions ? (
                  <div className="space-y-1" role="menu">
                    <button
                      onClick={() => handleAction("offer")}
                      disabled={!canCreateOffer}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-right text-[13px] font-bold text-foreground transition hover:bg-muted disabled:opacity-40"
                    >
                      <Tag className="h-4 w-4" />
                      إنشاء عرض خاص
                    </button>
                    <button
                      onClick={() => handleAction("project")}
                      disabled={!canShareProjects}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-right text-[13px] font-bold text-foreground transition hover:bg-muted disabled:opacity-40"
                    >
                      <Building2 className="h-4 w-4" />
                      إرسال مشروع
                    </button>
                    <button
                      onClick={() => handleAction("file")}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-right text-[13px] font-bold text-foreground transition hover:bg-muted"
                    >
                      <FileUp className="h-4 w-4" />
                      إرفاق ملف
                    </button>
                  </div>
                ) : (
                  <div className="p-3 text-center text-[12px] font-medium text-muted-foreground">
                    لا توجد إجراءات متاحة
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
