import { expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const { convexAuthNextjsToken } = vi.hoisted(() => ({
  convexAuthNextjsToken: vi.fn(),
}));

vi.mock("@convex-dev/auth/nextjs/server", () => ({
  convexAuthNextjsToken,
}));

import { getOptionalSessionContext } from "./session";

function createJwtWithExp(expSeconds: number) {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ exp: expSeconds })).toString("base64url");
  return `${header}.${payload}.signature`;
}

it("treats clearly expired NoAuthProvider tokens as logged out", async () => {
  const expiredToken = createJwtWithExp(Math.floor((Date.now() - (60 * 1000)) / 1000));
  const dependencies = {
    getToken: vi.fn(async () => expiredToken),
    sessionsRepository: {
      getCurrent: vi.fn(async () => {
        throw new Error(JSON.stringify({
          code: "NoAuthProvider",
          message: "No auth provider found matching the given token",
        }));
      }),
    },
    profilesRepository: {
      getCurrent: vi.fn(async () => null),
    },
  };

  await expect(getOptionalSessionContext(dependencies as never)).resolves.toBeNull();
});

it("surfaces provider mismatches for active tokens as AUTH_CONFIGURATION_ERROR", async () => {
  const activeToken = createJwtWithExp(Math.floor((Date.now() + (60 * 60 * 1000)) / 1000));
  const dependencies = {
    getToken: vi.fn(async () => activeToken),
    sessionsRepository: {
      getCurrent: vi.fn(async () => {
        throw new Error(JSON.stringify({
          code: "NoAuthProvider",
          message: "No auth provider found matching the given token",
        }));
      }),
    },
    profilesRepository: {
      getCurrent: vi.fn(async () => null),
    },
  };

  await expect(getOptionalSessionContext(dependencies as never)).rejects.toMatchObject<Partial<DomainError>>({
    code: "AUTH_CONFIGURATION_ERROR",
    status: 503,
  });
});
