import { expect, it } from "vitest";
import { WEB_LOCALE_COOKIE } from "@/lib/locale";
import { POST } from "./route";

it("persists supported locales in the web locale cookie", async () => {
  const response = await POST(
    new Request("http://localhost/api/locale", {
      method: "POST",
      body: JSON.stringify({ locale: "fr" }),
      headers: {
        "Content-Type": "application/json",
      },
    }),
  );

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ locale: "fr" });
  expect(response.cookies.get(WEB_LOCALE_COOKIE)?.value).toBe("fr");
});

it("falls back to Arabic when an unsupported locale is submitted", async () => {
  const response = await POST(
    new Request("http://localhost/api/locale", {
      method: "POST",
      body: JSON.stringify({ locale: "es" }),
      headers: {
        "Content-Type": "application/json",
      },
    }),
  );

  await expect(response.json()).resolves.toEqual({ locale: "ar" });
  expect(response.cookies.get(WEB_LOCALE_COOKIE)?.value).toBe("ar");
});
