import { expect, test } from "@playwright/test";

const BUYER_PROMPT = "أريد شقة في الياسمين الرياض مع تمويل ومستشار";

test("guest buyer journey renders deterministic AI cards and gates advisor handoff behind sign-in", async ({ page }) => {
  const chatInput = page.locator('[data-testid="client-chat-input"]:visible');
  const chatSend = page.locator('[data-testid="client-chat-send"]:visible');
  const authGate = page.locator('[data-testid="client-auth-gate"]:visible');
  const authGateSignInLink = page.locator('[data-testid="client-auth-gate-signin-link"]:visible');
  const financeCta = page.locator('[data-testid="client-property-finance-cta"]:visible');

  await page.goto("/");

  await page.getByRole("link", { name: /Open assistant|افتح المساعد|Ouvrir l’assistant/ }).click();
  await chatInput.fill(BUYER_PROMPT);
  await chatSend.click();

  await expect(page.getByTestId("client-assistant-thread")).toBeVisible();
  await expect(page.getByTestId("client-ag-ui-card-property_shortlist")).toBeVisible();
  await expect(page.getByTestId("client-ag-ui-card-loan_calculator").first()).toBeVisible();
  await expect(page.getByTestId("client-ag-ui-card-bank_offer").first()).toBeVisible();

  await page.getByTestId("client-property-result-link").first().click();
  await expect(page).toHaveURL(/\/app\/property\/[^/]+$/);

  await financeCta.click();
  await expect(page).toHaveURL(/\/app\?propertyId=/);
  await chatInput.fill("أريد مستشاراً");
  await chatSend.click();
  await expect(authGate).toBeVisible();
  await expect(authGateSignInLink).toHaveAttribute("href", /\/signin\?intent=advisor&returnTo=\/app/);

  await page.goto("/search");
  await expect(page).toHaveURL(/\/search$/);
  await page.getByPlaceholder("ابحث عن شقة أو منطقة أو مدينة").fill("الياسمين");
  await expect(page.getByTestId("client-search-property-link").first()).toBeVisible();
  await page.getByTestId("client-search-property-link").first().click();
  await expect(page).toHaveURL(/\/app\/property\/[^/]+$/);
  await expect(page.getByTestId("client-property-detail")).toBeVisible();

  await page.goto("/app/history");
  await expect(page).toHaveURL(/\/app\/history$/);
  await expect(page.getByText(/لا توجد محادثات محفوظة بعد/)).toBeVisible();
});
