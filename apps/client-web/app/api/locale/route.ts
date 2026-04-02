import { NextResponse } from "next/server";
import { WEB_LOCALE_COOKIE, resolveLocale } from "@/lib/locale";

/**
 * WHY:   The buyer app needs a lightweight endpoint to persist locale choice across routes.
 * WHAT:  Stores the selected locale in a cookie and returns the resolved locale.
 * HOW:   Validates the input against the supported locales and writes the same cookie used by the layout.
 */
export async function POST(request: Request) {
  const payload = (await request.json()) as { locale?: string };
  const locale = resolveLocale(payload.locale);
  const response = NextResponse.json({ locale });
  response.cookies.set(WEB_LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
