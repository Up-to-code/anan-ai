"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
const roleLabels: Record<"manager" | "member" | "viewer", string> = {
  manager: "مدير",
  member: "عضو",
  viewer: "مشاهد",
};
type DirectoryResult = {
  id: string;
  authUserId: string;
  email: string;
  name: string;
  username?: string;
  membershipState: "not-member" | "pending-invite" | "member";
  canMessage: boolean;
  conversationId?: string | null;
};
function MembershipStateBadge({ state }: { state: DirectoryResult["membershipState"] }) {
  const toneClass
    = state === "member"
      ? "border-green-100 bg-green-50 text-green-700"
      : state === "pending-invite"
        ? "border-amber-100 bg-amber-50 text-amber-700"
        : "border-slate-200 bg-slate-50 text-slate-500";
  const label = state === "member" ? "عضو حالي" : state === "pending-invite" ? "دعوة معلقة" : "ليس عضواً";
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
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {result.membershipState === "not-member" && canManage ? (
        <button
          type="button"
          onClick={() => void onInvite(result.email)}
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-4 py-2 text-[11px] font-black tracking-widest uppercase text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          دعوة
        </button>
      ) : null}
      {result.canMessage ? (
        <button
          type="button"
          onClick={() => void onMessage(result.authUserId, result.conversationId)}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-[11px] font-black tracking-widest uppercase text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
        >
          رسالة
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
    <div className="p-4 transition hover:bg-slate-50/50">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="truncate text-sm font-black text-slate-950">{result.name}</div>
          <div className="mt-1 truncate text-[11px] font-medium text-slate-500" dir="ltr">{result.email}</div>
          {result.username ? (
            <div className="mt-1 text-[10px] font-bold text-slate-400" dir="ltr">@{result.username}</div>
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
 * WHY:   The workspace settings area needs a simple invite flow that maps to the existing team-invite API.
 * WHAT:  Renders exact-match directory search plus invite/message actions for the current organization.
 * HOW:   Searches only by full email or username, then lets managers invite or open direct conversations from the same result row.
 */
export default function InviteMemberForm({
  canManage = true,
  showHeader = true,
  hasOrganization = true,
}: {
  canManage?: boolean;
  showHeader?: boolean;
  hasOrganization?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"manager" | "member" | "viewer">("member");
  const [results, setResults] = useState<DirectoryResult[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  async function handleInvite(email: string) {
    if (!canManage) {
      setStatus("صلاحية المدير مطلوبة لإرسال الدعوات.");
      return;
    }
    setIsSubmitting(true);
    setStatus("جاري إرسال الدعوة...");
    const response = await fetch("/api/workspace/team-invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const payload = response.status === 201 ? null : ((await response.json()) as { message?: string });
    if (!response.ok) {
      setStatus(payload?.message ?? "تعذر إرسال الدعوة.");
      setIsSubmitting(false);
      return;
    }
    setStatus("تم إرسال الدعوة بنجاح.");
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
    const response = await fetch("/api/workspace/inbox", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent: "resolve", targetUserId }),
    });
    if (!response.ok) {
      setStatus("تعذر فتح المحادثة.");
      return;
    }
    const payload = (await response.json()) as { conversationId: string };
    router.push(`/ws/inbox/${payload.conversationId}`);
  }
  return (
    <form
      className="flex flex-col gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!hasOrganization) {
          setStatus("لا توجد منظمة مرتبطة بالحساب الحالي.");
          return;
        }
        setIsSearching(true);
        setStatus("جاري البحث...");
        const response = await fetch(`/api/workspace/directory?q=${encodeURIComponent(query.trim())}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as DirectoryResult[] | { message?: string };
        if (!response.ok) {
          setResults([]);
          setStatus(("message" in payload ? payload.message : null) ?? "تعذر البحث.");
          setIsSearching(false);
          return;
        }
        setResults(Array.isArray(payload) ? payload : []);
        setStatus(Array.isArray(payload) && payload.length === 0 ? "لا توجد نتيجة مطابقة. يمكنك دعوة البريد الكامل مباشرة." : null);
        setIsSearching(false);
      }}
    >
      {showHeader ? (
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-black tracking-tight text-slate-950">دعوة عضو جديد</h2>
          <p className="text-sm font-medium text-slate-500">
            ابحث بالبريد أو اسم المستخدم ثم أرسل الدعوة أو افتح محادثة مباشرة.
          </p>
        </div>
      ) : null}
      {!hasOrganization ? (
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
          لا يمكنك إرسال دعوات قبل ربط الحساب بمنظمة.
        </div>
      ) : null}
      <div className="space-y-2">
        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">البحث بالبريد الكامل أو اسم المستخدم</label>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-950 transition focus:bg-white focus-visible:border-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
          placeholder="name@company.com أو username"
          type="text"
          dir="ltr"
          disabled={!hasOrganization}
        />
        <p className="text-[10px] font-bold text-slate-400">
          لن يظهر أي مستخدم إلا إذا كتبت بريده الكامل أو اسم المستخدم المطابق تماماً.
        </p>
      </div>
      <div className="space-y-3">
        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">الدور</label>
        <div className="flex flex-wrap gap-2">
          {(["manager", "member", "viewer"] as const).map((entry) => (
            <button
              key={entry}
              type="button"
              onClick={() => setRole(entry)}
              disabled={isSubmitting || !hasOrganization}
              className={cn(
                "rounded-lg border px-4 py-2 text-xs font-black tracking-widest uppercase transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                role === entry 
                  ? "border-blue-600 bg-blue-600 text-white shadow-sm" 
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
              )}
            >
              {roleLabels[entry]}
            </button>
          ))}
        </div>
      </div>
      <button
        type="submit"
        disabled={isSearching || !hasOrganization}
        className="inline-flex w-fit items-center justify-center rounded-lg bg-slate-950 px-6 py-3 text-xs font-black tracking-[0.18em] text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSearching ? "جاري البحث..." : "بحث"}
      </button>
      {results.length > 0 ? (
        <div className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
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
          onClick={() => void handleInvite(query.trim())}
          disabled={isSubmitting}
          className="inline-flex w-fit items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-xs font-black tracking-[0.18em] text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "جاري إرسال الدعوة..." : "دعوة هذا البريد مباشرة"}
        </button>
      ) : null}
      {status ? (
        <div className="border-t border-slate-100 pt-4">
          <div aria-live="polite" className="text-xs font-bold text-slate-500">{status}</div>
        </div>
      ) : null}
    </form>
  );
}
