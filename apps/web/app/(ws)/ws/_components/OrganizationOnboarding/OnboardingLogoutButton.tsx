"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useClerk } from "@clerk/nextjs";

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
  const { signOut } = useClerk();
  const [isPending, startTransition] = useTransition();

  const baseClasses =
    "inline-flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition disabled:opacity-60";
  const variantClasses =
    variant === "ghost"
      ? "border-2 border-slate-100 bg-white px-6 py-2.5 text-slate-500 hover:border-blue-600 hover:text-blue-600"
      : "border-2 border-blue-600 bg-blue-600 px-6 py-2.5 text-white hover:bg-blue-700";

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(async () => {
          await signOut({ redirectUrl: "/signin" });
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
