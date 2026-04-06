"use client";

import { useState } from "react";
import { Archive, Briefcase, Building2, PanelLeftClose, Search, ShieldCheck, User, Users } from "lucide-react";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import { resolveAvatarImageUrl } from "@/lib/avatarImage";
import type { AppLocale } from "@/lib/locale";
import { formatLocaleDateTime } from "@/lib/locale";
import { cn } from "@/lib/utils";
import type { IncomingOrganizationInvite } from "@/server/contracts/organizations";
import type { ConversationSummary, UserConversationTarget } from "@/server/contracts/inbox";
import InboxInviteQueue from "./InboxInviteQueue";

function formatConversationTime(value: number, locale: AppLocale) {
  return formatLocaleDateTime(locale, value, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatMembershipState(value: UserConversationTarget["membershipState"], locale: AppLocale) {
  if (value === "member") return locale === "fr" ? "Membre" : locale === "en" ? "Member" : "عضو";
  if (value === "pending-invite") return locale === "fr" ? "Invitation en attente" : locale === "en" ? "Pending invite" : "دعوة معلقة";
  return null;
}

function roleOrganizationLabel(conversation: ConversationSummary) {
  if (!conversation.otherUser.organizationName) {
    return conversation.otherUser.role;
  }
  return `${conversation.otherUser.role} · ${conversation.otherUser.organizationName}`;
}

function getParticipantTypeLabel(role: string, locale: AppLocale) {
  const lower = role.toLowerCase();
  if (lower.includes("developer") || lower.includes("مطور")) return locale === "fr" ? "Promoteur" : locale === "en" ? "Developer" : "مطور";
  if (lower.includes("broker") || lower.includes("وسيط")) return locale === "fr" ? "Courtier" : locale === "en" ? "Broker" : "وسيط";
  if (lower.includes("admin") || lower.includes("مدير")) return locale === "fr" ? "Admin" : locale === "en" ? "Admin" : "مدير";
  return locale === "fr" ? "Utilisateur" : locale === "en" ? "User" : "مستخدم";
}

function RoleIcon({ role }: { role: string }) {
  const lower = role.toLowerCase();
  if (lower.includes("developer") || lower.includes("مطور")) return <Building2 className="h-3.5 w-3.5" />;
  if (lower.includes("broker") || lower.includes("وسيط")) return <Briefcase className="h-3.5 w-3.5" />;
  if (lower.includes("admin") || lower.includes("مدير")) return <ShieldCheck className="h-3.5 w-3.5" />;
  if (lower.includes("team") || lower.includes("فريق")) return <Users className="h-3.5 w-3.5" />;
  return <User className="h-3.5 w-3.5" />;
}

function UserAvatar({
  active = false,
  image,
  name,
  size = "md",
}: {
  active?: boolean;
  image?: string | null;
  name: string;
  size?: "sm" | "md";
}) {
  const initials = name.slice(0, 1) || "؟";
  const sizeClass = size === "sm" ? "h-8 w-8 text-xs" : "h-11 w-11 text-sm";
  const resolvedImage = resolveAvatarImageUrl(image);

  if (resolvedImage) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={resolvedImage}
        alt={name}
        className={cn(
          "shrink-0 rounded-full object-cover ring-2 transition-all",
          sizeClass,
          active
            ? "ring-foreground/20"
            : "ring-border/40",
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-black transition-all",
        sizeClass,
        active
          ? "bg-foreground text-background shadow-md shadow-foreground/10"
          : "bg-muted text-muted-foreground",
      )}
    >
      {initials}
    </div>
  );
}

// Category logic removed for simplification as requested.

// CategoryBar is removed for simplification as requested.

function SearchResultsList({
  onStartConversation,
  searchResults,
}: {
  onStartConversation: (targetUserId: string) => void;
  searchResults: UserConversationTarget[];
}) {
  const { dictionary, locale } = useWebLocale();

  return (
    <div className="mt-4 space-y-2">
      {searchResults.map((result) => (
        <button
          key={result.id}
          type="button"
          onClick={() => onStartConversation(result.id)}
          className="flex w-full items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 text-right transition-all hover:border-foreground/20 hover:bg-muted/10"
        >
          <UserAvatar image={result.image} name={result.name} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-bold text-foreground">
              {result.name}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <RoleIcon role={result.role} />
              <span className="truncate">
                {result.organizationName ? `${getParticipantTypeLabel(result.role, locale)} · ${result.organizationName}` : result.role}
              </span>
            </div>
            {formatMembershipState(result.membershipState, locale) ? (
              <div className="mt-1 text-[10px] font-bold text-foreground/60 uppercase tracking-wider">
                {formatMembershipState(result.membershipState, locale)}
              </div>
            ) : null}
          </div>
          <span className="rounded-full border border-border bg-muted/20 px-3 py-1 text-[11px] font-bold text-foreground">
            {dictionary.inbox.start}
          </span>
        </button>
      ))}
    </div>
  );
}

function SearchResultsState({
  hasSearch,
  isSearching,
  onStartConversation,
  searchResults,
}: {
  hasSearch: boolean;
  isSearching?: boolean;
  onStartConversation: (targetUserId: string) => void;
  searchResults: UserConversationTarget[];
}) {
  const { dictionary } = useWebLocale();

  if (searchResults.length > 0) {
    return <SearchResultsList onStartConversation={onStartConversation} searchResults={searchResults} />;
  }

  if (isSearching) {
    return <div className="mt-4 text-[11px] font-bold text-muted-foreground/60">{dictionary.inbox.searching}</div>;
  }

  if (hasSearch) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-border bg-muted/5 px-4 py-6 text-center text-[12px] font-bold text-muted-foreground">
        {dictionary.inbox.noMatchingResults}
      </div>
    );
  }

  return null;
}

