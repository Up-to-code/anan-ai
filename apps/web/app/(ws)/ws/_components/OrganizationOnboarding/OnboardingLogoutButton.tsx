"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

type OnboardingLogoutButtonProps = {
  label?: string;
  variant?: "primary" | "ghost";
  className?: string;
};

/**
 * WHY:   Onboarding should always provide a fast way to switch accounts.
 * WHAT:  Signs the current user out and returns them to the sign-in route.
 * HOW:   Calls Convex Auth sign-out and navigates to `/signin` with a transition state.
 */
export default function OnboardingLogoutButton({
  label = "تسجيل الخروج",
  variant = "primary",
  className,
}: OnboardingLogoutButtonProps) {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const [isPending, startTransition] = useTransition();

  const baseClasses = "inline-flex items-center justify-center gap-2 text-xs font-semibold transition disabled:opacity-60";
  const variantClasses =
    variant === "ghost"
      ? "border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
      : "border border-slate-900 bg-slate-900 px-3 py-2 text-white hover:bg-slate-800";

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
      className={[baseClasses, variantClasses, className].filter(Boolean).join(" ")}
    >
      <LogOut className="h-3.5 w-3.5" />
      {isPending ? "جاري تسجيل الخروج..." : label}
    </button>
  );
}
