"use client";

import {
  Search,
  PenSquare,
  Building2,
  Briefcase,
  User,
  Users,
  ShieldCheck,
} from "lucide-react";
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

function RoleIcon({ role }: { role: string }) {
  const lower = role.toLowerCase();
  if (lower.includes("developer") || lower.includes("مطور")) return <Building2 className="h-3 w-3" />;
  if (lower.includes("broker") || lower.includes("وسيط")) return <Briefcase className="h-3 w-3" />;
  if (lower.includes("admin") || lower.includes("مدير")) return <ShieldCheck className="h-3 w-3" />;
  if (lower.includes("team") || lower.includes("فريق")) return <Users className="h-3 w-3" />;
  return <User className="h-3 w-3" />;
}

/**
 * WHY:   The inbox needs one focused rail for discovery, unread scanning, and invite handling.
 * WHAT:  Renders the conversation list with icon+label role badges, user search, and compact incoming invites.
 * HOW:   Shows a branded header with a New Message button, role-aware icon badges, and a strong active-conversation accent.
 */
export default function InboxSidebar({
  conversations,
  activeId,
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
}: {
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
}) {
  const hasSearch = search.trim().length > 0;

  return (
    <aside className="flex h-full w-full flex-col bg-white">
      {/* ── Header ── */}
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-black text-slate-950">البريد الوارد</h1>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              {conversations.length > 0
                ? `${conversations.length} محادثة`
                : "ابدأ محادثة جديدة"}
            </p>
          </div>
          <button
            type="button"
            aria-label="محادثة جديدة"
            onClick={() => onSearchChange(" ")}
            className="inline-flex h-9 w-9 items-center justify-center border border-slate-200 bg-white text-slate-500 transition hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <PenSquare className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <label className="mt-4 block" htmlFor="workspace-inbox-search">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="workspace-inbox-search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="ابحث عن مستخدم أو دور..."
              className="w-full rounded-full border-2 border-transparent bg-slate-100 py-2.5 pl-4 pr-10 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </label>

        {/* Search results */}
        {searchResults.length > 0 ? (
          <div className="mt-3 border border-slate-200 bg-white">
            {searchResults.map((result, index) => (
              <button
                key={result.id}
                type="button"
                onClick={() => onStartConversation(result.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-4 py-3 text-right transition hover:bg-slate-50",
                  index > 0 ? "border-t border-slate-100" : "",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-black text-slate-950">{result.name}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <RoleIcon role={result.role} />
                    <span className="truncate">
                      {result.organizationName
                        ? `${result.role} · ${result.organizationName}`
                        : result.role}
                    </span>
                  </div>
                  {formatMembershipState(result.membershipState) ? (
                    <div className="mt-1 text-[10px] font-medium text-slate-400">
                      {formatMembershipState(result.membershipState)}
                    </div>
                  ) : null}
                </div>
                <span className="shrink-0 border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-black tracking-widest text-blue-700">
                  ابدأ
                </span>
              </button>
            ))}
          </div>
        ) : isSearching ? (
          <div className="mt-3 text-xs font-medium text-slate-500">جاري البحث...</div>
        ) : hasSearch ? (
          <div className="mt-3 border border-dashed border-slate-200 px-4 py-3 text-xs font-medium text-slate-500">
            لا توجد نتائج مطابقة.
          </div>
        ) : null}

        {/* Invite queue */}
        {invites.length > 0 ? (
          <div className="mt-4">
            <InboxInviteQueue
              invites={invites}
              onAcceptInvite={onAcceptInvite}
              onCancelInvite={onCancelInvite}
              onMessageInvite={onInviteMessage}
            />
          </div>
        ) : null}
      </div>

      {/* ── Conversation list ── */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center border border-slate-200 bg-slate-50 text-slate-400">
              <PenSquare className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-700">لا توجد محادثات</div>
              <div className="mt-1 text-xs font-medium text-slate-400">
                ابحث عن مستخدم وابدأ أول محادثة مباشرة.
              </div>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {conversations.map((conversation) => {
              const isActive = activeId === conversation.id;
              const avatarLabel = conversation.otherUser.name.slice(0, 1) || "؟";
              const roleLabel = conversation.otherUser.role;

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => onSelect(conversation.id)}
                  className={cn(
                    "flex w-full items-start gap-3 px-3 py-3 mx-2 w-[cf(100%-16px)] rounded-2xl text-right transition-all duration-200",
                    isActive
                      ? "bg-blue-50"
                      : "bg-transparent hover:bg-slate-50",
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-black shadow-sm",
                      isActive
                        ? "bg-blue-600 text-white shadow-blue-500/20"
                        : "border border-slate-200 bg-white text-slate-700",
                    )}
                  >
                    {avatarLabel}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-black text-slate-950">
                          {conversation.otherUser.name}
                        </div>
                        {/* Role icon + label */}
                        <div className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-slate-500">
                          <RoleIcon role={roleLabel} />
                          <span className="truncate">
                            {conversation.otherUser.organizationName
                              ? `${roleLabel} · ${conversation.otherUser.organizationName}`
                              : roleLabel}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-[10px] font-medium text-slate-400">
                        {formatConversationTime(conversation.updatedAt)}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <p className="min-w-0 flex-1 truncate text-xs font-bold text-slate-500">
                        {conversation.lastMessagePreview || "ابدأ المحادثة"}
                      </p>
                      {conversation.unreadCount > 0 && !isActive ? (
                        <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-black text-white shadow-sm shadow-blue-500/20">
                          {conversation.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