function ConversationRow({
  conversation,
  isActive,
  onSelect,
}: {
  conversation: ConversationSummary;
  isActive: boolean;
  onSelect: (conversationId: string) => void;
}) {
  const { dictionary, locale } = useWebLocale();

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.id)}
      className={cn(
        "group flex w-full items-start gap-4 rounded-2xl px-4 py-3.5 text-right transition-all duration-200",
        isActive
          ? "bg-muted shadow-sm"
          : "bg-transparent hover:bg-muted/50",
      )}
    >
      <UserAvatar active={isActive} image={conversation.otherUser.image} name={conversation.otherUser.name} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className={cn(
              "truncate text-[14px] font-bold tracking-tight",
              isActive ? "text-foreground" : "text-foreground/90"
            )}>
              {conversation.otherUser.name}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60">
              <span className="truncate">{roleOrganizationLabel(conversation)}</span>
            </div>
          </div>
          <div className="shrink-0 pt-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">
            {formatConversationTime(conversation.updatedAt, locale)}
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-3">
          <p className={cn(
            "min-w-0 flex-1 truncate text-[13px] font-medium leading-relaxed",
            conversation.unreadCount > 0 ? "font-bold text-foreground" : "text-muted-foreground/60"
          )}>
            {conversation.lastMessagePreview || dictionary.inbox.lastMessageFallback}
          </p>
          {conversation.unreadCount > 0 ? (
            <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-foreground px-1 text-[9px] font-black text-background">
              {conversation.unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}

function ConversationsPane({
  activeId,
  conversations,
  onSelect,
}: {
  activeId?: string | null;
  conversations: ConversationSummary[];
  onSelect: (conversationId: string) => void;
}) {
  const { dictionary } = useWebLocale();
  const filteredConversations = conversations;

  if (filteredConversations.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-muted/10 px-6 py-8 text-center">
        <p className="text-[13px] font-bold text-muted-foreground leading-relaxed">
          {dictionary.inbox.noConversationsInSection}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filteredConversations.map((conversation) => (
        <ConversationRow
          key={conversation.id}
          conversation={conversation}
          isActive={activeId === conversation.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

type InboxSidebarProps = {
  conversations: ConversationSummary[];
  activeId?: string | null;
  archivedCount: number;
  invites: IncomingOrganizationInvite[];
  isSearching?: boolean;
  isShowingArchived: boolean;
  onAcceptInvite: (invite: IncomingOrganizationInvite) => void;
  onCancelInvite: (inviteId: string) => void;
  onInviteMessage: (invite: IncomingOrganizationInvite) => void;
  onSearchChange: (value: string) => void;
  onSelect: (conversationId: string) => void;
  onStartConversation: (targetUserId: string) => void;
  onToggleCollapsed: () => void;
  onToggleShowArchived: (value: boolean) => void;
  search: string;
  searchResults: UserConversationTarget[];
};

export default function InboxSidebar({
  activeId = null,
  archivedCount,
  conversations,
  invites,
  isSearching,
  isShowingArchived,
  onAcceptInvite,
  onCancelInvite,
  onInviteMessage,
  onSearchChange,
  onSelect,
  onStartConversation,
  onToggleCollapsed,
  onToggleShowArchived,
  search,
  searchResults,
}: InboxSidebarProps) {
  const { locale, direction, isRtl } = useWebLocale();
  const hasSearch = search.trim().length > 0;
  const title = locale === "fr" ? "Boite de reception" : locale === "en" ? "Inbox" : "البريد الوارد";
  const searchPlaceholder =
    locale === "fr"
      ? "Rechercher une conversation..."
      : locale === "en"
        ? "Search conversations..."
        : "ابحث عن محادثة...";

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 w-full flex-col bg-background text-foreground border-border/40",
        isRtl ? "border-l" : "border-r",
      )}
      dir={direction}
    >
      <div className="px-6 py-8">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-black tracking-tight text-foreground">{title}</h1>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-muted/20 px-3 py-1 text-[11px] font-bold text-muted-foreground">
              {conversations.length}
            </span>
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label={isRtl ? "إخفاء قائمة المحادثات" : "Collapse inbox sidebar"}
              className="hidden h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:bg-muted md:inline-flex"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className={cn("pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60", isRtl ? "right-4" : "left-4")} />
            <input
              id="workspace-inbox-search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className={cn(
                "w-full rounded-2xl border border-border bg-muted/10 py-3 text-[13px] font-bold text-foreground outline-none transition-all placeholder:text-muted-foreground/40 focus:border-foreground/20 focus:bg-background",
                isRtl ? "pl-5 pr-11 text-right" : "pl-11 pr-5 text-left",
              )}
            />
          </div>
        </div>

        <SearchResultsState
          hasSearch={hasSearch}
          isSearching={isSearching}
          onStartConversation={onStartConversation}
          searchResults={searchResults}
        />

        {(archivedCount > 0 || isShowingArchived) ? (
          <button
            type="button"
            onClick={() => onToggleShowArchived(!isShowingArchived)}
            className={cn(
              "mt-4 flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-[12px] font-bold transition-all",
              isShowingArchived
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-muted/5 text-foreground hover:bg-muted/10",
            )}
          >
            <span className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              {isRtl ? "المؤرشف" : "Archived"}
            </span>
            <span className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-black",
              isShowingArchived ? "bg-background/15 text-background" : "bg-muted/30 text-muted-foreground",
            )}>
              {archivedCount}
            </span>
          </button>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {invites.length > 0 ? (
          <div className="mb-4">
            <InboxInviteQueue
              invites={invites}
              onAcceptInvite={onAcceptInvite}
              onCancelInvite={onCancelInvite}
              onMessageInvite={onInviteMessage}
            />
          </div>
        ) : null}

        {!hasSearch ? (
          <ConversationsPane
            activeId={activeId}
            conversations={conversations}
            onSelect={onSelect}
          />
        ) : null}
      </div>
    </aside>
  );
}
