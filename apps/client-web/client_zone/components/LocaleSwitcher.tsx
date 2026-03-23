"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useLocaleDictionary } from "./LocaleProvider";
import { Button } from "./ui/button";

/**
 * WHY:   Buyers need a lightweight language toggle that persists across the client surface.
 * WHAT:  Switches between Arabic and English by writing the locale cookie and refreshing the route.
 * HOW:   Posts the new locale to the local API endpoint and triggers a router refresh in a transition.
 */
export function LocaleSwitcher() {
  const router = useRouter();
  const { locale } = useLocaleDictionary();
  const [isPending, startTransition] = useTransition();
  const nextLocale = locale === "ar" ? "en" : "ar";
  const label = nextLocale.toUpperCase();

  function handleSwitch(nextLocale: "ar" | "en") {
    startTransition(async () => {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: nextLocale }),
      });
      router.refresh();
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="min-w-11 rounded-full"
      onClick={() => handleSwitch(nextLocale)}
      disabled={isPending}
      aria-label={`Switch language to ${label}`}
    >
      {label}
    </Button>
  );
}
