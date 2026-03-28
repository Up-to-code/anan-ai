"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

/**
 * WHY:   Account management needs one explicit sign-out control without converting the whole page to a Client Component.
 * WHAT:  Signs the current user out of Convex Auth, then returns them to the public sign-in route.
 * HOW:   Uses the auth react bindings for token/session cleanup and a local transition state for the button.
 */
export default function LogoutButton() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(async () => {
          await signOut();
          router.replace("/signin");
          router.refresh();
        });
      }}
      disabled={isPending}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-red-500/40 dark:hover:bg-red-500/10 dark:hover:text-red-200"
    >
      <LogOut className="h-4 w-4" />
      {isPending ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
    </button>
  );
}
