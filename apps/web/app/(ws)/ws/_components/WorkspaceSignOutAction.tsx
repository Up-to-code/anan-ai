"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@anan/auth-sdk/react";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type WorkspaceSignOutActionProps = {
  variant?: "button" | "menu";
  className?: string;
};

/**
 * WHY:   Workspace surfaces need one reusable sign-out action so account menus and account pages do not drift in copy, behavior, or localization.
 * WHAT:  Signs the current user out and renders either a standalone button or a dropdown-menu item.
 * HOW:   Uses Better Auth's `signOut`, then redirects to `/signin`, while reading all labels from the shared web dictionary.
 */
export default function WorkspaceSignOutAction({
  variant = "button",
  className,
}: WorkspaceSignOutActionProps) {
  const router = useRouter();
  const auth = useAuth();
  const { dictionary, isRtl } = useWebLocale();
  const [isPending, startTransition] = useTransition();

  const label = isPending ? dictionary.settings.loggingOut : dictionary.settings.logoutAction;

  const handleSignOut = () => {
    startTransition(async () => {
      await authClient.signOut();
      auth.signOut("/signin");
      router.replace("/signin");
      router.refresh();
    });
  };

  if (variant === "menu") {
    return (
      <DropdownMenuItem
        onClick={handleSignOut}
        disabled={isPending}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-red-600 focus:bg-red-500/8 focus:text-red-700 dark:text-red-300 dark:focus:bg-red-500/10 dark:focus:text-red-200",
          isRtl ? "flex-row-reverse text-right" : "flex-row text-left",
          className,
        )}
      >
        <LogOut className="h-4 w-4 shrink-0" />
        <span className="text-[13px] font-bold">{label}</span>
      </DropdownMenuItem>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[16px] bg-slate-100 px-4 py-2.5 text-[13px] font-bold text-slate-700 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-red-500/10 dark:hover:text-red-200",
        className,
      )}
    >
      <LogOut className="h-4 w-4" />
      {label}
    </button>
  );
}
