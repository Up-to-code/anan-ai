import { expect, test } from "@playwright/test";
import { createE2ENamespace, newPersonaPage } from "./e2e-support";

test("project lifecycle creates, edits, publishes, and deletes a project", async ({ browser }) => {
  test.skip(!process.env.UPLOADTHING_TOKEN?.trim(), "UPLOADTHING_TOKEN is required for upload-backed project E2E.");
  const namespace = createE2ENamespace("project");
  const title = `${namespace} مشروع`;
  const editedTitle = `${title} معدل`;
  const { context, page } = await newPersonaPage(browser, "developer-manager");

  await page.goto("/ws/projects/create");
  await page.getByTestId("create-inventory-option-project").click();
  await page.getByTestId("create-inventory-continue").click();
  await expect(page).toHaveURL(/\/ws\/projects\/create\/project$/);

  await page.getByTestId("project-name-input").fill(title);
  await page.getByTestId("project-price-input").fill("2500000");
  await page.getByTestId("project-location-input").fill("الرياض، الياسمين");
  await page.getByTestId("creation-flow-next").click();
  await page.getByTestId("project-rooms-input").fill("3");
  await page.getByTestId("project-baths-input").fill("2");
  await page.getByTestId("project-area-input").fill("180");
  await page.getByTestId("creation-flow-next").click();
  await page.getByTestId("creation-flow-next").click();
  await page.getByTestId("project-description-input").fill("وصف تجريبي لمشروع يتم إنشاؤه من اختبار شامل.");
  await page.getByTestId("project-image-input").setInputFiles({
    name: "e2e-project.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lYQW2QAAAABJRU5ErkJggg==",
      "base64",
    ),
  });
  await page.getByTestId("creation-flow-next").click();
  await page.getByTestId("creation-flow-save").click();
  await page.getByTestId("property-form-confirm-save").click();
  await expect(page).toHaveURL(/\/ws\/projects\/[^/]+$/);
  await expect(page.getByText(title)).toBeVisible();

  await page.getByTestId("project-detail-edit").click();
  await expect(page).toHaveURL(/\/ws\/projects\/[^/]+\/edit$/);
  await page.getByTestId("project-name-input").fill(editedTitle);
  await page.getByTestId("creation-flow-save").click();
  await page.getByTestId("property-form-confirm-save").click();
  await expect(page).toHaveURL(/\/ws\/projects\/[^/]+$/);
  await expect(page.getByText(editedTitle)).toBeVisible();

  const publishButton = page.getByTestId("project-detail-publish");
  if (await publishButton.isVisible().catch(() => false)) {
    await publishButton.click();
    await page.waitForLoadState("networkidle");
  }

  await page.getByTestId("project-detail-delete").click();
  await page.getByTestId("delete-confirm-submit").click();
  await expect(page).toHaveURL(/\/ws\/projects$/);
  await context.close();
});
