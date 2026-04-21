import { describe, expect, it, vi } from "vitest";

vi.mock("expo-file-system", () => ({
  Directory: class {},
  File: class {},
  Paths: {},
}));

vi.mock("react-native", () => ({
  Platform: {
    OS: "web",
  },
}));

describe("mobileBuyerAccount locale normalization", () => {
  it("preserves English when stored preferences use en", async () => {
    const { normalizeBuyerLocalState } = await import("@/lib/mobileBuyerAccount");
    const state = normalizeBuyerLocalState({
      preferences: {
        locale: "en",
        financeDefaults: {
          downPaymentPercent: 20,
          preferredYears: 25,
          annualRate: 5.1,
        },
      },
    });

    expect(state.preferences.locale).toBe("en");
    expect(state.preferences.financeDefaults).toEqual({
      downPaymentPercent: 20,
      preferredYears: 25,
      annualRate: 5.1,
    });
  });

  it("defaults missing locale values to Arabic", async () => {
    const { normalizeBuyerLocalState } = await import("@/lib/mobileBuyerAccount");
    const state = normalizeBuyerLocalState({
      preferences: {
        financeDefaults: {
          downPaymentPercent: 15,
        },
      },
    });

    expect(state.preferences.locale).toBe("ar");
    expect(state.preferences.financeDefaults.preferredYears).toBe(20);
  });

  it("migrates legacy French locale values back to Arabic", async () => {
    const { normalizeBuyerLocalState } = await import("@/lib/mobileBuyerAccount");
    const state = normalizeBuyerLocalState({
      preferences: {
        locale: "fr",
      },
    });

    expect(state.preferences.locale).toBe("ar");
  });
});
