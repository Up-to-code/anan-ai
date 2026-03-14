"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createContactInquiryInputSchema } from "@/server/contracts/contact";
import { createContactInquiry } from "@/server/domains/contact/service";

function getRequestIp(requestHeaders: { get(name: string): string | null }) {
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    return first || undefined;
  }
  return requestHeaders.get("x-real-ip")?.trim() || undefined;
}

/**
 * WHY:   Contact submissions should be handled server-side for reliability and to keep the page SSR-first.
 * WHAT:  Validates and persists the contact inquiry, then redirects back with a success/error flag.
 * HOW:   Uses the shared Zod contract, captures minimal request metadata, and delegates persistence to the contact domain service.
 */
export async function submitContactInquiry(formData: FormData) {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const parsed = createContactInquiryInputSchema.safeParse(raw);
  if (!parsed.success) {
    redirect("/contact?error=1");
  }

  const requestHeaders = await headers();

  await createContactInquiry({
    ...parsed.data,
    sourceIp: getRequestIp(requestHeaders),
    userAgent: requestHeaders.get("user-agent") ?? undefined,
  });

  redirect("/contact?submitted=1");
}
