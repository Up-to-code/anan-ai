import Link from "next/link";
import { Lock } from "lucide-react";
import { Card, CardContent } from "@/client_zone/components/ui/card";
import { Button } from "@/client_zone/components/ui/button";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";

/**
 * WHY:   Auth gating should appear in the thread itself instead of a detached side panel or page banner.
 * WHAT:  Renders the compact sign-in notice shown when guests try to save or request handoff.
 * HOW:   Provides only the essential action path to keep the chat flow focused.
 */
export function ChatAuthGateNotice({ returnTo }: { returnTo: string }) {
  const { dictionary } = useLocaleDictionary();

  return (
    <Card className="max-w-[85%] border-dashed">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
          <Lock className="h-4 w-4" />
          <span>{dictionary.app.signInPrompt}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/signin?returnTo=${encodeURIComponent(returnTo)}`}>
            <Button size="sm">{dictionary.nav.signIn}</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
