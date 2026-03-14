"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MessageCircle, UserPlus } from "lucide-react";
import type { OffersDirectoryProfile } from "@/server/contracts/organizations";
import OfferPaginationNav from "../OfferPaginationNav";

/**
 * WHY:   Broker/developer tabs should expose a real collaboration directory instead of passive summary cards only.
 * WHAT:  Renders paginated directory cards with invite and direct-message actions.
 * HOW:   Uses the existing workspace invite and inbox APIs so the route stays server-loaded while the card actions stay interactive.
 */
export default function OfferDirectoryPage({
  title,
  description,
  profiles,
  totalItems,
  page,
  pageCount,
  hasPreviousPage,
  hasNextPage,
  routeBase,
}: {
  title: string;
  description: string;
  profiles: OffersDirectoryProfile[];
  totalItems: number;
  page: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  routeBase: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [busyEmail, setBusyEmail] = useState<string | null>(null);

  async function handleInvite(email: string) {
    setBusyEmail(email);
    setStatus("جاري إرسال الدعوة...");

    const response = await fetch("/api/workspace/team-invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role: "member" }),
    });
    const payload = response.ok ? null : ((await response.json()) as { message?: string });

    if (!response.ok) {
      setStatus(payload?.message ?? "تعذر إرسال الدعوة.");
      setBusyEmail(null);
      return;
    }

    setStatus("تم إرسال الدعوة. ستظهر للجهة المستهدفة داخل البريد الوارد.");
    setBusyEmail(null);
    router.refresh();
  }

  async function handleMessage(targetUserId: string, conversationId?: string | null) {
    if (conversationId) {
      router.push(`/ws/inbox/${conversationId}`);
      return;
    }

    setStatus("جاري فتح المحادثة...");
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
    <div className="flex min-h-full flex-col pb-24">
      <div className="grid gap-6 px-6 py-6 lg:px-8 lg:py-8">
        <section className="border border-slate-200 bg-white p-6 text-right">
          <h1 className="text-2xl font-black text-slate-950">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm font-medium leading-7 text-slate-600">{description}</p>
          <div className="mt-4 text-xs font-black tracking-[0.18em] text-slate-400">
            {totalItems} ملف مرئي في الدليل
          </div>
          {status ? <div className="mt-3 text-sm font-medium text-slate-600">{status}</div> : null}
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => (
            <article key={profile.id} className="border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-black tracking-[0.18em] text-slate-400">
                    {profile.role === "broker" ? "وسيط" : "مطور"}
                  </div>
                  <h2 className="mt-1 truncate text-lg font-black text-slate-950">{profile.name}</h2>
                  <div className="mt-1 text-xs font-bold text-blue-700">{profile.organizationName}</div>
                </div>
                <div className="border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black tracking-[0.16em] text-slate-600">
                  {profile.membershipState === "member"
                    ? "عضو"
                    : profile.membershipState === "pending-invite"
                      ? "دعوة معلقة"
                      : "متاح"}
                </div>
              </div>

              <div className="mt-5 space-y-2 text-sm">
                <div className="font-medium text-slate-700" dir="ltr">{profile.email}</div>
                {profile.username ? (
                  <div className="text-xs font-black tracking-[0.16em] text-slate-400" dir="ltr">
                    @{profile.username}
                  </div>
                ) : null}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {profile.membershipState === "not-member" ? (
                  <button
                    type="button"
                    onClick={() => void handleInvite(profile.email)}
                    disabled={busyEmail === profile.email}
                    className="inline-flex items-center gap-2 border border-slate-950 bg-slate-950 px-4 py-2 text-[10px] font-black tracking-[0.18em] text-white transition hover:border-blue-600 hover:bg-blue-600 disabled:opacity-60"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    دعوة
                  </button>
                ) : null}

                {profile.canMessage ? (
                  <button
                    type="button"
                    onClick={() => void handleMessage(profile.authUserId, profile.conversationId)}
                    className="inline-flex items-center gap-2 border border-slate-200 bg-white px-4 py-2 text-[10px] font-black tracking-[0.18em] text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    رسالة
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        {profiles.length === 0 ? (
          <div className="border border-dashed border-slate-300 bg-slate-50 p-16 text-center text-sm font-bold text-slate-500">
            لا توجد حسابات مرئية ضمن هذا التصنيف حالياً.
          </div>
        ) : (
          <OfferPaginationNav
            page={page}
            pageCount={pageCount}
            hasPreviousPage={hasPreviousPage}
            hasNextPage={hasNextPage}
            routeBase={routeBase}
          />
        )}
      </div>
    </div>
  );
}
