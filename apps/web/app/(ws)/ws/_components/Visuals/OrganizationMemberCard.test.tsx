import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import OrganizationMemberCard from "./OrganizationMemberCard";

describe("OrganizationMemberCard", () => {
  it("renders broker member role, email, and active status", () => {
    const markup = renderToStaticMarkup(
      <OrganizationMemberCard
        organizationType="broker"
        member={{
          id: "member-1",
          authUserId: "auth-1",
          membershipId: "membership-1",
          name: "سارة العتيبي",
          email: "sara@example.com",
          role: "manager",
          statusLabel: "نشط",
        }}
      />,
    );

    expect(markup).toContain("سارة العتيبي");
    expect(markup).toContain("sara@example.com");
    expect(markup).toContain("مدير");
    expect(markup).toContain("فريق الوساطة");
    expect(markup).toContain("نشط");
    expect(markup).toContain("border-l-blue-500");
  });

  it("renders developer member context with initials fallback", () => {
    const markup = renderToStaticMarkup(
      <OrganizationMemberCard
        organizationType="red"
        member={{
          id: "member-2",
          authUserId: "auth-2",
          membershipId: "membership-2",
          name: "شركة الواحة",
          email: "team@oasis.dev",
          role: "viewer",
          statusLabel: "قيد التفعيل",
        }}
      />,
    );

    expect(markup).toContain("شركة الواحة");
    expect(markup).toContain("team@oasis.dev");
    expect(markup).toContain("مشاهد");
    expect(markup).toContain("فريق التطوير");
    expect(markup).toContain("ش");
    expect(markup).toContain("border-l-indigo-500");
  });

  it("renders optional footer actions", () => {
    const markup = renderToStaticMarkup(
      <OrganizationMemberCard
        organizationType="broker"
        member={{
          id: "member-3",
          authUserId: "auth-3",
          membershipId: "membership-3",
          name: "أحمد علي",
          email: "ahmed@example.com",
          role: "member",
          statusLabel: "نشط",
          username: "ahmed",
        }}
        footer={<div>MEMBER-ACTIONS</div>}
      />,
    );

    expect(markup).toContain("MEMBER-ACTIONS");
    expect(markup).toContain("@ahmed");
    expect(markup).toContain("عضو");
  });
});
