import { NextRequest, NextResponse } from "next/server";
import { e2eJsonBodyErrorResponse, ensureE2ERequest, readE2EJsonBody } from "../_shared";

type CleanupRequestBody = {
  namespace?: string;
};

function isSafeNamespace(value: unknown) {
  return typeof value === "string" && /^e2e-[a-z0-9-]{6,80}$/u.test(value);
}

/**
 * WHY:   E2E mutation suites need one guarded cleanup coordination point.
 * WHAT:  Validates an E2E namespace and returns the cleanup contract used by Playwright and Maestro.
 * HOW:   Keeps the route non-production and explicit; backend record deletion can be attached here when a Convex cleanup mutation is added.
 */
export async function POST(request: NextRequest) {
  const blocked = ensureE2ERequest(request);
  if (blocked) return blocked;

  let body: CleanupRequestBody;
  try {
    body = await readE2EJsonBody<CleanupRequestBody>(request);
  } catch (error) {
    return e2eJsonBodyErrorResponse(error) ?? NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }
  if (!isSafeNamespace(body.namespace)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Cleanup requires an e2e-* namespace.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    namespace: body.namespace,
    cleaned: false,
    message: "Cleanup contract accepted. No destructive backend cleanup mutation is wired yet.",
  });
}
