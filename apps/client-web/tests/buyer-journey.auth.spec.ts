import { expect, test } from "@playwright/test";

const storageStatePath = process.env.PLAYWRIGHT_CLIENT_STORAGE_STATE?.trim();
const BUYER_PROMPT = "أريد شقة في الياسمين الرياض مع تمويل ومستشار";

if (storageStatePath) {
  test.use({ storageState: storageStatePath });
}

test("authenticated buyer journey creates a qualified advisor handoff and returns to the saved thread", async ({ page }) => {
  test.skip(!storageStatePath, "PLAYWRIGHT_CLIENT_STORAGE_STATE is required for authenticated client-web handoff e2e.");

  await page.goto("/");

  await page.getByTestId("client-chat-input").fill(BUYER_PROMPT);
  await page.getByTestId("client-chat-send").click();

  await expect(page.getByTestId("client-ag-ui-card-property_shortlist")).toBeVisible();
  await expect(page.getByTestId("client-request-advisor")).toBeVisible();

  await page.getByTestId("client-request-advisor").click();

  await expect(page).toHaveURL(/\/app\/handoff\?orderId=/);
  await expect(page.getByTestId("client-handoff-summary")).toBeVisible();
  await expect(page.getByTestId("client-handoff-summary")).toContainText("qualified");
  await expect(page.getByTestId("client-handoff-summary")).toContainText("web");

  await page.getByRole("link", { name: /Back to assistant|العودة إلى المساعد/ }).click();
  await expect(page).toHaveURL(/\/app\?threadId=/);
});
