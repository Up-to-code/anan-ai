import { NextRequest } from "next/server";
import { DomainError, toErrorResponse } from "@/server/contracts/errors";
import { toInvalidJsonResponse } from "@/app/api/_shared/errors";
import { createContactInquiryInputSchema } from "@/server/contracts/contact";
import { createContactInquiry } from "@/server/domains/public/contact/service";

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    return first || undefined;
  }

  return request.headers.get("x-real-ip")?.trim() || undefined;
}

/**
 * WHY:   Public `/contact` needs a backend ingress that stays thin and delegates to the server layer.
 * WHAT:  Accepts a contact inquiry payload and persists it to the platform store.
 * HOW:   Validates JSON with the shared contract schema, passes request metadata, and normalizes errors.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createContactInquiryInputSchema.safeParse(body);
    if (!parsed.success) {
      throw new DomainError({
        code: "INVALID_ARGUMENT",
        message: parsed.error.issues[0]?.message ?? "Invalid contact inquiry payload",
        status: 400,
      });
    }

    const result = await createContactInquiry({
      ...parsed.data,
      sourceIp: getClientIp(request),
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    return Response.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return toInvalidJsonResponse();
    }
    return toErrorResponse(error);
  }
}

