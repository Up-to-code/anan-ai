import { NextRequest } from "next/server";
import { DomainError, toErrorResponse } from "@/server/contracts/errors";
import { toInvalidJsonResponse } from "@/app/api/_shared/errors";
import { submitPublicFormInputSchema } from "@/server/contracts/forms";
import { createPublicFormSubmission } from "@/server/domains/public/forms/service";

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    return first || undefined;
  }

  return request.headers.get("x-real-ip")?.trim() || undefined;
}

/**
 * WHY:   Public marketing forms need a safe server ingress (validation + abuse controls).
 * WHAT:  Accepts a validated form submission payload and persists it to the platform store.
 * HOW:   Validates JSON with the shared contract schema, passes request metadata, and normalizes errors.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = submitPublicFormInputSchema.safeParse(body);
    if (!parsed.success) {
      throw new DomainError({
        code: "INVALID_ARGUMENT",
        message: parsed.error.issues[0]?.message ?? "Invalid form payload",
        status: 400,
      });
    }

    const result = await createPublicFormSubmission({
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

