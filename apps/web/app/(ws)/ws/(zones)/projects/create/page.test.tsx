import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { WebLocaleProvider } from "@/app/_components/WebLocaleProvider";
import { getWebDictionary } from "@/lib/i18n";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import CreateInventorySelectionPage from "./page";

it("renders localized project and unit creation options with target routes", () => {
  const markup = renderToStaticMarkup(
    <WebLocaleProvider locale="en" dictionary={getWebDictionary("en")}>
      <CreateInventorySelectionPage />
    </WebLocaleProvider>,
  );

  expect(markup).toContain("Choose the asset type you want to add");
  expect(markup).toContain("Full project");
  expect(markup).toContain("Standalone unit");
  expect(markup).toContain("data-href=\"/ws/projects/create/project\"");
  expect(markup).toContain("data-href=\"/ws/projects/create/unit\"");
});
