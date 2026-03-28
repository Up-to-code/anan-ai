"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LogIn, Menu } from "lucide-react";
import { LocaleSwitcher } from "@/client_zone/components/LocaleSwitcher";
import { Button } from "@/client_zone/components/ui/button";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { AnanBrandMark } from "./AnanBrandMark";

/**
 * WHY:   The primary chat route still needs a minimal top bar for identity, locale, and account actions.
 * WHAT:  Renders the small ChatGPT-style header used across the simplified client surface.
 * HOW:   Keeps the action count intentionally low to avoid reintroducing dashboard chrome.
 */
export function ChatHeader({
  isAuthenticated,
  onToggleHistory,
}: {
  isAuthenticated: boolean;
  onToggleHistory?: () => void;
}) {
  const { dictionary } = useLocaleDictionary();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnTo = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  return (
    <header className="sticky top-0 z-20 border-b border-[color:var(--workspace-border)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_88%,white)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {onToggleHistory ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleHistory}
              aria-label={dictionary.app.openMenu}
              aria-controls="client-history-sidebar"
              aria-haspopup="dialog"
              className="rounded-full"
            >
              <Menu className="h-4 w-4" />
            </Button>
          ) : null}
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] shadow-sm">
            <AnanBrandMark className="h-9 w-9" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-black text-[var(--workspace-bubble-other-foreground)]">
              {dictionary.nav.brand}
            </div>
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--workspace-muted)]">
              {dictionary.app.shellSubtitle}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <LocaleSwitcher />
          {!isAuthenticated ? (
            <Link href={`/signin?returnTo=${encodeURIComponent(returnTo)}`}>
              <Button variant="ghost" size="icon" aria-label={dictionary.nav.signIn} className="rounded-full">
                <LogIn className="h-4 w-4" />
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
