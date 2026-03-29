import { expect, test } from "@playwright/test";

const BUYER_PROMPT = "أريد شقة في الياسمين الرياض مع تمويل ومستشار";

test("guest buyer journey renders deterministic AI cards and gates advisor handoff behind sign-in", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("client-chat-input").fill(BUYER_PROMPT);
  await page.getByTestId("client-chat-send").click();

  await expect(page.getByTestId("client-assistant-thread")).toBeVisible();
  await expect(page.getByTestId("client-ag-ui-card-property_shortlist")).toBeVisible();
  await expect(page.getByTestId("client-ag-ui-card-loan_calculator").first()).toBeVisible();
  await expect(page.getByTestId("client-ag-ui-card-bank_offer").first()).toBeVisible();
  await expect(page.getByTestId("client-ag-ui-card-followup_prompt")).toBeVisible();

  await page.getByTestId("client-property-result-link").first().click();
  await expect(page).toHaveURL(/\/app\/property\/[^/]+$/);

  await page.getByTestId("client-property-finance-cta").click();
  await expect(page).toHaveURL(/\/\?prompt=/);
  await expect(page.getByTestId("client-ag-ui-card-loan_calculator").first()).toBeVisible();

  await page.getByTestId("client-request-advisor").click();
  await expect(page.getByTestId("client-auth-gate")).toBeVisible();
  await expect(page.getByTestId("client-auth-gate-signin-link").first()).toHaveAttribute("href", /\/signin\?returnTo=%2F/);
});
