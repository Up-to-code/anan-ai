import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/client_zone/components/ui/button";
import { CardContent } from "@/client_zone/components/ui/card";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { AgUiCardHeading, AgUiCardShell } from "./ag-ui/AgUiCardPrimitives";
import { ClientAssistantColumn } from "./chatLayout";

/**
 * WHY:   Auth gating should appear in the thread itself instead of a detached side panel or page banner.
 * WHAT:  Renders the compact sign-in notice shown when guests try to save or request handoff.
 * HOW:   Provides only the essential action path to keep the chat flow focused.
 */
export function ChatAuthGateNotice({ returnTo }: { returnTo: string }) {
  const { dictionary } = useLocaleDictionary();

  return (
    <ClientAssistantColumn>
      <AgUiCardShell className="border-dashed">
        <AgUiCardHeading
          title={dictionary.app.signInPrompt}
          summary={dictionary.app.saveHistory}
          aside={
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--workspace-border)_86%,transparent)] bg-[var(--workspace-elevated)] text-[var(--workspace-highlight)]">
              <Lock className="h-4 w-4" />
            </div>
          }
        />
        <CardContent className="pt-0">
          <Link href={`/signin?returnTo=${encodeURIComponent(returnTo)}`}>
            <Button size="sm">{dictionary.nav.signIn}</Button>
          </Link>
        </CardContent>
      </AgUiCardShell>
    </ClientAssistantColumn>
  );
}
