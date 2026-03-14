"use client";

import { useMemo } from "react";
import { Circle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConversationSummary, UserConversationTarget } from "@/server/contracts/inbox";

/**
 * WHY:   The inbox is now a fundamental part of the workspace layout, providing persistent conversation access.
 * WHAT:  A vertical rail component that renders the list of real chat threads plus user search for starting new ones.
 * HOW:   Receives conversation DTOs from the server-backed inbox layer and resolves new direct threads through the workspace API.
 */
export default function WorkspaceInboxSidebar({ 
  conversations,
  activeId, 
  search,
  searchResults,
  isSearching,
  onSearchChange,
  onSelect, 
  onStartConversation,
  mode = "sidebar" 
}: { 
  conversations: ConversationSummary[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
  search: string;
  searchResults: UserConversationTarget[];
  isSearching?: boolean;
  onSearchChange: (value: string) => void;
  onStartConversation?: (targetUserId: string) => void;
  mode?: "sidebar" | "inline";
}) {
  const currentActiveId = activeId;

  const handleSelect = (id: string) => {
    onSelect?.(id);
  };

  const conversationItems = useMemo(() => conversations, [conversations]);

  return (
    <div className={cn(
        "flex h-full flex-col bg-white",
        mode === "sidebar" ? "w-[320px] border-l border-slate-200" : "w-full"
    )}>
      <div className="sticky top-0 z-10 space-y-4 border-b border-slate-100 bg-white p-6">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">البريد الوارد</div>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="ابحث عن مستخدم"
            className="min-w-0 flex-1 border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
          />
          <div
            className="inline-flex items-center justify-center border border-slate-200 bg-white px-4 text-slate-400"
            aria-hidden="true"
          >
            <Search className="h-4 w-4" />
          </div>
        </div>
        {searchResults.length > 0 ? (
          <div className="space-y-2 border border-slate-100 bg-slate-50 p-3">
            {searchResults.map((result) => (
              <button
                key={result.id}
                onClick={() => onStartConversation?.(result.id)}
                className="flex w-full items-center justify-between border border-slate-200 bg-white px-3 py-3 text-right transition hover:border-blue-200"
              >
                <div>
                  <div className="text-xs font-black text-slate-950">{result.name}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{result.role}</div>
                </div>
                <div className="text-[10px] font-black tracking-widest text-blue-600">ابدأ</div>
              </button>
            ))}
          </div>
        ) : isSearching ? (
          <div className="text-[10px] font-black tracking-widest text-slate-400">جاري البحث...</div>
        ) : search.trim() ? (
          <div className="text-[10px] font-black tracking-widest text-slate-400">لا توجد نتائج مطابقة.</div>
        ) : null}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {conversationItems.map((conv) => {
          const isActive = currentActiveId === conv.id;
          const lastTime = new Date(conv.updatedAt).toLocaleString("ar-SA", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          });
          const avatarLabel = conv.otherUser.name.slice(0, 1) || "U";
          
          return (
            <button
              key={conv.id}
              onClick={() => handleSelect(conv.id)}
              className={cn(
                "group relative w-full text-right p-6 border-b border-slate-50 flex gap-4 transition-all duration-200",
                isActive 
                  ? "bg-slate-50 border-r-4 border-r-blue-600" 
                  : "hover:bg-slate-50/50 border-r-4 border-r-transparent"
              )}
            >
              <div className={cn(
                "w-12 h-12 flex items-center justify-center shrink-0 text-sm font-black transition-all",
                "bg-slate-950 text-white",
                isActive && "scale-105"
              )}>
                {avatarLabel}
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-start mb-0.5">
                  <div className={cn(
                    "text-xs font-black truncate transition-colors",
                    isActive ? "text-blue-700" : "text-slate-950 group-hover:text-blue-600"
                  )}>
                    {conv.otherUser.name}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 shrink-0 mr-2">{lastTime}</div>
                </div>
                
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{conv.otherUser.role}</div>
                
                <div className={cn(
                    "text-[11px] font-medium truncate leading-normal transition-colors",
                    isActive ? "text-slate-600" : "text-slate-500"
                )}>
                  {conv.lastMessagePreview || "ابدأ المحادثة"}
                </div>

                {conv.unreadCount > 0 && !isActive && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <Circle className="h-2 w-2 fill-blue-600 text-blue-600 animate-pulse" />
                    <span className="text-[10px] font-black text-blue-600 tracking-wider">جديد</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="px-2 text-[10px] font-black tracking-widest text-slate-400">
          ابحث عن مستخدم لبدء محادثة مباشرة أو افتح محادثة قائمة.
        </div>
      </div>
    </div>
  );
}
