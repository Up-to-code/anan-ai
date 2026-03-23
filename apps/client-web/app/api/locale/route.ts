import { NextResponse } from "next/server";
import { CLIENT_LOCALE_COOKIE, resolveLocale } from "@/client_zone/i18n/locale";

/**
 * WHY:   The bilingual client app needs a lightweight server endpoint to persist locale choice across routes.
 * WHAT:  Stores the selected locale in a cookie and returns the resolved locale.
 * HOW:   Validates the input against the supported locales and writes a site-wide cookie.
 */
export async function POST(request: Request) {
  const payload = (await request.json()) as { locale?: string };
  const locale = resolveLocale(payload.locale);
  const response = NextResponse.json({ locale });
  response.cookies.set(CLIENT_LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
