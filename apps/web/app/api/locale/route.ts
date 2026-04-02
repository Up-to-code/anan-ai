import { NextResponse } from "next/server";
import { WEB_LOCALE_COOKIE, WORKSPACE_LOCALE_COOKIE, resolveLocale } from "@/lib/locale";

export async function POST(request: Request) {
  const payload = (await request.json()) as { locale?: string; scope?: string };
  const locale = resolveLocale(payload.locale);
  const cookieName = payload.scope === "workspace" ? WORKSPACE_LOCALE_COOKIE : WEB_LOCALE_COOKIE;
  const response = NextResponse.json({ locale });
  response.cookies.set(cookieName, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
