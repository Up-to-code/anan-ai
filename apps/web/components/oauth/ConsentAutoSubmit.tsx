"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Button from "@/components/shared/Button";

/**
 * WHY:   Repeated authorizations with unchanged scopes should continue without unnecessary friction.
 * WHAT:  Auto-submits the approval form when consent can be safely reused.
 * HOW:   Calls `requestSubmit()` on mount only when `requiresConsent` is false.
 */
export default function ConsentAutoSubmit({
  action,
  requiresConsent,
  approveLabel,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  requiresConsent: boolean;
  approveLabel: string;
  children: ReactNode;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!requiresConsent) {
      formRef.current?.requestSubmit();
    }
  }, [requiresConsent]);

  return (
    <form ref={formRef} action={action}>
      {children}
      <Button type="submit" variant="dark" className="w-full justify-center">
        {approveLabel}
      </Button>
    </form>
  );
}
