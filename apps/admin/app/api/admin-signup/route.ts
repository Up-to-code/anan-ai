import { NextResponse, type NextRequest } from "next/server";
import {
  copySetCookieHeaders,
  buildAuthBridgeHeaders,
  isExistingAccountResponse,
  readJsonBody,
  resolveBridgeSecret,
  safeResponseJson,
} from "@anan/web-foundation/api";
import { completeAdminSignup, validateAdminSignupInvite } from "@/server/auth/adminSignup";

function readBridgeSecret() {
  return resolveBridgeSecret(
    [{ header: "x-anan-admin-signup-secret", value: process.env.ADMIN_SIGNUP_BRIDGE_SECRET }],
    "ADMIN_SIGNUP_BRIDGE_SECRET is not configured.",
  ).value;
}

function getBridgeOrigin(request: NextRequest) {
  return process.env.ANAN_WEB_URL?.trim()
    || process.env.SITE_URL?.trim()
    || request.headers.get("origin")
    || request.nextUrl.origin;
}

async function callBetterAuth(request: NextRequest, path: "sign-up" | "sign-in", body: Record<string, unknown>) {
  return fetch(new URL(`/api/auth/${path}/email`, request.nextUrl.origin), {
    method: "POST",
    headers: buildAuthBridgeHeaders({
      bridgeHeader: "x-anan-admin-signup-secret",
      bridgeSecret: readBridgeSecret(),
      cookie: request.headers.get("cookie"),
      origin: getBridgeOrigin(request),
      requestUrl: request.url,
    }),
    body: JSON.stringify(body),
  });
}

/**
 * WHY:   Admin signup must be invite-gated without exposing Better Auth public registration.
 * WHAT:  Validates a token/secret, creates or signs in the Better Auth password account, and grants admin metadata.
 * HOW:   Calls the local Better Auth bridge with a server-only header, then forwards auth cookies to the browser.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody<Record<string, unknown>>(request);
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const name = typeof body.name === "string" ? body.name.trim() : undefined;
    const token = typeof body.token === "string" ? body.token.trim() : undefined;
    const bootstrapSecret = typeof body.bootstrapSecret === "string" ? body.bootstrapSecret.trim() : undefined;

    const invite = await validateAdminSignupInvite({
      email,
      token,
      bootstrapSecret,
    });
    const authBody = {
      email,
      password,
      name: name || (invite as { name?: string }).name || email.split("@")[0],
    };
    let authResponse = await callBetterAuth(request, "sign-up", authBody);
    let authPayload = await safeResponseJson(authResponse, {});

    if (!authResponse.ok && isExistingAccountResponse(authResponse.status, authPayload)) {
      authResponse = await callBetterAuth(request, "sign-in", { email, password, rememberMe: true });
      authPayload = await safeResponseJson(authResponse, {});
    }

    if (!authResponse.ok) {
      return NextResponse.json(
        { error: "ADMIN_SIGNUP_AUTH_FAILED", message: "Could not create or sign in the admin account." },
        { status: authResponse.status },
      );
    }

    const authUserId = (authPayload as { user?: { id?: string } }).user?.id;
    if (!authUserId) {
      return NextResponse.json(
        { error: "ADMIN_SIGNUP_AUTH_FAILED", message: "Auth provider did not return a user id." },
        { status: 502 },
      );
    }

    await completeAdminSignup({
      email,
      name: authBody.name,
      authUserId,
      token,
      bootstrapSecret,
    });

    const response = NextResponse.json({ ok: true, redirectTo: "/overview" });
    copySetCookieHeaders(authResponse, response);
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: "ADMIN_SIGNUP_FAILED",
        message: error instanceof Error ? error.message : "Admin signup failed.",
      },
      { status: 400 },
    );
  }
}
