"use client";

import Link from "next/link";
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

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/92 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center justify-between px-3 sm:px-4">
        <div className="flex items-center gap-3">
          {onToggleHistory ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleHistory}
              aria-label={dictionary.app.openMenu}
              aria-controls="client-history-sidebar"
              aria-haspopup="dialog"
              className="rounded-lg"
            >
              <Menu className="h-4 w-4" />
            </Button>
          ) : null}
          <AnanBrandMark />
          <span className="text-sm font-semibold text-slate-900">{dictionary.nav.brand}</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <LocaleSwitcher />
          {!isAuthenticated ? (
            <Link href="/signin?returnTo=%2F">
              <Button variant="ghost" size="icon" aria-label={dictionary.nav.signIn} className="rounded-lg">
                <LogIn className="h-4 w-4" />
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
