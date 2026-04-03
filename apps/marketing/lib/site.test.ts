import { afterEach, describe, expect, it } from "vitest";
import { getAssistantUrl, getMarketingBaseUrl, getPartnerUrl, getReferenceLinks, getWorkspaceEntryUrl } from "./site";

const ORIGINAL_ENV = {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  SITE_URL: process.env.SITE_URL,
  VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
  VERCEL_URL: process.env.VERCEL_URL,
  NEXT_PUBLIC_WORKSPACE_ENTRY_URL: process.env.NEXT_PUBLIC_WORKSPACE_ENTRY_URL,
  NEXT_PUBLIC_ASSISTANT_URL: process.env.NEXT_PUBLIC_ASSISTANT_URL,
};

afterEach(() => {
  process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL_ENV.NEXT_PUBLIC_SITE_URL;
  process.env.SITE_URL = ORIGINAL_ENV.SITE_URL;
  process.env.VERCEL_PROJECT_PRODUCTION_URL = ORIGINAL_ENV.VERCEL_PROJECT_PRODUCTION_URL;
  process.env.VERCEL_URL = ORIGINAL_ENV.VERCEL_URL;
  process.env.NEXT_PUBLIC_WORKSPACE_ENTRY_URL =
    ORIGINAL_ENV.NEXT_PUBLIC_WORKSPACE_ENTRY_URL;
  process.env.NEXT_PUBLIC_ASSISTANT_URL = ORIGINAL_ENV.NEXT_PUBLIC_ASSISTANT_URL;
});

describe("site helpers", () => {
  it("prefers explicit marketing site url", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "marketing.anan.sa";
    expect(getMarketingBaseUrl().toString()).toBe("https://marketing.anan.sa/");
  });

  it("reads the editable reference links file for app entry points", () => {
    expect(getWorkspaceEntryUrl()).toBe("http://localhost:3000/signin");
    expect(getAssistantUrl()).toBe("http://localhost:3101/app");
    expect(getPartnerUrl()).toBe("http://localhost:3000/partners");
  });

  it("exposes contact details from the reference links file", () => {
    expect(getReferenceLinks().contact.email).toBe("info@anan.sa");
    expect(getReferenceLinks().contact.phone).toBe("920000000");
  });
});
