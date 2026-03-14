"use client";

import { Search } from "lucide-react";
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

/**
 * WHY:   The inbox needs one focused rail for discovery, unread scanning, and invite handling.
 * WHAT:  Renders the conversation list, user search, and compact incoming invites for the inbox page.
 * HOW:   Keeps the layout intentionally calm by using standard list rows, small unread markers, and lightweight search states.
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
      <div className="border-b border-slate-200 px-5 py-5">
        <h1 className="text-base font-black text-slate-950">البريد الوارد</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          افتح المحادثات الحالية أو ابدأ محادثة جديدة مع أحد أعضاء المساحة.
        </p>

        <label className="mt-4 block" htmlFor="workspace-inbox-search">
          <span className="mb-2 block text-xs font-bold text-slate-600">ابحث عن مستخدم</span>
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="workspace-inbox-search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="اسم المستخدم أو الدور"
              className="w-full border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-600"
            />
          </div>
        </label>

        {searchResults.length > 0 ? (
          <div className="mt-3 border border-slate-200 bg-white">
            {searchResults.map((result, index) => (
              <button
                key={result.id}
                type="button"
                onClick={() => onStartConversation(result.id)}
                className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-right transition hover:bg-slate-50 ${
                  index > 0 ? "border-t border-slate-200" : ""
                }`}
              >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-black text-slate-950">{result.name}</div>
                    <div className="truncate text-xs font-medium text-slate-500">
                      {result.organizationName
                        ? `${result.role} · ${result.organizationName}`
                        : result.role}
                    </div>
                    {formatMembershipState(result.membershipState) ? (
                      <div className="mt-1 text-[11px] font-medium text-slate-400">
                        {formatMembershipState(result.membershipState)}
                      </div>
                    ) : null}
                  </div>
                  <div className="shrink-0 text-xs font-bold text-blue-700">ابدأ محادثة</div>
                </button>
            ))}
          </div>
        ) : isSearching ? (
          <div className="mt-3 text-xs font-medium text-slate-500">جاري البحث...</div>
        ) : hasSearch ? (
          <div className="mt-3 border border-dashed border-slate-200 px-4 py-3 text-xs font-medium text-slate-500">
            لا توجد نتائج مطابقة لهذا البحث.
          </div>
        ) : null}

        <div className="mt-4">
          <InboxInviteQueue
            invites={invites}
            onAcceptInvite={onAcceptInvite}
            onCancelInvite={onCancelInvite}
            onMessageInvite={onInviteMessage}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="px-5 py-8 text-sm font-medium leading-6 text-slate-500">
            لا توجد محادثات بعد. ابحث عن مستخدم وابدأ أول محادثة مباشرة.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {conversations.map((conversation) => {
              const isActive = activeId === conversation.id;
              const avatarLabel = conversation.otherUser.name.slice(0, 1) || "؟";

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => onSelect(conversation.id)}
                  className={`flex w-full items-start gap-3 px-5 py-4 text-right transition ${
                    isActive ? "bg-slate-50" : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-slate-200 bg-slate-950 text-sm font-black text-white">
                    {avatarLabel}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-black text-slate-950">
                          {conversation.otherUser.name}
                        </div>
                        <div className="mt-0.5 text-xs font-medium text-slate-500">
                          {conversation.otherUser.organizationName
                            ? `${conversation.otherUser.role} · ${conversation.otherUser.organizationName}`
                            : conversation.otherUser.role}
                        </div>
                      </div>
                      <div className="shrink-0 text-[11px] font-medium text-slate-400">
                        {formatConversationTime(conversation.updatedAt)}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-600">
                        {conversation.lastMessagePreview || "ابدأ المحادثة"}
                      </p>
                      {conversation.unreadCount > 0 && !isActive ? (
                        <span className="inline-flex min-w-5 items-center justify-center border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[11px] font-bold text-blue-700">
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
