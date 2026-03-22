"use client";
import { Search, PenSquare, Building2, Briefcase, User, Users, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IncomingOrganizationInvite } from "@/server/contracts/organizations";
import type { ConversationSummary, UserConversationTarget } from "@/server/contracts/inbox";
import InboxInviteQueue from "./InboxInviteQueue";

function formatConversationTime(value: number) {
  return new Date(value).toLocaleString("ar-SA", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function formatMembershipState(value: UserConversationTarget["membershipState"]) {
  if (value === "member") return "عضو";
  if (value === "pending-invite") return "دعوة معلقة";
  return null;
}

function RoleIcon({ role }: { role: string }) {
  const lower = role.toLowerCase();
  if (lower.includes("developer") || lower.includes("مطور")) return <Building2 className="h-3 w-3" />;
  if (lower.includes("broker") || lower.includes("وسيط")) return <Briefcase className="h-3 w-3" />;
  if (lower.includes("admin") || lower.includes("مدير")) return <ShieldCheck className="h-3 w-3" />;
  if (lower.includes("team") || lower.includes("فريق")) return <Users className="h-3 w-3" />;
  return <User className="h-3 w-3" />;
}

function UserAvatar({
  name,
  image,
  active = false,
  size = "md",
}: {
  name: string;
  image?: string | null;
  active?: boolean;
  size?: "sm" | "md";
}) {
  const initials = name.slice(0, 1) || "؟";
  const sizeClass = size === "sm" ? "h-8 w-8 text-xs" : "h-11 w-11 text-sm";
  if (image) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={image} alt={name} className={cn("shrink-0 rounded-full object-cover ring-2", sizeClass, active ? "ring-blue-200" : "ring-slate-100")} />
    );
  }
  return (
    <div className={cn("flex shrink-0 items-center justify-center rounded-full font-black", sizeClass, active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600")}>
      {initials}
    </div>
  );
}

function roleOrganizationLabel(conversation: ConversationSummary) {
  if (!conversation.otherUser.organizationName) return conversation.otherUser.role;
  return `${conversation.otherUser.role} · ${conversation.otherUser.organizationName}`;
}

function ConversationRow({ conversation, isActive, onSelect }: { conversation: ConversationSummary; isActive: boolean; onSelect: (conversationId: string) => void }) {
  return (
    <button type="button" onClick={() => onSelect(conversation.id)} className={cn("flex w-full items-start gap-3 px-4 py-3 text-right transition-all duration-150", isActive ? "bg-blue-50" : "hover:bg-slate-50")}>
      <UserAvatar name={conversation.otherUser.name} image={conversation.otherUser.image} active={isActive} />
      <ConversationRowBody conversation={conversation} isActive={isActive} />
    </button>
  );
}

function ConversationRowBody({ conversation, isActive }: { conversation: ConversationSummary; isActive: boolean }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-black text-slate-950">{conversation.otherUser.name}</div>
          <div className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <RoleIcon role={conversation.otherUser.role} />
            <span className="truncate">{roleOrganizationLabel(conversation)}</span>
          </div>
        </div>
        <div className="shrink-0 text-[10px] font-medium text-slate-400">{formatConversationTime(conversation.updatedAt)}</div>
      </div>
      <ConversationPreview conversation={conversation} isActive={isActive} />
    </div>
  );
}

function ConversationPreview({ conversation, isActive }: { conversation: ConversationSummary; isActive: boolean }) {
  return (
    <div className="mt-2 flex items-center gap-2">
      <p className="min-w-0 flex-1 truncate text-xs font-bold text-slate-500">{conversation.lastMessagePreview || "ابدأ المحادثة"}</p>
      {conversation.unreadCount > 0 && !isActive ? <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-black text-white">{conversation.unreadCount}</span> : null}
    </div>
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

function SearchResultsList({
  onStartConversation,
  searchResults,
}: {
  onStartConversation: (targetUserId: string) => void;
  searchResults: UserConversationTarget[];
}) {
  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
      {searchResults.map((result, index) => (
        <button key={result.id} type="button" onClick={() => onStartConversation(result.id)} className={cn("flex w-full items-center gap-3 px-4 py-3 text-right transition hover:bg-slate-50", index > 0 ? "border-t border-slate-100" : "")}>
          <UserAvatar name={result.name} image={result.image} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-black text-slate-950">{result.name}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <RoleIcon role={result.role} />
              <span className="truncate">{result.organizationName ? `${result.role} · ${result.organizationName}` : result.role}</span>
            </div>
            {formatMembershipState(result.membershipState) ? <div className="mt-1 text-[10px] font-medium text-slate-400">{formatMembershipState(result.membershipState)}</div> : null}
          </div>
          <span className="shrink-0 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-black tracking-widest text-blue-700">ابدأ</span>
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
  if (searchResults.length > 0) return <SearchResultsList onStartConversation={onStartConversation} searchResults={searchResults} />;
  if (isSearching) return <div className="mt-3 text-xs font-medium text-slate-500">جاري البحث...</div>;
  if (hasSearch) return <div className="mt-3 rounded-lg border border-dashed border-slate-200 px-4 py-3 text-xs font-medium text-slate-500">لا توجد نتائج مطابقة.</div>;
  return null;
}

function SidebarHeader(props: Pick<InboxSidebarProps, "conversations" | "invites" | "isSearching" | "onAcceptInvite" | "onCancelInvite" | "onInviteMessage" | "onSearchChange" | "onStartConversation" | "search" | "searchResults">) {
  const hasSearch = props.search.trim().length > 0;
  return (
    <div className="border-b border-slate-100 px-5 py-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-black text-slate-950">البريد الوارد</h1>
          <p className="mt-0.5 text-xs font-medium text-slate-500">{props.conversations.length > 0 ? `${props.conversations.length} محادثة` : "ابدأ محادثة جديدة"}</p>
        </div>
        <button type="button" aria-label="محادثة جديدة" onClick={() => props.onSearchChange(" ")} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
          <PenSquare className="h-4 w-4" />
        </button>
      </div>
      <label className="mt-4 block" htmlFor="workspace-inbox-search">
        <div className="relative">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input id="workspace-inbox-search" value={props.search} onChange={(event) => props.onSearchChange(event.target.value)} placeholder="ابحث عن مستخدم أو دور..." className="w-full rounded-lg border-2 border-transparent bg-slate-100 py-2.5 pl-4 pr-10 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" />
        </div>
      </label>
      <SearchResultsState hasSearch={hasSearch} isSearching={props.isSearching} onStartConversation={props.onStartConversation} searchResults={props.searchResults} />
      {props.invites.length > 0 ? (
        <div className="mt-4">
          <InboxInviteQueue invites={props.invites} onAcceptInvite={props.onAcceptInvite} onCancelInvite={props.onCancelInvite} onMessageInvite={props.onInviteMessage} />
        </div>
      ) : null}
    </div>
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
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400">
          <PenSquare className="h-6 w-6" />
        </div>
        <div>
          <div className="text-sm font-black text-slate-700">لا توجد محادثات</div>
          <div className="mt-1 text-xs font-medium text-slate-400">ابحث عن مستخدم وابدأ أول محادثة مباشرة.</div>
        </div>
      </div>
    );
  }
  return (
    <div className="divide-y divide-slate-50">
      {conversations.map((conversation) => (
        <ConversationRow key={conversation.id} conversation={conversation} isActive={activeId === conversation.id} onSelect={onSelect} />
      ))}
    </div>
  );
}

/**
 * WHY:   The inbox needs one focused rail for discovery, unread scanning, and invite handling.
 * WHAT:  Renders the conversation list with avatar images, role badges, user search, and compact incoming invites.
 * HOW:   Shows branded header with New Message button, real Google avatar images with initials fallback, and active-conversation accent.
 */
export default function InboxSidebar(props: InboxSidebarProps) {
  return (
    <aside className="flex h-full w-full flex-col bg-white">
      <SidebarHeader
        conversations={props.conversations}
        invites={props.invites}
        isSearching={props.isSearching}
        onAcceptInvite={props.onAcceptInvite}
        onCancelInvite={props.onCancelInvite}
        onInviteMessage={props.onInviteMessage}
        onSearchChange={props.onSearchChange}
        onStartConversation={props.onStartConversation}
        search={props.search}
        searchResults={props.searchResults}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ConversationsPane activeId={props.activeId} conversations={props.conversations} onSelect={props.onSelect} />
      </div>
    </aside>
  );
}
