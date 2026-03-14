"use client";

import { Check, MessageCircle, X } from "lucide-react";
import type { IncomingOrganizationInvite } from "@/server/contracts/organizations";

/**
 * WHY:   Workspace users need invite actions close to conversation discovery without interrupting the active thread.
 * WHAT:  Renders a compact queue of incoming organization invites with accept, cancel, and message actions.
 * HOW:   Keeps invite cards lightweight and delegates each action back to the inbox page orchestrator.
 */
export default function InboxInviteQueue({
  invites,
  onAcceptInvite,
  onCancelInvite,
  onMessageInvite,
}: {
  invites: IncomingOrganizationInvite[];
  onAcceptInvite: (invite: IncomingOrganizationInvite) => void;
  onCancelInvite: (inviteId: string) => void;
  onMessageInvite: (invite: IncomingOrganizationInvite) => void;
}) {
  if (invites.length === 0) {
    return null;
  }

  return (
    <section className="border border-slate-200 bg-slate-50">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-black text-slate-950">الدعوات الواردة</h2>
        <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
          تعامل مع دعوات الفريق بسرعة من نفس مساحة البريد الوارد.
        </p>
      </div>

      <div className="divide-y divide-slate-200">
        {invites.map((invite) => (
          <article key={invite.id} className="space-y-3 px-4 py-4">
            <div className="space-y-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-black text-slate-950">{invite.organizationName}</div>
                  <div className="text-xs font-medium text-slate-500">
                    {invite.organizationType === "broker" ? "دعوة وسيط" : "دعوة مطور"}
                  </div>
                </div>
                <div className="text-[11px] font-medium text-slate-400">
                  {new Date(invite.expiresAt).toLocaleDateString("ar-EG")}
                </div>
              </div>
              <p className="text-xs font-medium leading-5 text-slate-600">
                من {invite.inviterName} · الدور المقترح: {invite.role}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onAcceptInvite(invite)}
                className="inline-flex items-center gap-2 border border-slate-900 bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-600 hover:border-blue-600"
              >
                <Check className="h-3.5 w-3.5" />
                قبول
              </button>
              <button
                type="button"
                onClick={() => onMessageInvite(invite)}
                className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                مراسلة
              </button>
              <button
                type="button"
                onClick={() => onCancelInvite(invite.id)}
                className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 transition hover:border-rose-200 hover:text-rose-700"
              >
                <X className="h-3.5 w-3.5" />
                إلغاء
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
