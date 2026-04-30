import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

function createRequest(body: unknown, headers: Record<string, string> = { authorization: "Bearer secret" }) {
  return new NextRequest("http://localhost:3000/api/e2e/cleanup", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

function createRawRequest(body: string, headers: Record<string, string> = { authorization: "Bearer secret" }) {
  return new NextRequest("http://localhost:3000/api/e2e/cleanup", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body,
  });
}

function stubE2EEnv() {
  vi.stubEnv("E2E_TEST_MODE", "true");
  vi.stubEnv("E2E_SHARED_SECRET", "secret");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("POST /api/e2e/cleanup", () => {
  it("requires a safe namespace", async () => {
    stubE2EEnv();

    const response = await POST(createRequest({ namespace: "production" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      ok: false,
      message: "Cleanup requires an e2e-* namespace.",
    });
  });

  it("accepts e2e namespaces behind the shared secret", async () => {
    stubE2EEnv();

    const response = await POST(createRequest({ namespace: "e2e-playwright-abc123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
  });

  it("rejects malformed JSON instead of silently falling back to an empty body", async () => {
    stubE2EEnv();

    const response = await POST(createRawRequest("{"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      ok: false,
      message: "Request body must be valid JSON.",
    });
  });

  it("rejects requests with a missing or invalid shared secret", async () => {
    stubE2EEnv();

    const response = await POST(createRequest(
      { namespace: "e2e-playwright-abc123" },
      { authorization: "Bearer wrong" },
    ));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body).toEqual({
      ok: false,
      message: "Invalid E2E shared secret.",
    });
  });

  it("accepts the shared secret from an Authorization bearer header", async () => {
    stubE2EEnv();

    const response = await POST(createRequest(
      { namespace: "e2e-maestro-abc123" },
      { authorization: "Bearer secret" },
    ));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      ok: true,
      namespace: "e2e-maestro-abc123",
      cleaned: false,
    });
  });
});
