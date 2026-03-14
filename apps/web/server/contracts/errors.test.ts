import { describe, expect, it } from "vitest";
import { normalizeDomainError } from "./errors";

describe("normalizeDomainError", () => {
  it("maps role and verification errors to 403", () => {
    const error = normalizeDomainError({
      data: {
        code: "VERIFICATION_REQUIRED",
        message: "Verification needed",
      },
    });

    expect(error.status).toBe(403);
    expect(error.code).toBe("VERIFICATION_REQUIRED");
  });

  it("maps invite expiry to 410", () => {
    const error = normalizeDomainError({
      data: {
        code: "INVITE_EXPIRED",
        message: "Invite has expired",
      },
    });

    expect(error.status).toBe(410);
  });
});
