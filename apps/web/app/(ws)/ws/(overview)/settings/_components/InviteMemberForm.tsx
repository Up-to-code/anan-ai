"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import { useMutation } from "convex/react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/convexApi";
import type { DirectorySearchResult } from "@/server/contracts/organizations";

type DirectoryResult = DirectorySearchResult;
function MembershipStateBadge({ state }: { state: DirectoryResult["membershipState"] }) {
  const { dictionary } = useWebLocale();
  const toneClass =
    state === "member"
      ? "border-green-100 bg-green-50 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300"
      : state === "pending-invite"
        ? "border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
        : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300";
  const label =
    state === "member"
      ? dictionary.settings.currentMember
      : state === "pending-invite"
        ? dictionary.inbox.pendingInvite
        : dictionary.settings.nonMember;

  return (
    <span className={cn("shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest", toneClass)}>
      {label}
    </span>
  );
}

function InviteResultActions({
  result,
  canManage,
  isSubmitting,
  onInvite,
  onMessage,
}: {
  result: DirectoryResult;
  canManage: boolean;
  isSubmitting: boolean;
  onInvite: (email: string) => Promise<void>;
  onMessage: (targetUserId: string, conversationId?: string | null) => Promise<void>;
}) {
  const { dictionary } = useWebLocale();

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {result.membershipState === "not-member" && canManage ? (
        <button
          type="button"
          onClick={() => void onInvite(result.email)}
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-4 py-2 text-[11px] font-black tracking-widest uppercase text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {dictionary.settings.sendInvite}
        </button>
      ) : null}
      {result.canMessage ? (
        <button
          type="button"
          onClick={() => void onMessage(result.authUserId, result.conversationId)}
          className="rounded-xl border border-border bg-background px-4 py-2 text-[11px] font-black tracking-widest uppercase text-foreground shadow-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {dictionary.settings.openConversation}
        </button>
      ) : null}
    </div>
  );
}

function InviteResultRow({
  result,
  canManage,
  isSubmitting,
  onInvite,
  onMessage,
}: {
  result: DirectoryResult;
  canManage: boolean;
  isSubmitting: boolean;
  onInvite: (email: string) => Promise<void>;
  onMessage: (targetUserId: string, conversationId?: string | null) => Promise<void>;
}) {
  return (
    <div className="p-4 transition hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="truncate text-sm font-black text-slate-950 dark:text-slate-100">{result.name}</div>
          <div className="mt-1 truncate text-[11px] font-medium text-slate-500 dark:text-slate-400" dir="ltr">
            {result.email}
          </div>
          {result.username ? (
            <div className="mt-1 text-[10px] font-bold text-slate-400 dark:text-slate-500" dir="ltr">
              @{result.username}
            </div>
          ) : null}
        </div>
        <MembershipStateBadge state={result.membershipState} />
      </div>
      <InviteResultActions
        result={result}
        canManage={canManage}
        isSubmitting={isSubmitting}
        onInvite={onInvite}
        onMessage={onMessage}
      />
    </div>
  );
}
/**
 * WHY:   The workspace settings area needs a simple invite flow that stays inside the app boundary.
 * WHAT:  Renders exact-match directory search plus invite/message actions for the current organization.
 * HOW:   Searches only by full email or username, uses server actions for team operations, and opens direct conversations through Convex.
 */
