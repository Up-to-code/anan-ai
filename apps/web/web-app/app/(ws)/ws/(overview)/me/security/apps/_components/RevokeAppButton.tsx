"use client";

import { useTransition } from "react";
import { ShieldBan } from "lucide-react";

type RevokeAppButtonProps = {
  revokeAction: () => Promise<void>;
};

/**
 * WHY:   Revoking an authorized app is destructive and needs an explicit confirmation step.
 * WHAT:  Client button that confirms intent, then runs the supplied revoke server action.
 * HOW:   Uses `window.confirm` and `useTransition` to keep the pending state local to the button.
 */
export default function RevokeAppButton({ revokeAction }: RevokeAppButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const confirmed = window.confirm("هل أنت متأكد من إلغاء ربط هذا التطبيق؟ سيتم قطع جميع الجلسات.");
    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      await revokeAction();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-2 border-2 border-red-200 bg-red-50 px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <ShieldBan className="h-4 w-4" />
      {isPending ? "جاري الإلغاء…" : "إلغاء ربط التطبيق"}
    </button>
  );
}
