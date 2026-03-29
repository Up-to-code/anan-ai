"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useConvexAuth, useMutation } from "convex/react";
import { ChatHeader } from "@/client_zone/components/chat/ChatHeader";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { Button } from "@/client_zone/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/client_zone/components/ui/card";
import { api } from "@/lib/convexApi";

type BridgePayload = {
  title?: string;
  messages: Array<{
    role: "assistant" | "user";
    text: string;
    properties?: unknown[];
    cards?: unknown[];
    suggestedPrompts?: string[];
    activePropertyId?: string;
    requiresAuthForHandoff?: boolean;
  }>;
  activeProperty: {
    id: string;
    title: string;
  } | null;
  handoff?: {
    propertyId: string;
    message: string;
  };
};

function parsePayload(payload?: string) {
  if (!payload?.trim()) return null;
  try {
    return JSON.parse(payload) as BridgePayload;
  } catch {
    return null;
  }
}

function buildMobileAccountDeepLink(args: { threadId?: string; orderId?: string }) {
  const params = new URLSearchParams();
  if (args.threadId) params.set("threadId", args.threadId);
  if (args.orderId) params.set("orderId", args.orderId);
  if (args.orderId) {
    return `anan-mobile://handoff${params.toString() ? `?${params.toString()}` : ""}`;
  }
  return `anan-mobile:///${params.toString() ? `?${params.toString()}` : ""}`;
}

/**
 * WHY:   The native Expo app does not yet host a first-party auth client, but buyers still need saved history and authenticated handoff.
 * WHAT:  Reuses the existing client-web auth session to persist the mobile transcript and optionally create the advisor handoff.
 * HOW:   Validates the serialized payload, redirects guests into the normal sign-in route, then deep-links back into the app on success.
 */
export function MobileAuthBridgePage({ payload }: { payload?: string }) {
  const parsedPayload = useMemo(() => parsePayload(payload), [payload]);
  const { isAuthenticated } = useConvexAuth();
  const { dictionary } = useLocaleDictionary();
  const seedClientThreadFromTranscript = useMutation(api.user_zone.web.threads.seedClientThreadFromTranscript);
  const createQualifiedHandoff = useMutation(api.user_zone.mobile.assistant.createQualifiedHandoff);
  const [status, setStatus] = useState<"invalid" | "ready" | "processing" | "done" | "error">(
    parsedPayload ? "ready" : "invalid",
  );
  const [deepLink, setDeepLink] = useState("anan-mobile://account");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasStarted = useRef(false);
  const returnTo = useMemo(
    () => `/mobile-auth${payload ? `?payload=${encodeURIComponent(payload)}` : ""}`,
    [payload],
  );

  useEffect(() => {
    if (!parsedPayload || !isAuthenticated || hasStarted.current) return;

    hasStarted.current = true;
    setStatus("processing");

    void (async () => {
      try {
        let threadId: string | undefined;
        if (parsedPayload.messages.length > 0) {
          const seeded = await seedClientThreadFromTranscript({
            title: parsedPayload.title,
            messages: parsedPayload.messages as never,
          });
          threadId = String(seeded.threadId);
        }

        let orderId: string | undefined;
        if (parsedPayload.handoff?.propertyId) {
          const order = await createQualifiedHandoff({
            propertyId: parsedPayload.handoff.propertyId as never,
            message: parsedPayload.handoff.message,
            threadId,
            sourceChannel: "app",
          });
          orderId = String(order.orderId);
        }

        const nextDeepLink = buildMobileAccountDeepLink({ threadId, orderId });
        setDeepLink(nextDeepLink);
        setStatus("done");
        window.location.href = nextDeepLink;
      } catch (error) {
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "unknown_failure");
      }
    })();
  }, [createQualifiedHandoff, isAuthenticated, parsedPayload, seedClientThreadFromTranscript]);

  return (
    <div className="min-h-screen bg-[var(--workspace-shell)]">
      <ChatHeader isAuthenticated={isAuthenticated} />
      <main className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4 py-8">
        <Card className="w-full max-w-lg rounded-[30px] border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] shadow-[0_20px_44px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <CardTitle>
              {status === "done"
                ? "تم تجهيز تجربة الموبايل"
                : status === "processing"
                  ? "جارٍ حفظ المحادثة"
                  : "مزامنة محادثة الموبايل"}
            </CardTitle>
            <CardDescription>
              {status === "done"
                ? "يمكنك العودة مباشرة إلى التطبيق."
                : parsedPayload?.handoff
                  ? "سنحفظ المحادثة وننشئ طلب المستشار من نفس الخلفية."
                  : "سنحفظ سجل الموبايل على حسابك ثم نعيدك إلى التطبيق."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {parsedPayload?.activeProperty ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">العقار النشط</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{parsedPayload.activeProperty.title}</p>
              </div>
            ) : null}

            {!parsedPayload ? (
              <p className="text-sm text-red-600">تعذر قراءة بيانات المزامنة القادمة من التطبيق.</p>
            ) : null}

            {status === "processing" ? (
              <p className="text-sm text-slate-500">لحظات قليلة ونحن نجهز السجل ونعيدك إلى التطبيق.</p>
            ) : null}

            {status === "error" ? (
              <p className="text-sm text-red-600">
                لم نتمكن من إكمال المزامنة الآن. {errorMessage ? `(${errorMessage})` : null}
              </p>
            ) : null}

            {!isAuthenticated && parsedPayload ? (
              <div className="flex flex-wrap gap-3">
                <Link href={`/signin?returnTo=${encodeURIComponent(returnTo)}`}>
                  <Button>{dictionary.app.signInButton}</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline">{dictionary.app.continueGuest}</Button>
                </Link>
              </div>
            ) : null}

            {(status === "done" || status === "error") && parsedPayload ? (
              <div className="flex flex-wrap gap-3">
                <a href={deepLink}>
                  <Button>العودة إلى التطبيق</Button>
                </a>
                <Link href="/app/history">
                  <Button variant="outline">افتح السجل المحفوظ</Button>
                </Link>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
