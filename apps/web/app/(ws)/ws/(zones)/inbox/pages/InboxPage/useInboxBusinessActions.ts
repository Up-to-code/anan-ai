"use client";

import { useState } from "react";

async function postInboxIntent<TResult>(body: Record<string, unknown>) {
  const response = await fetch("/api/workspace/inbox", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message ?? "تعذر تنفيذ الإجراء.");
  }

  return response.json() as Promise<TResult>;
}

export function useInboxBusinessActions() {
  const [businessActionError, setBusinessActionError] = useState<string | null>(null);
  const [isBusinessActionPending, setIsBusinessActionPending] = useState(false);

  const clearBusinessActionError = () => {
    setBusinessActionError(null);
  };

  const runBusinessAction = async <TResult>(action: () => Promise<TResult>) => {
    setBusinessActionError(null);
    setIsBusinessActionPending(true);

    try {
      return await action();
    } catch (error) {
      setBusinessActionError(error instanceof Error ? error.message : "تعذر تنفيذ هذا الإجراء الآن.");
      throw error;
    } finally {
      setIsBusinessActionPending(false);
    }
  };

  return {
    businessActionError,
    clearBusinessActionError,
    isBusinessActionPending,
    postInboxIntent,
    runBusinessAction,
  };
}
