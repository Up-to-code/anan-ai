import { describe, expect, it } from "vitest";
import { resolveCursorCardAppearance } from "@/lib/cursorCardTheme";

function buildTheme(tokens: {
  defaultAmbientBackgroundColor: string;
  surfaceColor: string;
  borderColor: string;
  actionSurfaceColor: string;
  actionBorderColor: string;
  actionTextColor: string;
  frameThickness: number;
  frameOpacity: number;
  outerRadius: number;
  innerRadius: number;
}) {
  return tokens;
}

describe("resolveCursorCardAppearance", () => {
  it("derives edge fade colors from an ambient hex background override", () => {
    const theme = buildTheme({
      defaultAmbientBackgroundColor: "#FFFFFF",
      surfaceColor: "#FFFFFF",
      borderColor: "#E4E4E7",
      actionSurfaceColor: "#F4F4F5",
      actionBorderColor: "#D4D4D8",
      actionTextColor: "#09090B",
      frameThickness: 2,
      frameOpacity: 0.96,
      outerRadius: 24,
      innerRadius: 20,
    });

    const appearance = resolveCursorCardAppearance(theme, "#18181B");

    expect(appearance.ambientBackgroundColor).toBe("#18181B");
    expect(appearance.edgeColor).toBe("rgba(24, 24, 27, 0.96)");
    expect(appearance.transparentEdgeColor).toBe("rgba(24, 24, 27, 0)");
  });

  it("falls back to the theme default ambient color when none is provided", () => {
    const theme = buildTheme({
      defaultAmbientBackgroundColor: "rgba(9, 9, 11, 0.85)",
      surfaceColor: "#18181B",
      borderColor: "#3F3F46",
      actionSurfaceColor: "#27272A",
      actionBorderColor: "#3F3F46",
      actionTextColor: "#FAFAFA",
      frameThickness: 2,
      frameOpacity: 0.94,
      outerRadius: 24,
      innerRadius: 20,
    });

    const appearance = resolveCursorCardAppearance(theme);

    expect(appearance.ambientBackgroundColor).toBe("rgba(9, 9, 11, 0.85)");
    expect(appearance.edgeColor).toBe("rgba(9, 9, 11, 0.94)");
    expect(appearance.frameThickness).toBe(2);
    expect(appearance.outerRadius).toBe(24);
    expect(appearance.innerRadius).toBe(20);
  });
});
