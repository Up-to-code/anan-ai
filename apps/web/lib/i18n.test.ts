import { describe, expect, it } from "vitest";
import { getWebDictionary } from "./i18n";

describe("web dictionary coverage", () => {
  it("provides the shared shell copy for Arabic, English, and French", () => {
    for (const locale of ["ar", "en", "fr"] as const) {
      const dictionary = getWebDictionary(locale);

      expect(dictionary.nav.switchLanguage.length).toBeGreaterThan(0);
      expect(dictionary.nav.recentThreads.length).toBeGreaterThan(0);
      expect(dictionary.footer.brandTitle.length).toBeGreaterThan(0);
      expect(dictionary.signin.title.length).toBeGreaterThan(0);
      expect(dictionary.errors.workspaceErrorTitle.length).toBeGreaterThan(0);
      expect(dictionary.settings.verificationTitle.length).toBeGreaterThan(0);
      expect(dictionary.settings.organizationSettingsTitle.length).toBeGreaterThan(0);
      expect(dictionary.assistant.voiceTitle.length).toBeGreaterThan(0);
      expect(dictionary.about.title.length).toBeGreaterThan(0);
    }
  });
});
