import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import OrganizationOnboardingJourney from "./OrganizationOnboardingJourney";

const { useRouter } = vi.hoisted(() => ({
  useRouter: vi.fn(() => ({
    refresh: vi.fn(),
    replace: vi.fn(),
  })),
}));
const { useAuthActions } = vi.hoisted(() => ({
  useAuthActions: vi.fn(() => ({
    signOut: vi.fn(),
  })),
}));

vi.mock("next/navigation", () => ({
  useRouter,
}));

vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions,
}));

beforeEach(() => {
  useRouter.mockClear();
});

it("renders the stepper and the first step content", () => {
  const markup = renderToStaticMarkup(
    <OrganizationOnboardingJourney
      user={{ name: "Ahmed", email: "ahmed@example.com" }}
      suggestedOrganizationType="broker"
      audience="broker"
      incomingInvites={[]}
      canCreateOrganization
      brokerRuleset={null}
      redRuleset={null}
    />,
  );

  expect(markup).toContain("الدعوات والمسار");
  expect(markup).toContain("بيانات الجهة");
  expect(markup).toContain("التوثيق والمستندات");
  expect(markup).toContain("إنشاء جهة جديدة");
  expect(markup).toContain("تسجيل الخروج");
});

it("shows the create-org warning when creation is disabled", () => {
  const markup = renderToStaticMarkup(
    <OrganizationOnboardingJourney
      user={{ name: "Ahmed", email: "ahmed@example.com" }}
      suggestedOrganizationType="broker"
      audience="broker"
      incomingInvites={[]}
      canCreateOrganization={false}
      brokerRuleset={null}
      redRuleset={null}
    />,
  );

  expect(markup).toContain("لا يمكن إنشاء جهة جديدة");
  expect(markup).toContain("تسجيل الخروج");
});

it("renders the first step when initial step is details but creation is disabled", () => {
  const markup = renderToStaticMarkup(
    <OrganizationOnboardingJourney
      user={{ name: "Ahmed", email: "ahmed@example.com" }}
      suggestedOrganizationType="broker"
      audience="broker"
      incomingInvites={[]}
      canCreateOrganization={false}
      initialStep={2}
      brokerRuleset={null}
      redRuleset={null}
    />,
  );

  expect(markup).toContain("الدعوات والمسار");
  expect(markup).not.toContain("مثال: مؤسسة عنان العقارية");
  expect(markup).toContain("لا يمكن إنشاء جهة جديدة");
});
