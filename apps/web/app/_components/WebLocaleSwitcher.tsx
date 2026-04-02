"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getLocaleLabel, WEB_SUPPORTED_LOCALES } from "@/lib/locale";
import { cn } from "@/lib/utils";
import { useWebLocale } from "./WebLocaleProvider";

export default function WebLocaleSwitcher({
  className,
}: {
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, dictionary } = useWebLocale();
  const [isPending, startTransition] = useTransition();
  const scope = pathname.startsWith("/ws") ? "workspace" : "web";

  function handleLocaleChange(nextLocale: (typeof WEB_SUPPORTED_LOCALES)[number]) {
    startTransition(async () => {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: nextLocale, scope }),
      });
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={(
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn("h-10 w-10 rounded-[10px]", className)}
            aria-label={dictionary.nav.switchLanguage}
            title={dictionary.nav.switchLanguage}
            disabled={isPending}
          >
            <Globe className="h-4 w-4" />
          </Button>
        )}
      />
      <DropdownMenuContent align="end" className="min-w-44">
        {WEB_SUPPORTED_LOCALES.map((option) => (
          <DropdownMenuItem
            key={option}
            className="flex items-center justify-between gap-3"
            onClick={() => handleLocaleChange(option)}
          >
            <span>{getLocaleLabel(option)}</span>
            {locale === option ? <Check className="h-4 w-4" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
