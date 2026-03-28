"use client";

import posthog from "posthog-js";

let isInitialized = false;

type AnalyticsValue = string | number | boolean | null | undefined;

function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

/**
 * WHY:   The web app needs one safe PostHog entrypoint so client code can emit analytics without repeating guards.
 * WHAT:  Initializes the browser SDK once and exposes tiny helpers for event capture.
 * HOW:   No-ops when the public token/host are missing and keeps payloads JSON-safe.
 */
export function initializePostHog({
  token,
  host,
  appName,
}: {
  token?: string;
  host?: string;
  appName: "web";
}) {
  if (isInitialized) return;
  if (!token?.trim() || !host?.trim()) return;

  posthog.init(token.trim(), {
    api_host: trimTrailingSlash(host.trim()),
    capture_pageview: false,
    autocapture: false,
    persistence: "localStorage+cookie",
    person_profiles: "identified_only",
    loaded(instance) {
      instance.register({ app_name: appName });
    },
  });

  isInitialized = true;
}

/**
 * WHY:   UI code should be able to emit business events without caring whether PostHog finished booting.
 * WHAT:  Sends a browser analytics event with optional JSON-safe properties.
 * HOW:   Defers to the shared `posthog-js` singleton and silently skips undefined values.
 */
export function capturePostHogEvent(
  event: string,
  properties: Record<string, AnalyticsValue> = {},
) {
  const payload = Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined),
  );
  posthog.capture(event, payload);
}

/**
 * WHY:   Auth flows need a single browser-side identification bridge once the app knows the user identity.
 * WHAT:  Associates the current PostHog session with a stable user id.
 * HOW:   Calls `identify` only when a non-empty id is available.
 */
export function identifyPostHogUser(userId?: string | null) {
  if (!userId?.trim()) return;
  posthog.identify(userId.trim());
}

/**
 * WHY:   Some flows may sign the user out and should clear the browser identity cleanly.
 * WHAT:  Resets the current PostHog person state.
 * HOW:   Delegates to the SDK singleton.
 */
export function resetPostHogUser() {
  posthog.reset();
}

/**
 * WHY:   Server-rendered links and buttons can still describe analytics clicks through data attributes.
 * WHAT:  Extracts analytics properties from `data-analytics-*` attributes on the clicked element.
 * HOW:   Reads camel-cased dataset keys and normalizes them into small snake_case-like property names.
 */
export function extractAnalyticsDataset(element: HTMLElement) {
  const event = element.dataset.analyticsEvent;
  if (!event) return null;

  const properties: Record<string, AnalyticsValue> = {};
  for (const [key, value] of Object.entries(element.dataset)) {
    if (!key.startsWith("analytics") || key === "analyticsEvent" || value === undefined) continue;
    const propertyName = key.slice("analytics".length);
    const normalizedName = propertyName.charAt(0).toLowerCase() + propertyName.slice(1);
    properties[normalizedName] = value;
  }

  return { event, properties };
}
