import { fetchMutation } from "convex/nextjs";
import { NextResponse, type NextRequest } from "next/server";
import { apiUnsafe } from "@/lib/convexApi";

const adminSignupApi = apiUnsafe["admin_zone/adminSignup"] as {
  validateAdminSignup: unknown;
  completeAdminSignup: unknown;
};

function readBridgeSecret() {
  const secret = process.env.ADMIN_SIGNUP_BRIDGE_SECRET?.trim();
  if (!secret) {
    throw new Error("ADMIN_SIGNUP_BRIDGE_SECRET is not configured.");
  }
  return secret;
}

function copySetCookie(source: Response, target: NextResponse) {
  const getSetCookie = (source.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
  const cookies = typeof getSetCookie === "function"
    ? getSetCookie.call(source.headers)
    : [source.headers.get("set-cookie")].filter((value): value is string => Boolean(value));
  for (const cookie of cookies) {
    target.headers.append("set-cookie", cookie);
  }
}

async function callBetterAuth(request: NextRequest, path: "sign-up" | "sign-in", body: Record<string, unknown>) {
  return fetch(new URL(`/api/auth/${path}/email`, request.nextUrl.origin), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-anan-admin-signup-secret": readBridgeSecret(),
      cookie: request.headers.get("cookie") ?? "",
    },
    body: JSON.stringify(body),
  });
}

function isExistingAccountError(status: number, body: unknown) {
  return status === 409 || JSON.stringify(body).toLowerCase().includes("already");
}

/**
 * WHY:   Admin signup must be invite-gated without exposing Better Auth public registration.
 * WHAT:  Validates a token/secret, creates or signs in the Better Auth password account, and grants admin metadata.
 * HOW:   Calls the local Better Auth bridge with a server-only header, then forwards auth cookies to the browser.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const name = typeof body.name === "string" ? body.name.trim() : undefined;
    const token = typeof body.token === "string" ? body.token.trim() : undefined;
    const bootstrapSecret = typeof body.bootstrapSecret === "string" ? body.bootstrapSecret.trim() : undefined;

    const invite = await fetchMutation(adminSignupApi.validateAdminSignup as never, {
      email,
      token,
      bootstrapSecret,
    } as never);
    const authBody = {
      email,
      password,
      name: name || (invite as { name?: string }).name || email.split("@")[0],
    };
    let authResponse = await callBetterAuth(request, "sign-up", authBody);
    let authPayload = await authResponse.json().catch(() => ({}));

    if (!authResponse.ok && isExistingAccountError(authResponse.status, authPayload)) {
      authResponse = await callBetterAuth(request, "sign-in", { email, password, rememberMe: true });
      authPayload = await authResponse.json().catch(() => ({}));
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

    await fetchMutation(adminSignupApi.completeAdminSignup as never, {
      email,
      name: authBody.name,
      authUserId,
      token,
      bootstrapSecret,
    } as never);

    const response = NextResponse.json({ ok: true, redirectTo: "/overview" });
    copySetCookie(authResponse, response);
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
