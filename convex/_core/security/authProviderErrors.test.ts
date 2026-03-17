import { describe, expect, it } from "vitest";
import {
  isClearlyExpiredJwtToken,
  isNoAuthProviderError,
} from "./authProviderErrors";

function jwtWithExp(expSeconds: number) {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ exp: expSeconds })).toString("base64url");
  return `${header}.${payload}.signature`;
}

describe("auth provider error helpers", () => {
  it("detects Convex NoAuthProvider errors", () => {
    expect(
      isNoAuthProviderError({
        message: JSON.stringify({
          code: "NoAuthProvider",
          message: "No auth provider found matching the given token",
        }),
      }),
    ).toBe(true);
  });

  it("marks JWT tokens as expired using exp", () => {
    const nowMs = Date.now();
    const expired = jwtWithExp(Math.floor((nowMs - (60 * 1000)) / 1000));
    const active = jwtWithExp(Math.floor((nowMs + (60 * 1000)) / 1000));

    expect(isClearlyExpiredJwtToken(expired, nowMs)).toBe(true);
    expect(isClearlyExpiredJwtToken(active, nowMs)).toBe(false);
  });
});

