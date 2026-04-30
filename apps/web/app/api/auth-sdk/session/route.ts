import { createSessionResponse, resolveAuthSession } from "@anan/auth-sdk/server";
import { getOptionalSessionContext } from "@/server/auth/session";
import { toErrorResponse } from "@/server/contracts/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const resolved = await getOptionalSessionContext();
    return createSessionResponse(
      resolved ? resolveAuthSession({ token: resolved.token, session: resolved.context }) : null,
      { includeAccessToken: true },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
