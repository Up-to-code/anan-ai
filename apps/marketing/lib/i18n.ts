import type { AppLocale } from "./locale";
import { getMarketingContent } from "./marketing-content";

export type WebDictionary = {
  nav: {
    home: string;
    assistant: string;
    workspace: string;
    developer: string;
    broker: string;
    about: string;
    docs: string;
    contact: string;
    workspaceSignIn: string;
    assistantTitle: string;
    switchLanguage: string;
    activateLightMode: string;
    activateDarkMode: string;
  };
  footer: {
    brandTitle: string;
    description: string;
    platform: string;
    company: string;
    legal: string;
    developers: string;
    brokers: string;
    pricing: string;
    partnerships: string;
    docs: string;
    team: string;
    careers: string;
    privacy: string;
    terms: string;
    faq: string;
    blog: string;
    bottomTagline: string;
    copyright: string;
  };
  about: ReturnType<typeof getMarketingContent>["about"];
};

/**
 * WHY:   Locale-aware navigation and trust pages need a compact dictionary that matches the current public UI.
 * WHAT:  Returns the subset of marketing content consumed by shared public components.
 * HOW:   Maps from the centralized marketing content model instead of maintaining a second large translation tree.
 */
export function getWebDictionary(locale: AppLocale): WebDictionary {
  const content = getMarketingContent(locale);

  return {
    nav: content.nav,
    footer: content.footer,
    about: content.about,
  };
}
