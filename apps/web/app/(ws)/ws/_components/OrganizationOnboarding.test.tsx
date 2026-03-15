import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { useRouter, redirect } = vi.hoisted(() => ({
  useRouter: vi.fn(() => ({
    refresh: vi.fn(),
    replace: vi.fn(),
  })),
  redirect: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter,
  redirect,
}));

import OrganizationOnboarding from "./OrganizationOnboarding";

describe("OrganizationOnboarding", () => {
  beforeEach(() => {
    useRouter.mockClear();
    redirect.mockClear();
  });

  it("renders incoming invites when they exist", () => {
    const markup = renderToStaticMarkup(
      <OrganizationOnboarding
        user={{ name: "Ahmed", email: "ahmed@example.com" }}
        suggestedOrganizationType="broker"
        audience="broker"
        incomingInvites={[
          {
            id: "invite-1",
            token: "token-1",
            email: "member@example.com",
            role: "member",
            organizationName: "Broker Org",
            organizationType: "broker",
            inviterName: "Owner",
            inviterAuthUserId: "auth-1",
            canMessage: true,
            expiresAt: Date.now(),
          },
        ]}
      />
    );

    expect(markup).toContain("دعوات الانضمام");
    expect(markup).toContain("Broker Org");
    expect(markup).toContain("قبول الدعوة");
  });

  it("renders only create-org UI when no invites exist", () => {
    const markup = renderToStaticMarkup(
      <OrganizationOnboarding
        user={{ name: "Ahmed", email: "ahmed@example.com" }}
        suggestedOrganizationType="broker"
        audience="broker"
        incomingInvites={[]}
      />
    );

    expect(markup).not.toContain("دعوات الانضمام");
    expect(markup).toContain("اسم الجهة");
    expect(markup).toContain("إنشاء الجهة الآن");
  });
});
