import { beforeEach, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const { createVerificationRequestForCurrentOrg } = vi.hoisted(() => ({
  createVerificationRequestForCurrentOrg: vi.fn(),
}));

vi.mock("@/server/domains/workspace/verifications/service", () => ({
  createVerificationRequestForCurrentOrg,
}));

import { POST } from "./route";

beforeEach(() => {
  createVerificationRequestForCurrentOrg.mockReset();
});

it("creates a verification request", async () => {
  createVerificationRequestForCurrentOrg.mockResolvedValue({ requestId: "request-1" });

  const response = await POST(
    new Request("http://localhost/api/verification-requests", {
      method: "POST",
      body: JSON.stringify({
        documents: [{ key: "doc-1", url: "https://files.test/doc.pdf", name: "doc.pdf" }],
      }),
      headers: { "Content-Type": "application/json" },
    }),
  );

  expect(response.status).toBe(201);
  await expect(response.json()).resolves.toEqual({ requestId: "request-1" });
});

it("returns a stable invalid-json error", async () => {
  const response = await POST(
    new Request("http://localhost/api/verification-requests", {
      method: "POST",
      body: "{",
      headers: { "Content-Type": "application/json" },
    }),
  );

  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toEqual({
    code: "INVALID_REQUEST",
    message: "Request body must be valid JSON",
    status: 400,
  });
});

it("serializes manager-only failures", async () => {
  createVerificationRequestForCurrentOrg.mockRejectedValue(
    new DomainError({
      code: "FORBIDDEN",
      message: "Manager role required",
      status: 403,
    }),
  );

  const response = await POST(
    new Request("http://localhost/api/verification-requests", {
      method: "POST",
      body: JSON.stringify({
        documents: [{ key: "doc-1", url: "https://files.test/doc.pdf", name: "doc.pdf" }],
      }),
      headers: { "Content-Type": "application/json" },
    }),
  );

  expect(response.status).toBe(403);
  await expect(response.json()).resolves.toEqual({
    code: "FORBIDDEN",
    message: "Manager role required",
    status: 403,
  });
});
