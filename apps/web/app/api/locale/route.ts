import { NextResponse } from "next/server";
import { WEB_LOCALE_COOKIE, resolveLocale } from "@/lib/locale";

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
