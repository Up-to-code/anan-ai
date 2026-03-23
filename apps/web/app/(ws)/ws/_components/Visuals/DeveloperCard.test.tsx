import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import DeveloperCard from "./DeveloperCard";

describe("DeveloperCard", () => {
  it("renders developer name, group name, and badge", () => {
    const markup = renderToStaticMarkup(
      <DeveloperCard
        developer={{
          id: "dev-1",
          name: "شركة دار الأركان",
          avatarLabel: "د",
          groupName: "مجموعة دار الأركان العقارية",
          location: "الرياض",
          projectCount: 12,
        }}
      />,
    );

    expect(markup).toContain("شركة دار الأركان");
    expect(markup).toContain("مجموعة دار الأركان العقارية");
    expect(markup).toContain("مطور");
    expect(markup).toContain("الرياض");
    expect(markup).toContain("12 مشروع");
  });

  it("renders with avatar image fallback", () => {
    const markup = renderToStaticMarkup(
      <DeveloperCard
        developer={{
          id: "dev-2",
          name: "مؤسسة البناء الذكي",
          avatarLabel: "م",
        }}
      />,
    );

    expect(markup).toContain("مؤسسة البناء الذكي");
    expect(markup).toContain("م"); // fallback initial
    expect(markup).toContain("مطور عقاري");
  });
});
