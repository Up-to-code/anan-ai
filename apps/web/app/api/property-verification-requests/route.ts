import { createdResponse, handleRoute, readJsonBody } from "@anan/web-foundation/api";
import { createPropertyVerificationRequestForCurrentOrg } from "@/server/domains/workspace/verifications/service";

/**
 * WHY:   Property verification requests should submit through a dedicated gateway route.
 * WHAT:  Accepts property verification payloads and creates a verification request.
 * HOW:   Parses JSON, delegates to the domain service, and returns a 201 response on success.
 */
export async function POST(request: Request) {
  return handleRoute(async () => {
    const body = await readJsonBody(request);
    const result = await createPropertyVerificationRequestForCurrentOrg(body);
    return createdResponse(result);
  });
}
