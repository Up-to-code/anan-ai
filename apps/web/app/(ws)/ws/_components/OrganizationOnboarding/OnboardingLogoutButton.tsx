"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type OnboardingLogoutButtonProps = {
  label?: string;
  variant?: "primary" | "ghost";
  className?: string;
};

/**
 * WHY:   Onboarding should always provide a fast way to switch accounts.
 * WHAT:  Signs the current user out and returns them to the sign-in route.
 * HOW:   Calls Better Auth sign-out and navigates to `/signin` with a transition state.
 */
export default function OnboardingLogoutButton({
  label = "تسجيل الخروج",
  variant = "primary",
  className,
}: OnboardingLogoutButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const baseClasses =
    "inline-flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition disabled:opacity-60";
  const variantClasses =
    variant === "ghost"
      ? "rounded-full border border-border bg-card px-6 py-2.5 text-muted-foreground hover:border-primary/40 hover:text-primary"
      : "rounded-full border border-primary bg-primary px-6 py-2.5 text-primary-foreground hover:opacity-90";

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(async () => {
          await authClient.signOut();
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
