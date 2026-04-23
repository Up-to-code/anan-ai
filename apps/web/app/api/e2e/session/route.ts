import { NextRequest, NextResponse } from "next/server";
import {
  appendSetCookies,
  ensureE2ERequest,
  getSetCookies,
  listConfiguredPersonas,
  readPersona,
} from "../_shared";

type SessionRequestBody = {
  persona?: string;
  namespace?: string;
  redirectTo?: string;
};

function getOrigin(request: NextRequest) {
  return request.nextUrl.origin;
}

async function readBody(request: NextRequest): Promise<SessionRequestBody> {
  return (await request.json().catch(() => ({}))) as SessionRequestBody;
}

async function signInPersona(request: NextRequest, body: SessionRequestBody) {
  const persona = readPersona(body.persona ?? "");
  if (!persona) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          ok: false,
          message: "Unknown or unconfigured E2E persona.",
          personas: listConfiguredPersonas(),
        },
        { status: 400 },
      ),
    };
  }

  const signInResponse = await fetch(`${getOrigin(request)}/api/auth/sign-in/email`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      email: persona.email,
      password: persona.password,
      rememberMe: true,
    }),
  });

  const responseBody = await signInResponse.json().catch(() => null);
  if (!signInResponse.ok) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          ok: false,
          persona: persona.id,
          message: responseBody?.message ?? responseBody?.error?.message ?? "E2E persona sign-in failed.",
        },
        { status: signInResponse.status },
      ),
    };
  }

  return {
    ok: true as const,
    persona,
    cookies: getSetCookies(signInResponse, request),
  };
}

/**
 * WHY:   Browser E2E runners need reliable auth without automating social sign-in.
 * WHAT:  Signs in one pre-seeded Better Auth persona and returns Playwright-compatible storage cookies.
 * HOW:   Guards on non-production E2E env vars, calls the existing email sign-in route, and forwards auth cookies.
 */
export async function POST(request: NextRequest) {
  const blocked = ensureE2ERequest(request);
  if (blocked) return blocked;

  const body = await readBody(request);
  const signedIn = await signInPersona(request, body);
  if (!signedIn.ok) return signedIn.response;

  const response = NextResponse.json({
    ok: true,
    persona: signedIn.persona.id,
    namespace: body.namespace ?? null,
    storageState: {
      cookies: signedIn.cookies.map((cookie) => cookie.parsed),
      origins: [],
    },
  });
  appendSetCookies(response, signedIn.cookies);
  return response;
}

/**
 * WHY:   Maestro web flows cannot attach custom POST headers before the first page load.
 * WHAT:  Signs in a seeded persona from a guarded URL and redirects into the requested workspace route.
 * HOW:   Reuses the POST bootstrap path, accepts the shared secret only in non-production E2E mode, and forwards cookies.
 */
export async function GET(request: NextRequest) {
  const blocked = ensureE2ERequest(request);
  if (blocked) return blocked;

  const redirectTo = request.nextUrl.searchParams.get("redirectTo") ?? "/ws";
  const safeRedirectTo = redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/ws";
  const signedIn = await signInPersona(request, {
    persona: request.nextUrl.searchParams.get("persona") ?? "",
    namespace: request.nextUrl.searchParams.get("namespace") ?? undefined,
    redirectTo: safeRedirectTo,
  });
  if (!signedIn.ok) return signedIn.response;

  const response = NextResponse.redirect(new URL(safeRedirectTo, request.nextUrl.origin));
  appendSetCookies(response, signedIn.cookies);
  return response;
}
