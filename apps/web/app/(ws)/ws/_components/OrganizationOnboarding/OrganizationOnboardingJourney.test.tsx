import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OrganizationOnboardingJourney from "./OrganizationOnboardingJourney";

const { useRouter } = vi.hoisted(() => ({
  useRouter: vi.fn(() => ({
    refresh: vi.fn(),
    replace: vi.fn(),
  })),
}));

vi.mock("next/navigation", () => ({
  useRouter,
}));

describe("OrganizationOnboardingJourney", () => {
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
        brokerRuleset={null}
        redRuleset={null}
      />,
    );

    expect(markup).toContain("الدعوات والمسار");
    expect(markup).toContain("بيانات الجهة");
    expect(markup).toContain("التوثيق والمستندات");
    expect(markup).toContain("إنشاء جهة جديدة");
  });
});
