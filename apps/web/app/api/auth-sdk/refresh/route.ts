import {
  assertCsrfRequest,
  createSessionResponse,
  resolveAuthSession,
} from "@anan/auth-sdk/server";
import { getOptionalSessionContext } from "@/server/auth/session";
import { toErrorResponse } from "@/server/contracts/errors";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    assertCsrfRequest(request);
    const resolved = await getOptionalSessionContext();
    return createSessionResponse(
      resolved ? resolveAuthSession({ token: resolved.token, session: resolved.context }) : null,
      { includeAccessToken: true },
    );
  } catch (error) {
    if (error && typeof error === "object" && "status" in error && "message" in error) {
      return Response.json(
        { error: "AUTH_SDK_REFRESH_FAILED", message: String(error.message) },
        { status: typeof error.status === "number" ? error.status : 400 },
      );
    }
    return toErrorResponse(error);
  }
}