export default function InviteMemberForm({
  canManage = true,
  showHeader = true,
  hasOrganization = true,
  onCreateInvite,
  onSearchDirectory,
}: {
  canManage?: boolean;
  showHeader?: boolean;
  hasOrganization?: boolean;
  onCreateInvite: (input: {
    email: string;
    role: "manager" | "member" | "viewer";
  }) => Promise<{ ok: true; message: string; inviteId?: string } | { ok: false; message: string }>;
  onSearchDirectory: (query: string) => Promise<{ ok: true; results: DirectoryResult[] } | { ok: false; message: string }>;
}) {
  const { dictionary, direction } = useWebLocale();
  const router = useRouter();
  const resolveConversation = useMutation(api.shared_logic.inbox.resolveDirectConversation);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"manager" | "member" | "viewer">("member");
  const [results, setResults] = useState<DirectoryResult[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleInvite(email: string) {
    if (!canManage) {
      setStatus(dictionary.settings.managerPermissionRequired);
      return;
    }

    setIsSubmitting(true);
    setStatus(dictionary.settings.inviteSending);
    const result = await onCreateInvite({ email, role });
    if (!result.ok) {
      setStatus(result.message);
      setIsSubmitting(false);
      return;
    }
    setStatus(result.message);
    setResults((current) =>
      current.map((result) =>
        result.email === email ? { ...result, membershipState: "pending-invite" } : result,
      ),
    );
    setIsSubmitting(false);
  }

  async function handleMessage(targetUserId: string, conversationId?: string | null) {
    if (conversationId) {
      router.push(`/ws/inbox/${conversationId}`);
      return;
    }

    try {
      const conversationId = await resolveConversation({ targetUserId });
      router.push(`/ws/inbox/${conversationId}`);
    } catch {
      setStatus(dictionary.settings.openConversationFailed);
    }
  }

  return (
    <form
      className="flex flex-col gap-6 p-5"
      dir={direction}
      onSubmit={async (event) => {
        event.preventDefault();

        if (!hasOrganization) {
          setStatus(dictionary.settings.noOrganizationLinked);
          return;
        }

        setIsSearching(true);
        setStatus(dictionary.settings.searchingDirectory);
        const result = await onSearchDirectory(query.trim());
        if (!result.ok) {
          setResults([]);
          setStatus(result.message);
          setIsSearching(false);
          return;
        }
        setResults(result.results);
        setStatus(result.results.length === 0 ? dictionary.settings.noMatchingDirectoryResult : null);
        setIsSearching(false);
      }}
    >
      {showHeader ? (
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-100">{dictionary.settings.inviteMemberTitle}</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-300">
            {dictionary.settings.inviteMemberDescription}
          </p>
        </div>
      ) : null}

      {!hasOrganization ? (
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          {dictionary.settings.cannotInviteWithoutOrganization}
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{dictionary.settings.inviteSearchLabel}</label>
        <input
          data-testid="invite-member-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm font-medium text-foreground transition focus:bg-background focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder={dictionary.settings.inviteSearchPlaceholder}
          type="text"
          dir="ltr"
          disabled={!hasOrganization}
        />
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{dictionary.settings.inviteSearchHint}</p>
      </div>

      <div className="space-y-3">
        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{dictionary.settings.roleLabel}</label>
        <div className="flex flex-wrap gap-2">
          {(["manager", "member", "viewer"] as const).map((entry) => (
            <button
              key={entry}
              type="button"
              data-testid={`invite-member-role-${entry}`}
              onClick={() => setRole(entry)}
              disabled={isSubmitting || !hasOrganization}
              className={cn(
                "rounded-xl border px-4 py-2 text-xs font-black tracking-widest uppercase transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                role === entry
                  ? "border-foreground bg-foreground text-background shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:bg-muted",
              )}
            >
              {entry === "manager" ? dictionary.settings.manager : entry === "viewer" ? dictionary.settings.viewer : dictionary.settings.member}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        data-testid="invite-member-search-submit"
        disabled={isSearching || !hasOrganization}
        className="inline-flex w-fit items-center justify-center rounded-xl bg-foreground px-6 py-3 text-xs font-black tracking-[0.18em] text-background shadow-sm transition hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSearching ? dictionary.settings.searchingDirectory : dictionary.assistant.search}
      </button>

      {results.length > 0 ? (
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          {results.map((result) => (
            <InviteResultRow
              key={result.id}
              result={result}
              canManage={canManage}
              isSubmitting={isSubmitting}
              onInvite={handleInvite}
              onMessage={handleMessage}
            />
          ))}
        </div>
      ) : null}

      {!results.length && query.includes("@") && canManage && hasOrganization ? (
        <button
          type="button"
          data-testid="invite-member-submit"
          onClick={() => void handleInvite(query.trim())}
          disabled={isSubmitting}
          className="inline-flex w-fit items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-xs font-black tracking-[0.18em] text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? dictionary.settings.inviteSending : dictionary.settings.sendInvite}
        </button>
      ) : null}

      {status ? (
        <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
          <div aria-live="polite" className="text-xs font-bold text-slate-500 dark:text-slate-300">
            {status}
          </div>
        </div>
      ) : null}
    </form>
  );
}
