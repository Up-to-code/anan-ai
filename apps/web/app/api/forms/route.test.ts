import { beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { createPublicFormSubmission } = vi.hoisted(() => ({
  createPublicFormSubmission: vi.fn(),
}));

vi.mock("@/server/domains/forms/service", () => ({
  createPublicFormSubmission,
}));

import { POST } from "./route";

beforeEach(() => {
  createPublicFormSubmission.mockReset();
});

it("accepts a valid early-access submission", async () => {
  createPublicFormSubmission.mockResolvedValue({ id: "submission-1" });

  const response = await POST(
    new NextRequest("http://localhost/api/forms", {
      method: "POST",
      body: JSON.stringify({
        formName: "early-access",
        data: {
          name: "Ahmed Mansour",
          type: "investor",
          phone: "+966 55 111 2222",
          email: "ahmed@example.com",
        },
      }),
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "203.0.113.10, 198.51.100.2",
        "user-agent": "vitest",
      },
    }),
  );

  expect(response.status).toBe(201);
  expect(createPublicFormSubmission).toHaveBeenCalledWith({
    formName: "early-access",
    data: {
      name: "Ahmed Mansour",
      type: "investor",
      phone: "+966 55 111 2222",
      email: "ahmed@example.com",
    },
    sourceIp: "203.0.113.10",
    userAgent: "vitest",
  });
  await expect(response.json()).resolves.toEqual({ id: "submission-1" });
});

it("returns INVALID_ARGUMENT for invalid payloads", async () => {
  const response = await POST(
    new NextRequest("http://localhost/api/forms", {
      method: "POST",
      body: JSON.stringify({
        formName: "early-access",
        data: {
          name: " ",
          type: "investor",
          phone: "123",
        },
      }),
      headers: { "content-type": "application/json" },
    }),
  );

  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toMatchObject({
    code: "INVALID_ARGUMENT",
    status: 400,
  });
});

it("maps rate limit errors to 429", async () => {
  createPublicFormSubmission.mockRejectedValue({
    data: {
      code: "RATE_LIMITED",
      message: "Too many requests",
    },
  });

  const response = await POST(
    new NextRequest("http://localhost/api/forms", {
      method: "POST",
      body: JSON.stringify({
        formName: "early-access",
        data: {
          name: "Ahmed Mansour",
          type: "investor",
          phone: "+966 55 111 2222",
        },
      }),
      headers: { "content-type": "application/json" },
    }),
  );

  expect(response.status).toBe(429);
  await expect(response.json()).resolves.toMatchObject({
    code: "RATE_LIMITED",
    status: 429,
  });
});
