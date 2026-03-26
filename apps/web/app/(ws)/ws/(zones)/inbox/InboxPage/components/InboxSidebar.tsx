"use client";

import { useMemo, useState } from "react";
import { Briefcase, Building2, Search, ShieldCheck, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IncomingOrganizationInvite } from "@/server/contracts/organizations";
import type { ConversationSummary, UserConversationTarget } from "@/server/contracts/inbox";
import InboxInviteQueue from "./InboxInviteQueue";

function formatConversationTime(value: number) {
  return new Date(value).toLocaleString("ar-SA", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatMembershipState(value: UserConversationTarget["membershipState"]) {
  if (value === "member") return "عضو";
  if (value === "pending-invite") return "دعوة معلقة";
  return null;
}

function roleOrganizationLabel(conversation: ConversationSummary) {
  if (!conversation.otherUser.organizationName) {
    return conversation.otherUser.role;
  }
  return `${conversation.otherUser.role} · ${conversation.otherUser.organizationName}`;
}

function getParticipantTypeLabel(role: string) {
  const lower = role.toLowerCase();
  if (lower.includes("developer") || lower.includes("مطور")) return "مطور";
  if (lower.includes("broker") || lower.includes("وسيط")) return "وسيط";
  if (lower.includes("admin") || lower.includes("مدير")) return "مدير";
  return "مستخدم";
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
  const sizeClass = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";

  if (image) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={image}
        alt={name}
        className={cn(
          "shrink-0 rounded-full object-cover ring-2",
          sizeClass,
          active
            ? "ring-[color:color-mix(in_srgb,var(--workspace-highlight)_24%,transparent)]"
            : "ring-[color:color-mix(in_srgb,var(--workspace-border)_76%,transparent)]",
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-black",
        sizeClass,
        active
          ? "bg-[var(--workspace-highlight)] text-[var(--primary-foreground)]"
          : "bg-[var(--workspace-elevated)] text-[var(--workspace-muted)]",
      )}
    >
      {initials}
    </div>
  );
}

type InboxCategory = "all" | "unread" | "brokers" | "developers";

function resolveConversationCategory(conversation: ConversationSummary): Exclude<InboxCategory, "all" | "unread"> | null {
  const role = conversation.otherUser.role.toLowerCase();
  if (role.includes("broker") || role.includes("وسيط")) return "brokers";
  if (role.includes("developer") || role.includes("مطور")) return "developers";
  return null;
}

function categoryLabel(category: InboxCategory) {
  if (category === "all") return "الكل";
  if (category === "unread") return "غير المقروءة";
  if (category === "brokers") return "وسطاء";
  return "مطورون";
}

function CategoryBar({
  activeCategory,
  counts,
  onChange,
}: {
  activeCategory: InboxCategory;
  counts: Record<InboxCategory, number>;
  onChange: (category: InboxCategory) => void;
}) {
  const categories: InboxCategory[] = ["all", "unread", "brokers", "developers"];

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {categories.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition",
              isActive
                ? "border-[color:color-mix(in_srgb,var(--workspace-highlight)_24%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_10%,transparent)] text-[var(--workspace-highlight)]"
                : "border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-elevated)] text-[var(--workspace-muted)] hover:bg-[var(--workspace-panel)] hover:text-[var(--workspace-bubble-other-foreground)]",
            )}
          >
            <span>{categoryLabel(category)}</span>
            <span
              className={cn(
                "inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-black",
                isActive
                  ? "bg-[var(--workspace-highlight)] text-[var(--primary-foreground)]"
                  : "bg-[var(--workspace-panel)] text-[var(--workspace-muted)]",
              )}
            >
              {counts[category]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SearchResultsList({
  onStartConversation,
  searchResults,
}: {
  onStartConversation: (targetUserId: string) => void;
  searchResults: UserConversationTarget[];
}) {
  return (
    <div className="mt-4 space-y-2">
      {searchResults.map((result) => (
        <button
          key={result.id}
          type="button"
          onClick={() => onStartConversation(result.id)}
          className="flex w-full items-center gap-3 rounded-2xl border border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-panel)] px-4 py-3 text-right transition hover:bg-[var(--workspace-elevated)]"
        >
          <UserAvatar image={result.image} name={result.name} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-black text-[var(--workspace-bubble-other-foreground)]">
              {result.name}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-[var(--workspace-muted)]">
              <RoleIcon role={result.role} />
              <span className="truncate">
                {result.organizationName ? `${getParticipantTypeLabel(result.role)} · ${result.organizationName}` : result.role}
              </span>
            </div>
            {formatMembershipState(result.membershipState) ? (
              <div className="mt-1 text-[10px] font-medium text-[var(--workspace-highlight)]">
                {formatMembershipState(result.membershipState)}
              </div>
            ) : null}
          </div>
          <span className="rounded-full border border-[color:color-mix(in_srgb,var(--workspace-highlight)_24%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_10%,transparent)] px-2 py-1 text-[10px] font-black text-[var(--workspace-highlight)]">
            بدء
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
  if (searchResults.length > 0) {
    return <SearchResultsList onStartConversation={onStartConversation} searchResults={searchResults} />;
  }

  if (isSearching) {
    return <div className="mt-3 text-xs font-medium text-[var(--workspace-muted)]">جاري البحث...</div>;
  }

  if (hasSearch) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-[color:color-mix(in_srgb,var(--workspace-border)_70%,transparent)] bg-[var(--workspace-panel)] px-4 py-4 text-xs font-medium text-[var(--workspace-muted)]">
        لا توجد نتائج مطابقة.
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
  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.id)}
      className={cn(
        "flex w-full items-start gap-3 rounded-[24px] border px-4 py-3 text-right transition-all duration-150",
        isActive
          ? "border-[color:color-mix(in_srgb,var(--workspace-highlight)_24%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_10%,transparent)]"
          : "border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-panel)] hover:bg-[var(--workspace-elevated)]",
      )}
    >
      <UserAvatar active={isActive} image={conversation.otherUser.image} name={conversation.otherUser.name} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-sm font-black text-[var(--workspace-bubble-other-foreground)]">
              {conversation.otherUser.name}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[var(--workspace-muted)]">
              <RoleIcon role={conversation.otherUser.role} />
              <span className="truncate">{roleOrganizationLabel(conversation)}</span>
            </div>
          </div>
          <div className="shrink-0 text-[10px] font-medium text-[color:color-mix(in_srgb,var(--workspace-muted)_86%,transparent)]">
            {formatConversationTime(conversation.updatedAt)}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate text-xs font-medium text-[var(--workspace-muted)]">
            {conversation.lastMessagePreview || "ابدأ المحادثة"}
          </p>
          {conversation.unreadCount > 0 ? (
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--workspace-highlight)] px-1.5 text-[10px] font-black text-[var(--primary-foreground)]">
              {conversation.unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}

type InboxSidebarProps = {
  conversations: ConversationSummary[];
  activeId?: string | null;
  invites: IncomingOrganizationInvite[];
  isSearching?: boolean;
  onAcceptInvite: (invite: IncomingOrganizationInvite) => void;
  onCancelInvite: (inviteId: string) => void;
  onInviteMessage: (invite: IncomingOrganizationInvite) => void;
  onSearchChange: (value: string) => void;
  onSelect: (conversationId: string) => void;
  onStartConversation: (targetUserId: string) => void;
  search: string;
  searchResults: UserConversationTarget[];
};

function ConversationsPane({
  activeCategory,
  activeId,
  conversations,
  onSelect,
}: {
  activeCategory: InboxCategory;
  activeId?: string | null;
  conversations: ConversationSummary[];
  onSelect: (conversationId: string) => void;
}) {
  const filteredConversations = useMemo(() => {
    if (activeCategory === "all") return conversations;
    if (activeCategory === "unread") return conversations.filter((conversation) => conversation.unreadCount > 0);
    return conversations.filter((conversation) => resolveConversationCategory(conversation) === activeCategory);
  }, [activeCategory, conversations]);

  if (filteredConversations.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-[color:color-mix(in_srgb,var(--workspace-border)_70%,transparent)] bg-[var(--workspace-panel)] px-4 py-5 text-sm font-medium text-[var(--workspace-muted)]">
        لا توجد محادثات في هذا القسم حاليًا.
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

export default function InboxSidebar({
  activeId = null,
  conversations,
  invites,
  isSearching,
  onAcceptInvite,
  onCancelInvite,
  onInviteMessage,
  onSearchChange,
  onSelect,
  onStartConversation,
  search,
  searchResults,
}: InboxSidebarProps) {
  const [activeCategory, setActiveCategory] = useState<InboxCategory>("all");
  const hasSearch = search.trim().length > 0;
  const counts = useMemo<Record<InboxCategory, number>>(
    () => ({
      all: conversations.length,
      unread: conversations.filter((conversation) => conversation.unreadCount > 0).length,
      brokers: conversations.filter((conversation) => resolveConversationCategory(conversation) === "brokers").length,
      developers: conversations.filter((conversation) => resolveConversationCategory(conversation) === "developers").length,
    }),
    [conversations],
  );

  return (
    <aside className="flex h-full min-h-0 w-full flex-col bg-[var(--workspace-sidebar)] text-foreground">
      <div className="border-b border-[color:color-mix(in_srgb,var(--workspace-border)_78%,transparent)] px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-black text-[var(--workspace-bubble-other-foreground)]">البريد الوارد</h1>
            <p className="mt-1 text-xs font-medium text-[var(--workspace-muted)]">
              {conversations.length > 0 ? `${conversations.length} محادثة نشطة` : "ابدأ محادثة جديدة"}
            </p>
          </div>
        </div>

        <label className="mt-4 block" htmlFor="workspace-inbox-search">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--workspace-muted)]" />
            <input
              id="workspace-inbox-search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="ابحث عن شخص أو جهة..."
              className="w-full rounded-2xl border border-[color:color-mix(in_srgb,var(--workspace-border)_74%,transparent)] bg-[var(--workspace-elevated)] py-2.5 pl-4 pr-10 text-sm font-bold text-[var(--workspace-bubble-other-foreground)] outline-none transition focus:border-[color:color-mix(in_srgb,var(--workspace-highlight)_24%,transparent)] focus:bg-[var(--workspace-panel)]"
            />
          </div>
        </label>

        <CategoryBar activeCategory={activeCategory} counts={counts} onChange={setActiveCategory} />
        <SearchResultsState
          hasSearch={hasSearch}
          isSearching={isSearching}
          onStartConversation={onStartConversation}
          searchResults={searchResults}
        />
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
            activeCategory={activeCategory}
            activeId={activeId}
            conversations={conversations}
            onSelect={onSelect}
          />
        ) : null}
      </div>
    </aside>
  );
}
