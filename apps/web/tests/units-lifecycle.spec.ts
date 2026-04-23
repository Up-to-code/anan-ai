import { expect, test } from "@playwright/test";
import { createE2ENamespace, newPersonaPage } from "./e2e-support";

test("unit lifecycle creates a standalone unit from the create selector", async ({ browser }) => {
  const namespace = createE2ENamespace("unit");
  const title = `${namespace} وحدة`;
  const { context, page } = await newPersonaPage(browser, "developer-manager");

  await page.goto("/ws/projects/create");
  await page.getByTestId("create-inventory-option-unit").click();
  await page.getByTestId("create-inventory-continue").click();
  await expect(page).toHaveURL(/\/ws\/projects\/create\/unit$/);

  await page.getByTestId("unit-name-input").fill(title);
  await page.getByTestId("unit-location-input").fill("الرياض، الملقا");
  await page.getByTestId("unit-description-input").fill("وصف تجريبي لوحدة مستقلة ضمن اختبار شامل.");
  await page.getByTestId("creation-flow-next").click();
  await page.getByTestId("unit-area-input").fill("120");
  await page.getByTestId("creation-flow-next").click();
  await page.getByTestId("unit-price-input").fill("950000");
  await page.getByTestId("creation-flow-next").click();
  await page.getByTestId("creation-flow-next").click();
  await page.getByTestId("creation-flow-save").click();
  await expect(page).toHaveURL(/\/ws\/projects\/[^/]+$/);
  await expect(page.getByText(title)).toBeVisible();

  await page.getByTestId("project-detail-delete").click();
  await page.getByTestId("delete-confirm-submit").click();
  await expect(page).toHaveURL(/\/ws\/projects$/);
  await context.close();
});
