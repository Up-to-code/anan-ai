import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "./route";

function createPostRequest(body: unknown, secret = "secret") {
  return new NextRequest("http://localhost:3000/api/e2e/session", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify(body),
  });
}

function createRawPostRequest(body: string, secret = "secret") {
  return new NextRequest("http://localhost:3000/api/e2e/session", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${secret}`,
    },
    body,
  });
}

function createGetRequest(searchParams: Record<string, string>, secret = "secret") {
  const url = new URL("http://localhost:3000/api/e2e/session");
  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url, {
    headers: {
      authorization: `Bearer ${secret}`,
    },
  });
}

function stubE2EEnv() {
  vi.stubEnv("E2E_TEST_MODE", "true");
  vi.stubEnv("E2E_SHARED_SECRET", "secret");
  vi.stubEnv("E2E_PERSONA_BROKER_MANAGER_EMAIL", "broker@example.test");
  vi.stubEnv("E2E_PERSONA_BROKER_MANAGER_PASSWORD", "password-1");
}

function stubSuccessfulSignIn() {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "set-cookie": "better-auth.session_token=abc123; Path=/; HttpOnly; SameSite=Lax",
    },
  }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("POST /api/e2e/session", () => {
  it("rejects calls when E2E mode is disabled", async () => {
    vi.stubEnv("E2E_TEST_MODE", "false");
    vi.stubEnv("E2E_SHARED_SECRET", "secret");

    const response = await POST(createPostRequest({ persona: "broker-manager" }));

    expect(response.status).toBe(404);
  });

  it("rejects unknown personas before hitting auth", async () => {
    vi.stubEnv("E2E_TEST_MODE", "true");
    vi.stubEnv("E2E_SHARED_SECRET", "secret");

    const response = await POST(createPostRequest({ persona: "missing" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
  });

  it("rejects malformed JSON instead of treating it as an empty request", async () => {
    stubE2EEnv();

    const response = await POST(createRawPostRequest("{"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      ok: false,
      message: "Request body must be valid JSON.",
    });
  });

  it("signs in a configured persona and returns Playwright storage cookies", async () => {
    stubE2EEnv();
    const fetchMock = stubSuccessfulSignIn();

    const response = await POST(createPostRequest({
      persona: "broker-manager",
      namespace: "e2e-playwright-session",
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      persona: "broker-manager",
      namespace: "e2e-playwright-session",
      storageState: {
        cookies: [
          expect.objectContaining({
            name: "better-auth.session_token",
            value: "abc123",
            domain: "localhost",
            path: "/",
            httpOnly: true,
            sameSite: "Lax",
          }),
        ],
        origins: [],
      },
    });
    expect(response.headers.get("set-cookie")).toContain("better-auth.session_token=abc123");
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3000/api/auth/sign-in/email", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        email: "broker@example.test",
        password: "password-1",
        rememberMe: true,
      }),
    }));
  });

  it("surfaces persona sign-in failures without returning cookies", async () => {
    stubE2EEnv();
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ message: "Invalid password" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    })));

    const response = await POST(createPostRequest({ persona: "broker-manager" }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({
      ok: false,
      persona: "broker-manager",
      message: "Invalid password",
    });
  });
});

describe("GET /api/e2e/session", () => {
  it("redirects to a safe in-app route after Maestro-style bootstrap", async () => {
    stubE2EEnv();
    stubSuccessfulSignIn();

    const response = await GET(createGetRequest({
      persona: "broker-manager",
      redirectTo: "/ws/projects",
    }));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/ws/projects");
    expect(response.headers.get("set-cookie")).toContain("better-auth.session_token=abc123");
  });

  it("falls back to /ws when redirectTo is external or protocol-relative", async () => {
    stubE2EEnv();
    stubSuccessfulSignIn();

    const response = await GET(createGetRequest({
      persona: "broker-manager",
      redirectTo: "//evil.example/phish",
    }));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/ws");
  });
});
