"use client";

import { useEffect, useRef, useState } from "react";
import { Archive, ArrowRight, Building2, FileUp, MoreHorizontal, PanelLeftClose, PanelLeftOpen, Tag } from "lucide-react";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import { resolveAvatarImageUrl } from "@/lib/avatarImage";
import { cn } from "@/lib/utils";
import type { ConversationDetail } from "@/server/contracts/inbox";
import type { InboxShareAction } from "./InboxComposerActions";

function getParticipantTypeLabel(conversation: ConversationDetail, dictionary: ReturnType<typeof useWebLocale>["dictionary"]) {
  if (conversation.otherUser.organizationType === "broker") {
    return dictionary.inbox.broker;
  }

  if (conversation.otherUser.organizationType === "developer") {
    return dictionary.inbox.developer;
  }

  const role = conversation.otherUser.role?.trim();
  return role || dictionary.inbox.userLabel;
}

export function getInboxThreadMenuActionLabels(args: {
  canCreateOffer: boolean;
  canShareProjects: boolean;
  canUseBusinessActions: boolean;
  isArchived: boolean;
}) {
  return [
    args.canUseBusinessActions && args.canCreateOffer ? "إنشاء عرض خاص" : null,
    args.canUseBusinessActions && args.canShareProjects ? "إرسال عقار أو شقة" : null,
    args.canUseBusinessActions ? "إرفاق ملف" : null,
    args.isArchived ? "إلغاء الأرشفة" : "نقل إلى الأرشيف",
  ].filter((value): value is string => Boolean(value));
}

function ThreadAvatar({ image, name }: { image?: string | null; name: string }) {
  const resolvedImage = resolveAvatarImageUrl(image);

  if (resolvedImage) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={resolvedImage}
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
  const { dictionary, isRtl } = useWebLocale();
  const organizationLabel = conversation.otherUser.organizationName;
  const participantType = getParticipantTypeLabel(conversation, dictionary);

  return (
    <div className={cn("min-w-0 flex-1", isRtl ? "text-right" : "text-left")}>
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
  isArchivingConversation = false,
  isSidebarCollapsed = false,
  onBack,
  onOpenShareAction,
  onSetConversationArchived,
  onToggleSidebarCollapsed,
  showBackButton = false,
}: {
  canCreateOffer?: boolean;
  canShareProjects?: boolean;
  canUseBusinessActions?: boolean;
  conversation: ConversationDetail;
  isArchivingConversation?: boolean;
  isSidebarCollapsed?: boolean;
  onBack?: () => void;
  onOpenShareAction?: (action: InboxShareAction) => void;
  onSetConversationArchived: (conversationId: string, archived: boolean) => Promise<void>;
  onToggleSidebarCollapsed?: () => void;
  showBackButton?: boolean;
}) {
  const { dictionary, isRtl, direction } = useWebLocale();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const isArchived = Boolean(conversation.archivedAt);

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

  const handleArchiveToggle = () => {
    setIsMenuOpen(false);
    void onSetConversationArchived(conversation.id, !isArchived);
  };

  return (
    <header className="sticky top-0 z-10 border-b border-border/40 bg-background/80 px-6 py-4 backdrop-blur-xl" dir={direction}>
      <div className={cn("flex items-center gap-4", !isRtl && "flex-row-reverse")}>
        {showBackButton ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:bg-muted md:hidden"
            aria-label={isRtl ? "العودة إلى قائمة المحادثات" : "Back to conversation list"}
          >
            <ArrowRight className={cn("h-4 w-4", !isRtl && "rotate-180")} />
          </button>
        ) : null}

        <div className={cn("flex min-w-0 flex-1 items-center gap-4", !isRtl && "flex-row-reverse")}>
          <button
            type="button"
            onClick={onToggleSidebarCollapsed}
            aria-label={isSidebarCollapsed ? (isRtl ? "فتح قائمة المحادثات" : "Open inbox sidebar") : (isRtl ? "إخفاء قائمة المحادثات" : "Collapse inbox sidebar")}
            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:bg-muted md:inline-flex"
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
          <ThreadAvatar image={conversation.otherUser.image} name={conversation.otherUser.name} />
          <HeaderIdentity conversation={conversation} />

          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-all",
                isMenuOpen
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-foreground hover:bg-muted"
              )}
              aria-label={dictionary.inbox.threadMenuLabel}
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {isMenuOpen ? (
              <div className={cn("absolute top-[calc(100%+12px)] z-20 w-[240px] rounded-2xl border border-border bg-card p-2 shadow-xl shadow-black/10", isRtl ? "right-0" : "left-0")}>
                <div className="space-y-1" role="menu">
                  {canUseBusinessActions ? (
                    <>
                    <button
                      onClick={() => handleAction("offer")}
                      disabled={!canCreateOffer}
                      className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-bold text-foreground transition hover:bg-muted disabled:opacity-40", isRtl ? "text-right" : "flex-row-reverse text-left")}
                    >
                      <Tag className="h-4 w-4" />
                      {dictionary.inbox.threadActionOffer}
                    </button>
                    <button
                      onClick={() => handleAction("project")}
                      disabled={!canShareProjects}
                      className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-bold text-foreground transition hover:bg-muted disabled:opacity-40", isRtl ? "text-right" : "flex-row-reverse text-left")}
                    >
                      <Building2 className="h-4 w-4" />
                      {dictionary.inbox.threadActionProject}
                    </button>
                    <button
                      onClick={() => handleAction("file")}
                      className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-bold text-foreground transition hover:bg-muted", isRtl ? "text-right" : "flex-row-reverse text-left")}
                    >
                      <FileUp className="h-4 w-4" />
                      {dictionary.inbox.threadActionFile}
                    </button>
                    </>
                  ) : null}
                  <button
                    onClick={handleArchiveToggle}
                    disabled={isArchivingConversation}
                    className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-bold text-foreground transition hover:bg-muted disabled:opacity-40", isRtl ? "text-right" : "flex-row-reverse text-left")}
                  >
                    <Archive className="h-4 w-4" />
                    {isArchived ? (isRtl ? "إلغاء الأرشفة" : "Unarchive") : (isRtl ? "نقل إلى الأرشيف" : "Archive contact")}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
