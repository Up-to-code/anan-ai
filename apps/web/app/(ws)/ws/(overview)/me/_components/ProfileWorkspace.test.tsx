import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { WebLocaleProvider } from "@/app/_components/WebLocaleProvider";
import { getWebDictionary } from "@/lib/i18n";

import ProfileWorkspace from "./ProfileWorkspace";

it("renders the localized account form without the removed security panel", () => {
  const markup = renderToStaticMarkup(
    <WebLocaleProvider locale="en" dictionary={getWebDictionary("en")}>
      <ProfileWorkspace
        initialProfile={{
          email: "ahmed@example.com",
          name: "Ahmed Mansour",
          username: "ensitcod",
          role: "broker",
          showInOffersDirectory: true,
          isActive: true,
          authProvider: {
            id: "google",
            passwordManaged: false,
          },
        }}
        fallbackName="Ahmed Mansour"
        fallbackEmail="ahmed@example.com"
        onSave={async () => ({ ok: true, message: "saved" })}
      />
    </WebLocaleProvider>,
  );

  expect(markup).toContain("Account details");
  expect(markup).toContain("Current role");
  expect(markup).toContain("Show account in offers directory");
  expect(markup).not.toContain("Security center");
  expect(markup).not.toContain("/ws/settings?tab=apps");
});
