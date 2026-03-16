"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const [results, setResults] = useState<Array<{
    id: string;
    authUserId: string;
    email: string;
    name: string;
    username?: string;
    membershipState: "not-member" | "pending-invite" | "member";
    canMessage: boolean;
    conversationId?: string | null;
  }>>([]);
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
      className="grid w-full gap-4 border border-slate-200 bg-white p-6"
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
        const payload = (await response.json()) as Array<{
          id: string;
          authUserId: string;
          email: string;
          name: string;
          username?: string;
          membershipState: "not-member" | "pending-invite" | "member";
          canMessage: boolean;
          conversationId?: string | null;
        }> | { message?: string };
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
        <div>
          <h2 className="text-xl font-black text-slate-950">دعوة عضو جديد</h2>
          <p className="mt-2 text-sm font-medium text-slate-500">
            ابحث بالبريد أو اسم المستخدم ثم أرسل الدعوة أو افتح محادثة مباشرة.
          </p>
        </div>
      ) : null}
      {!hasOrganization ? (
        <div className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
          لا يمكنك إرسال دعوات قبل ربط الحساب بمنظمة.
        </div>
      ) : null}
      <div>
        <label className="text-sm font-semibold text-slate-600">البحث بالبريد الكامل أو اسم المستخدم</label>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="mt-2 w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-950 transition focus:bg-white focus-visible:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
          placeholder="name@company.com أو username"
          type="text"
          dir="ltr"
          disabled={!hasOrganization}
        />
        <p className="mt-2 text-xs font-medium text-slate-500">
          لن يظهر أي مستخدم إلا إذا كتبت بريده الكامل أو اسم المستخدم المطابق تماماً.
        </p>
      </div>
      <div>
        <label className="text-sm font-semibold text-slate-600">الدور</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {(["manager", "member", "viewer"] as const).map((entry) => (
            <button
              key={entry}
              type="button"
              onClick={() => setRole(entry)}
              disabled={isSubmitting || !hasOrganization}
              className={`border px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 ${
                role === entry ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {entry}
            </button>
          ))}
        </div>
      </div>
      <button
        type="submit"
        disabled={isSearching || !hasOrganization}
        className="inline-flex w-fit items-center justify-center border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
      >
        {isSearching ? "جاري البحث..." : "بحث"}
      </button>

      {results.length > 0 ? (
        <div className="divide-y divide-slate-200 border border-slate-200 bg-white">
          {results.map((result) => (
            <div key={result.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-black text-slate-950">{result.name}</div>
                  <div className="mt-1 text-xs font-medium text-slate-500" dir="ltr">{result.email}</div>
                  {result.username ? (
                    <div className="mt-1 text-xs font-medium text-slate-400" dir="ltr">@{result.username}</div>
                  ) : null}
                </div>
                <span className="border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600">
                  {result.membershipState === "member"
                    ? "عضو حالي"
                    : result.membershipState === "pending-invite"
                      ? "دعوة معلقة"
                      : "ليس عضواً"}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {result.membershipState === "not-member" && canManage ? (
                  <button
                    type="button"
                    onClick={() => void handleInvite(result.email)}
                    disabled={isSubmitting}
                    className="border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-slate-800 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    دعوة
                  </button>
                ) : null}

                {result.canMessage ? (
                  <button
                    type="button"
                    onClick={() => void handleMessage(result.authUserId, result.conversationId)}
                    className="border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
                  >
                    رسالة
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!results.length && query.includes("@") && canManage && hasOrganization ? (
        <button
          type="button"
          onClick={() => void handleInvite(query.trim())}
          disabled={isSubmitting}
          className="inline-flex w-fit items-center justify-center border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "جاري إرسال الدعوة..." : "دعوة هذا البريد مباشرة"}
        </button>
      ) : null}

      {status ? <div aria-live="polite" className="text-sm font-medium text-slate-600">{status}</div> : null}
    </form>
  );
}
